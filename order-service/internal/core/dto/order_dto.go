package dto

type CreateOrderItemRequest struct {
	ProductID   int     `json:"product_id" validate:"required"`
	ProductName string  `json:"product_name"`
	Price       float64 `json:"price" validate:"required"`
	Quantity    int     `json:"quantity" validate:"required,min=1"`
}

type CreateOrderRequest struct {
	UserID int                      `json:"user_id" validate:"required"`
	Items  []CreateOrderItemRequest `json:"items" validate:"required,dive"`
}
