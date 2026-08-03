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
	CreateOrder(ctx context.Context, req dto.CreateOrderRequest) (*domain.Order, error)
	GetAllOrders(ctx context.Context) ([]domain.Order, error)
	GetOrderByID(ctx context.Context, id int) (*domain.Order, error)
	UpdateOrderStatus(ctx context.Context, id int, status string) error
}

type orderService struct {
	repo          repository.OrderRepository
	productClient client.ProductClient
}

func NewOrderService(repo repository.OrderRepository, productClient client.ProductClient) OrderService {
	return &orderService{
		repo:          repo,
		productClient: productClient,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, req dto.CreateOrderRequest) (*domain.Order, error) {
	var totalPrice float64
	var orderItems []domain.OrderItem

	for _, item := range req.Items {
		product, err := s.productClient.GetProductByID(item.ProductID)
		if err != nil {
			return nil, err
		}

		if product.Data.Stock < item.Quantity {
			return nil, fmt.Errorf("stok untuk produk '%s' tidak mencukupi (sisa: %d)", product.Data.Name, product.Data.Stock)
		}

		totalPrice += product.Data.Price * float64(item.Quantity)
		orderItems = append(orderItems, domain.OrderItem{
			ProductID:   item.ProductID,
			ProductName: product.Data.Name,
			Price:       product.Data.Price,
			Quantity:    item.Quantity,
		})
	}

	order := &domain.Order{
		UserID:     req.UserID,
		TotalPrice: totalPrice,
		Status:     "PENDING",
		Items:      orderItems,
	}

	if err := s.repo.CreateOrder(ctx, order); err != nil {
		return nil, err
	}

	for _, item := range order.Items {
		if err := s.productClient.ReduceStock(item.ProductID, item.Quantity); err != nil {
			return nil, fmt.Errorf("gagal memotong stok untuk produk ID %d: %w", item.ProductID, err)
		}
	}

	return order, nil
}

func (s *orderService) GetAllOrders(ctx context.Context) ([]domain.Order, error) {
	return s.repo.GetAllOrders(ctx)
}

func (s *orderService) GetOrderByID(ctx context.Context, id int) (*domain.Order, error) {
	return s.repo.GetOrderByID(ctx, id)
}

func (s *orderService) UpdateOrderStatus(ctx context.Context, id int, status string) error {
	if status != "PAID" {
		return fmt.Errorf("status order tidak didukung: %s", status)
	}

	return s.repo.UpdateOrderStatus(ctx, id, status)
}
