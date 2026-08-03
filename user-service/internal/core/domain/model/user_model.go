package model

import "time"

type User struct {
	ID         int64      `gorm:"primaryKey"`
	Name       string
	Email      string     `gorm:"unique;not null"`
	Password   string    `gorm:"type:text;not null"`
	Address    string
	Phone      string
	Photo      string
	Lat        string
	Lng        string
	IsVerified bool       `gorm:"default:false"` 
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  *time.Time
	Roles      []Role     `gorm:"many2many:user_role;"` 
}