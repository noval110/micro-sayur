package repository

import (
	"context"
	"database/sql"

	"github.com/micro-sayur/order-service/internal/core/domain"
)

type OrderRepository interface {
	CreateOrder(
		ctx context.Context,
		order *domain.Order,
	) error

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

type orderRepository struct {
	db *sql.DB
}

func NewOrderRepository(
	db *sql.DB,
) OrderRepository {

	return &orderRepository{
		db: db,
	}
}

// ==========================================
// CREATE ORDER
// ==========================================

func (r *orderRepository) CreateOrder(
	ctx context.Context,
	order *domain.Order,
) error {

	tx, err := r.db.BeginTx(
		ctx,
		nil,
	)

	if err != nil {
		return err
	}

	defer tx.Rollback()

	queryOrder := `
		INSERT INTO orders (
			user_id,
			total_price,
			status,
			delivery_address,
			delivery_notes
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING
			id,
			created_at,
			updated_at
	`

	err = tx.QueryRowContext(
		ctx,
		queryOrder,
		order.UserID,
		order.TotalPrice,
		"PENDING",
		order.DeliveryAddress,
		order.DeliveryNotes,
	).Scan(
		&order.ID,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err != nil {
		return err
	}

	queryItem := `
		INSERT INTO order_items (
			order_id,
			product_id,
			product_name,
			price,
			quantity
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	for i := range order.Items {

		order.Items[i].OrderID =
			order.ID

		err = tx.QueryRowContext(
			ctx,
			queryItem,
			order.ID,
			order.Items[i].ProductID,
			order.Items[i].ProductName,
			order.Items[i].Price,
			order.Items[i].Quantity,
		).Scan(
			&order.Items[i].ID,
		)

		if err != nil {
			return err
		}
	}

	order.Status = "PENDING"

	return tx.Commit()
}

// ==========================================
// GET ORDER ITEMS
// Helper internal repository
// ==========================================

func (r *orderRepository) getOrderItems(
	ctx context.Context,
	orderID int,
) ([]domain.OrderItem, error) {

	query := `
		SELECT
			id,
			order_id,
			product_id,
			product_name,
			price,
			quantity
		FROM order_items
		WHERE order_id = $1
		ORDER BY id ASC
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		orderID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items := make(
		[]domain.OrderItem,
		0,
	)

	for rows.Next() {

		var item domain.OrderItem

		err := rows.Scan(
			&item.ID,
			&item.OrderID,
			&item.ProductID,
			&item.ProductName,
			&item.Price,
			&item.Quantity,
		)

		if err != nil {
			return nil, err
		}

		items = append(
			items,
			item,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

// ==========================================
// GET ALL ORDERS
// Admin
// ==========================================

func (r *orderRepository) GetAllOrders(
	ctx context.Context,
) ([]domain.Order, error) {

	query := `
		SELECT
			id,
			user_id,
			total_price,
			status,
			delivery_address,
			delivery_notes,
			created_at,
			updated_at
		FROM orders
		ORDER BY id DESC
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	orders := make(
		[]domain.Order,
		0,
	)

	for rows.Next() {

		var order domain.Order

		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.TotalPrice,
			&order.Status,
			&order.DeliveryAddress,
			&order.DeliveryNotes,
			&order.CreatedAt,
			&order.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		orders = append(
			orders,
			order,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Ambil item setiap order
	for i := range orders {

		items, err :=
			r.getOrderItems(
				ctx,
				orders[i].ID,
			)

		if err != nil {
			return nil, err
		}

		orders[i].Items = items
	}

	return orders, nil
}

// ==========================================
// GET MY ORDERS
// ==========================================

func (r *orderRepository) GetOrdersByUserID(
	ctx context.Context,
	userID int,
) ([]domain.Order, error) {

	query := `
		SELECT
			id,
			user_id,
			total_price,
			status,
			delivery_address,
			delivery_notes,
			created_at,
			updated_at
		FROM orders
		WHERE user_id = $1
		ORDER BY id DESC
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	orders := make(
		[]domain.Order,
		0,
	)

	for rows.Next() {

		var order domain.Order

		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.TotalPrice,
			&order.Status,
			&order.DeliveryAddress,
			&order.DeliveryNotes,
			&order.CreatedAt,
			&order.UpdatedAt,
		)

		if err != nil {
			return nil, err
		}

		orders = append(
			orders,
			order,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Ambil item produk setiap pesanan
	for i := range orders {

		items, err :=
			r.getOrderItems(
				ctx,
				orders[i].ID,
			)

		if err != nil {
			return nil, err
		}

		orders[i].Items = items
	}

	return orders, nil
}

// ==========================================
// GET ORDER BY ID
// ==========================================

func (r *orderRepository) GetOrderByID(
	ctx context.Context,
	id int,
) (*domain.Order, error) {

	var order domain.Order

	query := `
		SELECT
			id,
			user_id,
			total_price,
			status,
			delivery_address,
			delivery_notes,
			created_at,
			updated_at
		FROM orders
		WHERE id = $1
	`

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.TotalPrice,
		&order.Status,
		&order.DeliveryAddress,
		&order.DeliveryNotes,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	items, err :=
		r.getOrderItems(
			ctx,
			order.ID,
		)

	if err != nil {
		return nil, err
	}

	order.Items = items

	return &order, nil
}

// ==========================================
// UPDATE STATUS
// ==========================================

func (r *orderRepository) UpdateOrderStatus(
	ctx context.Context,
	id int,
	status string,
) error {

	query := `
		UPDATE orders
		SET
			status = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		status,
		id,
	)

	if err != nil {
		return err
	}

	rowsAffected, err :=
		result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
