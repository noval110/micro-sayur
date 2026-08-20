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
}

type paymentService struct {
	repo        repository.PaymentRepository
	orderClient client.OrderClient
	userClient  client.UserClient
}

func NewPaymentService(
	repo repository.PaymentRepository,
	orderClient client.OrderClient,
	userClient client.UserClient,
) PaymentService {
	return &paymentService{
		repo:        repo,
		orderClient: orderClient,
		userClient:  userClient,
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
			return nil, errors.New(
				"pembayaran untuk order ini sedang diproses",
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
