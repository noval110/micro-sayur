package app

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"product-service/config"
	"product-service/internal/adapter/handler"
	"product-service/internal/adapter/repository"
	"product-service/internal/core/service"
	"product-service/utils/validator"

	"github.com/go-playground/validator/v10/translations/en"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func RunServer() {
	if os.Getenv("INTERNAL_SERVICE_KEY") == "" {
		log.Fatal("INTERNAL_SERVICE_KEY wajib diisi")
	}

	cfg := config.NewConfig()
	db, err := cfg.ConnectionPostgres()
	if err != nil {
		log.Fatalf("[RunServer-1] %v", err)
		return
	}

	productRepo := repository.NewProductRepository(db.DB)
	productService := service.NewProductService(productRepo)

	e := echo.New()
	e.Use(middleware.CORS())

	customValidator := validator.NewValidator()
	en.RegisterDefaultTranslations(customValidator.Validator, customValidator.Translator)
	e.Validator = customValidator

	handler.NewProductHandler(e, productService, cfg)

	go func() {
		port := cfg.App.AppPort
		if port == "" {
			port = "8081" // Default port untuk product-service
		}
		err = e.Start(":" + port)
		if err != nil {
			log.Fatalf("[RunServer-2] %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Print("[RunServer-3] Shutting down product-service...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	e.Shutdown(ctx)
}
