package config

import (
	"fmt"
	"user-service/database/seeds"
	"user-service/internal/core/domain/model"

	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Postgres struct {
	DB *gorm.DB
}

func (cfg Config) ConnectionPostgres() (*Postgres, error) {
	dbConnString := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.Psql.User,
		cfg.Psql.Password,
		cfg.Psql.Host,
		cfg.Psql.Port,
		cfg.Psql.Dbname,
	)

	db, err := gorm.Open(postgres.Open(dbConnString), &gorm.Config{})
	if err != nil {
		log.Error().Err(err).Msg("[ConnectionPostgres-1] Failed to connect to Postgres database on " + cfg.Psql.Host)
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Error().Err(err).Msg("[ConnectionPostgres-2] Failed to get database connection")
		return nil, err
	}

	db.Exec(`CREATE TABLE IF NOT EXISTS roles (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, deleted_at TIMESTAMP WITH TIME ZONE);`)
	db.Exec(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255), address TEXT, phone VARCHAR(50), photo VARCHAR(255), lat VARCHAR(50), lng VARCHAR(50), is_verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, deleted_at TIMESTAMP WITH TIME ZONE);`)
	db.Exec(`CREATE TABLE IF NOT EXISTS user_role (user_id INT, role_id INT, PRIMARY KEY (user_id, role_id));`)
	if err := db.AutoMigrate(&model.User{}, &model.VerificationToken{}); err != nil {
		log.Error().Err(err).Msg("[ConnectionPostgres-3] Failed to migrate user tables")
		return nil, err
	}

	seeds.SeedRoles(db)
	seeds.SeedAdmin(db)

	sqlDB.SetMaxOpenConns(cfg.Psql.DBmaxOpen)
	sqlDB.SetMaxIdleConns(cfg.Psql.DBmaxIdle)

	return &Postgres{DB: db}, nil
}
