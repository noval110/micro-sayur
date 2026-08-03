package model

import "time"

type Product struct {
	ID        int64   `gorm:"primaryKey"`
	Name      string  `gorm:"type:varchar(255);not null"`
	Category  string  `gorm:"type:varchar(100);not null"`
	Price     float64 `gorm:"type:decimal(10,2);not null"`
	Stock     int     `gorm:"not null"`
	Unit      string  `gorm:"type:varchar(50)"`
	Image     string  `gorm:"type:varchar(255)"`
	Rating    float64 `gorm:"type:decimal(2,1);default:0.0"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `gorm:"index"`
}
