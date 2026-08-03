package repository

import (
	"context"
	"database/sql"
	"errors"
	"github.com/micro-sayur/order-service/internal/core/domain"
)

var ErrOrderNotPending = errors.New("order tidak ditemukan atau statusnya bukan PENDING")

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *domain.Order) error
	GetAllOrders(ctx context.Context) ([]domain.Order, error)
	GetOrderByID(ctx context.Context, id int) (*domain.Order, error)
	UpdateOrderStatus(ctx context.Context, id int, status string) error
}

type orderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) CreateOrder(ctx context.Context, order *domain.Order) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	queryOrder := `INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at`
	err = tx.QueryRowContext(ctx, queryOrder, order.UserID, order.TotalPrice, "PENDING").Scan(&order.ID, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return err
	}

	queryItem := `INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	for i := range order.Items {
		order.Items[i].OrderID = order.ID
		err = tx.QueryRowContext(ctx, queryItem, order.ID, order.Items[i].ProductID, order.Items[i].ProductName, order.Items[i].Price, order.Items[i].Quantity).Scan(&order.Items[i].ID)
		if err != nil {
			return err
		}
	}

	order.Status = "PENDING"
	return tx.Commit()
}

func (r *orderRepository) GetAllOrders(ctx context.Context) ([]domain.Order, error) {
	query := `SELECT id, user_id, total_price, status, created_at, updated_at FROM orders ORDER BY id DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []domain.Order
	for rows.Next() {
		var order domain.Order
		if err := rows.Scan(&order.ID, &order.UserID, &order.TotalPrice, &order.Status, &order.CreatedAt, &order.UpdatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return orders, nil
}

func (r *orderRepository) GetOrderByID(ctx context.Context, id int) (*domain.Order, error) {
	var order domain.Order
	queryOrder := `SELECT id, user_id, total_price, status, created_at, updated_at FROM orders WHERE id = $1`
	if err := r.db.QueryRowContext(ctx, queryOrder, id).Scan(&order.ID, &order.UserID, &order.TotalPrice, &order.Status, &order.CreatedAt, &order.UpdatedAt); err != nil {
		return nil, err
	}

	queryItems := `SELECT id, order_id, product_id, product_name, price, quantity FROM order_items WHERE order_id = $1`
	rows, err := r.db.QueryContext(ctx, queryItems, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item domain.OrderItem
		if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.ProductName, &item.Price, &item.Quantity); err != nil {
			return nil, err
		}
		order.Items = append(order.Items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *orderRepository) UpdateOrderStatus(ctx context.Context, id int, status string) error {
	result, err := r.db.ExecContext(ctx,
		`UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = 'PENDING'`,
		status, id,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrOrderNotPending
	}

	return nil
}
