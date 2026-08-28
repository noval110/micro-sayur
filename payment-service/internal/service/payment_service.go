package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"payment-service/internal/client"
	"payment-service/internal/domain"
	"payment-service/internal/massage"
	"payment-service/internal/repository"
)

var (
	ErrForbidden            = errors.New("anda tidak memiliki akses ke order ini")
	ErrOrderAlreadyPaid     = errors.New("order ini sudah dibayar sebelumnya")
	ErrOrderNotPayable      = errors.New("order tidak dapat dibayar")
	ErrInvalidPaymentMethod = errors.New("metode pembayaran wajib diisi")
)

type PayRequest struct {
	OrderID int    `json:"order_id"`
	Method  string `json:"method"`
}

type PaymentService interface {
	Pay(context.Context, int, PayRequest) (*domain.Payment, error)
	GetByOrderID(context.Context, int, int) (*domain.Payment, error)
	CheckPaymentStatus(context.Context, int, int) (*domain.Payment, error)
}

type paymentService struct {
	repo            repository.PaymentRepository
	orderClient     client.OrderClient
	userClient      client.UserClient
	paydisiniClient client.PaydisiniClient
}

func NewPaymentService(
	repo repository.PaymentRepository,
	orderClient client.OrderClient,
	userClient client.UserClient,
	paydisiniClient client.PaydisiniClient,
) PaymentService {
	return &paymentService{
		repo:            repo,
		orderClient:     orderClient,
		userClient:      userClient,
		paydisiniClient: paydisiniClient,
	}
}

func (s *paymentService) Pay(ctx context.Context, userID int, req PayRequest) (*domain.Payment, error) {
	method := strings.ToUpper(strings.TrimSpace(req.Method))
	if method == "" {
		return nil, ErrInvalidPaymentMethod
	}
	order, err := s.orderClient.GetOrderByID(req.OrderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, ErrForbidden
	}
	if strings.EqualFold(order.Status, "PAID") {
		return nil, ErrOrderAlreadyPaid
	}
	if !strings.EqualFold(order.Status, "PENDING") {
		return nil, ErrOrderNotPayable
	}

	existingPayment, existingErr := s.repo.GetByOrderID(
		ctx,
		req.OrderID,
	)
	if existingErr != nil && !errors.Is(existingErr, repository.ErrPaymentNotFound) {
		return nil, existingErr
	}
	if existingErr == nil {
		if strings.EqualFold(existingPayment.Status, "SUCCESS") {
			return nil, errors.New(
				"pembayaran untuk order ini sudah berhasil",
			)
		}
		if strings.EqualFold(existingPayment.Status, "PENDING") {
			// Jika metode sama, kembalikan payment yang sudah ada (jangan error)
			// Ini berguna agar jika user menutup modal QRIS lalu membukanya lagi, 
			// QR code lama bisa langsung ditampilkan tanpa memanggil API pihak ketiga lagi.
			if strings.EqualFold(existingPayment.Method, method) {
				return existingPayment, nil
			}
			return nil, errors.New(
				"pembayaran untuk order ini sedang diproses dengan metode lain",
			)
		}
	}

	payment := &domain.Payment{
		OrderID:         req.OrderID,
		UserID:          userID,
		Amount:          order.TotalPrice,
		Method:          method,
		Status:          "PENDING",
		TransactionCode: fmt.Sprintf("PAY-%d-%d", req.OrderID, time.Now().UnixNano()),
	}

	if method == "QRIS" {
		note := fmt.Sprintf("Pembayaran Pesanan #%d", req.OrderID)
		paydisiniData, err := s.paydisiniClient.CreateTransaction(payment.TransactionCode, payment.Amount, note)
		if err != nil {
			return nil, fmt.Errorf("gagal membuat transaksi QRIS: %v", err)
		}
		payment.PaydisiniData = paydisiniData
		if err := s.repo.Create(ctx, payment); err != nil {
			return nil, err
		}
		// Biarkan status PENDING, user akan cek status manual
		return payment, nil
	}

	if err := s.repo.Create(ctx, payment); err != nil {
		return nil, err
	}
	if err := s.orderClient.UpdateOrderStatus(req.OrderID, "PAID"); err != nil {
		_ = s.repo.UpdateStatus(ctx, payment.ID, "FAILED")
		payment.Status = "FAILED"
		return nil, fmt.Errorf("pembayaran gagal: %w", err)
	}
	if err := s.repo.UpdateStatus(ctx, payment.ID, "SUCCESS"); err != nil {
		return nil, fmt.Errorf(
			"gagal menyelesaikan status pembayaran: %w",
			err,
		)
	}
	payment.Status = "SUCCESS"

	user, err := s.userClient.GetUserByID(userID)
	if err != nil {
		log.Printf(
			"gagal mengambil user untuk notifikasi: %v",
			err,
		)
	} else {
		message := fmt.Sprintf(
			"Pembayaran untuk pesanan #%d sebesar Rp%.0f telah berhasil. Terima kasih sudah berbelanja di Sayur-day.",
			req.OrderID,
			payment.Amount,
		)

		if err := massage.PublishPaymentNotification(
			user.Email,
			"Pembayaran Berhasil - Sayur-day",
			message,
		); err != nil {
			log.Printf(
				"gagal publish notifikasi pembayaran: %v",
				err,
			)
		} else {
			log.Printf(
				"notifikasi pembayaran berhasil dipublish untuk %s",
				user.Email,
			)
		}
	}

	return payment, nil
}

func (s *paymentService) CheckPaymentStatus(ctx context.Context, userID, orderID int) (*domain.Payment, error) {
	payment, err := s.GetByOrderID(ctx, userID, orderID)
	if err != nil {
		return nil, err
	}

	if payment.Method != "QRIS" || payment.Status != "PENDING" {
		return payment, nil
	}

	paydisiniStatus, err := s.paydisiniClient.CheckTransactionStatus(payment.TransactionCode)
	if err != nil {
		return nil, fmt.Errorf("gagal cek status: %v", err)
	}

	if strings.EqualFold(paydisiniStatus, "Success") {
		if err := s.orderClient.UpdateOrderStatus(orderID, "PAID"); err != nil {
			return nil, fmt.Errorf("berhasil dibayar tapi gagal update order: %w", err)
		}
		if err := s.repo.UpdateStatus(ctx, payment.ID, "SUCCESS"); err != nil {
			return nil, err
		}
		payment.Status = "SUCCESS"

		// Kirim Notifikasi
		user, err := s.userClient.GetUserByID(userID)
		if err == nil {
			message := fmt.Sprintf("Pembayaran QRIS untuk pesanan #%d sebesar Rp%.0f telah berhasil.", orderID, payment.Amount)
			_ = massage.PublishPaymentNotification(user.Email, "Pembayaran Berhasil - Sayur-day", message)
		}
	} else if strings.EqualFold(paydisiniStatus, "Canceled") {
		_ = s.repo.UpdateStatus(ctx, payment.ID, "FAILED")
		payment.Status = "FAILED"
	}

	return payment, nil
}

func (s *paymentService) GetByOrderID(ctx context.Context, userID, orderID int) (*domain.Payment, error) {
	order, err := s.orderClient.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, ErrForbidden
	}
	return s.repo.GetByOrderID(ctx, orderID)
}
