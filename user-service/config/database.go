package config

import (
	"fmt"
	"os"
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
	dbConnString := os.Getenv("DATABASE_URL")
	if dbConnString == "" {
		dbConnString = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
			cfg.Psql.User,
			cfg.Psql.Password,
			cfg.Psql.Host,
			cfg.Psql.Port,
			cfg.Psql.Dbname,
		)
	}

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

	if err := db.AutoMigrate(&model.Role{}, &model.User{}, &model.VerificationToken{}); err != nil {
		log.Error().Err(err).Msg("[ConnectionPostgres-3] Failed to migrate user tables")
		return nil, err
	}

	seeds.SeedRoles(db)
	seeds.SeedAdmin(db)

	sqlDB.SetMaxOpenConns(cfg.Psql.DBmaxOpen)
	sqlDB.SetMaxIdleConns(cfg.Psql.DBmaxIdle)

	return &Postgres{DB: db}, nil
}
