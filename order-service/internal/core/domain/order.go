package domain

import "time"

type Order struct {
	ID              int         `json:"id"`
	UserID          int         `json:"user_id"`
	TotalPrice      float64     `json:"total_price"`
	Status          string      `json:"status"`
	DeliveryAddress string      `json:"delivery_address"`
	DeliveryNotes   string      `json:"delivery_notes"`
	Items           []OrderItem `json:"items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID          int     `json:"id"`
	OrderID     int     `json:"order_id"`
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
}
