package domain

import "time"

type Payment struct {
	ID              int       `json:"id"`
	OrderID         int       `json:"order_id"`
	UserID          int       `json:"user_id"`
	Amount          float64   `json:"amount"`
	Method          string    `json:"method"`
	Status          string    `json:"status"`
	TransactionCode string    `json:"transaction_code"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
