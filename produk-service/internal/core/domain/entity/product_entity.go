package entity

type ProductEntity struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Price    float64 `json:"price"`
	Stock    int     `json:"stock"`
	Unit     string  `json:"unit"`
	Image    string  `json:"image"`
	Rating   float64 `json:"rating"`
}
