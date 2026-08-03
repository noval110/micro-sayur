package model

import "time"

type UserRole struct {
	ID			int64 `gorm:"primaryKey"`
	RoleID		int64 `gorm:"primaryKey"`
	UserID		int64 `gorm:"primaryKey"`
	CreatedAt	time.Time
	UpdatedAt	time.Time
	DeletedAt	*time.Time

}

type Tabler interface {
	TableName() string
}

func (UserRole) TableName() string {
    return "user_roles"
}