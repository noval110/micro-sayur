package request

type CreateProductRequest struct {
	Name     string  `json:"name" validate:"required"`
	Category string  `json:"category" validate:"required"`
	Price    float64 `json:"price" validate:"required,gt=0"`
	Stock    int     `json:"stock" validate:"required,gte=0"`
	Unit     string  `json:"unit" validate:"required"`
	Image    string  `json:"image"`
}
