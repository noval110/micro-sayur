package service

import (
	"context"
	"fmt"

	"github.com/micro-sayur/order-service/internal/adapter/client"
	"github.com/micro-sayur/order-service/internal/adapter/repository"
	"github.com/micro-sayur/order-service/internal/core/domain"
	"github.com/micro-sayur/order-service/internal/core/dto"
)

type OrderService interface {
	CreateOrder(
		ctx context.Context,
		req dto.CreateOrderRequest,
	) (*domain.Order, error)

	GetAllOrders(
		ctx context.Context,
	) ([]domain.Order, error)

	GetOrdersByUserID(
		ctx context.Context,
		userID int,
	) ([]domain.Order, error)

	GetOrderByID(
		ctx context.Context,
		id int,
	) (*domain.Order, error)

	UpdateOrderStatus(
		ctx context.Context,
		id int,
		status string,
	) error
}

type orderService struct {
	repo          repository.OrderRepository
	productClient client.ProductClient
}

func NewOrderService(
	repo repository.OrderRepository,
	productClient client.ProductClient,
) OrderService {

	return &orderService{
		repo:          repo,
		productClient: productClient,
	}
}
func (s *orderService) CreateOrder(
	ctx context.Context,
	req dto.CreateOrderRequest,
) (*domain.Order, error) {

	var totalPrice float64

	orderItems := make(
		[]domain.OrderItem,
		0,
	)

	for _, item := range req.Items {

		product, err :=
			s.productClient.GetProductByID(
				item.ProductID,
			)

		if err != nil {
			return nil, err
		}

		if product.Data.Stock <
			item.Quantity {

			return nil, fmt.Errorf(
				"stok untuk produk '%s' tidak mencukupi (sisa: %d)",
				product.Data.Name,
				product.Data.Stock,
			)
		}

		totalPrice +=
			product.Data.Price *
				float64(item.Quantity)

		orderItems = append(
			orderItems,
			domain.OrderItem{
				ProductID: item.ProductID,

				ProductName: product.Data.Name,

				Price: product.Data.Price,

				Quantity: item.Quantity,
			},
		)
	}
	shippingCost := 0.0

	if totalPrice > 0 &&
		totalPrice <= 100000 {

		shippingCost = 5000
	}

	totalPrice += shippingCost

	order := &domain.Order{
		UserID: req.UserID,

		TotalPrice: totalPrice,

		Status: "PENDING",

		DeliveryAddress: req.DeliveryAddress,

		DeliveryNotes: req.DeliveryNotes,

		Items: orderItems,
	}

	if err := s.repo.CreateOrder(
		ctx,
		order,
	); err != nil {

		return nil, err
	}

	// Potong stok setelah order dibuat
	for _, item := range order.Items {

		if err :=
			s.productClient.ReduceStock(
				item.ProductID,
				item.Quantity,
			); err != nil {

			return nil, fmt.Errorf(
				"gagal memotong stok untuk produk ID %d: %w",
				item.ProductID,
				err,
			)
		}
	}

	return order, nil
}
func (s *orderService) GetAllOrders(
	ctx context.Context,
) ([]domain.Order, error) {

	return s.repo.GetAllOrders(
		ctx,
	)
}
func (s *orderService) GetOrdersByUserID(
	ctx context.Context,
	userID int,
) ([]domain.Order, error) {

	return s.repo.GetOrdersByUserID(
		ctx,
		userID,
	)
}
func (s *orderService) GetOrderByID(
	ctx context.Context,
	id int,
) (*domain.Order, error) {

	return s.repo.GetOrderByID(
		ctx,
		id,
	)
}
func (s *orderService) UpdateOrderStatus(
	ctx context.Context,
	id int,
	newStatus string,
) error {
	order, err := s.repo.GetOrderByID(
		ctx,
		id,
	)
	if err != nil {
		return err
	}

	currentStatus := order.Status

	allowedTransitions := map[string]map[string]bool{
		"PENDING": {
			"PAID":      true,
			"CANCELLED": true,
		},
		"PAID": {
			"PROCESSING": true,
			"CANCELLED":  true,
		},
		"PROCESSING": {
			"SHIPPED":   true,
			"CANCELLED": true,
		},
		"SHIPPED": {
			"DONE": true,
		},
	}

	allowed := allowedTransitions[currentStatus][newStatus]
	if !allowed {
		return fmt.Errorf(
			"status tidak dapat diubah dari %s menjadi %s",
			currentStatus,
			newStatus,
		)
	}

	return s.repo.UpdateOrderStatus(
		ctx,
		id,
		newStatus,
	)
}
