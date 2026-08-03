package entity

import "time"

type VerificationTokenEntity struct {
	ID        int64     `gorm:"primaryKey"`
	UserID    int64     `gorm:"index"`
	Token     string  
	TokenType string    
	ExpiresAt time.Time
	User	  UserEntity

}