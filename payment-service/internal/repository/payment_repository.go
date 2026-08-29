package repository

import (
	"context"
	"database/sql"
	"errors"

	"payment-service/internal/domain"
)

var ErrPaymentNotFound = errors.New("payment tidak ditemukan")

type PaymentRepository interface {
	Create(context.Context, *domain.Payment) error
	GetByOrderID(context.Context, int) (*domain.Payment, error)
	UpdateStatus(context.Context, int, string) error
	UpdatePendingPayment(context.Context, *domain.Payment) error
}

type paymentRepository struct{ db *sql.DB }

func NewPaymentRepository(db *sql.DB) PaymentRepository { return &paymentRepository{db: db} }

func (r *paymentRepository) Create(ctx context.Context, p *domain.Payment) error {
	return r.db.QueryRowContext(ctx, `
		INSERT INTO payments (order_id, user_id, amount, method, status, transaction_code, paydisini_data)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`, p.OrderID, p.UserID, p.Amount, p.Method, p.Status, p.TransactionCode, p.PaydisiniData).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *paymentRepository) GetByOrderID(ctx context.Context, orderID int) (*domain.Payment, error) {
	p := new(domain.Payment)
	err := r.db.QueryRowContext(ctx, `
		SELECT id, order_id, user_id, amount, method, status, transaction_code, paydisini_data, created_at, updated_at
		FROM payments WHERE order_id = $1
	`, orderID).Scan(&p.ID, &p.OrderID, &p.UserID, &p.Amount, &p.Method, &p.Status, &p.TransactionCode, &p.PaydisiniData, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrPaymentNotFound
	}
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *paymentRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	result, err := r.db.ExecContext(ctx, `UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, status, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrPaymentNotFound
	}
	return nil
}

func (r *paymentRepository) UpdatePendingPayment(
	ctx context.Context,
	p *domain.Payment,
) error {
	result, err := r.db.ExecContext(
		ctx,
		`
		UPDATE payments
		SET
			amount = $1,
			method = $2,
			status = $3,
			transaction_code = $4,
			paydisini_data = $5,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $6
		`,
		p.Amount,
		p.Method,
		p.Status,
		p.TransactionCode,
		p.PaydisiniData,
		p.ID,
	)

	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrPaymentNotFound
	}

	return nil
}
