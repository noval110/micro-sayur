package main

import (
	"log"
	"net/http"
	"os"

	"payment-service/config"
	"payment-service/internal/client"
	"payment-service/internal/handler"
	authmiddleware "payment-service/internal/middleware"
	"payment-service/internal/repository"
	"payment-service/internal/service"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db := config.InitDB()
	defer db.Close()
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
	}))

	orderURL := os.Getenv("ORDER_SERVICE_URL")
	if orderURL == "" {
		orderURL = "http://order_service:8082"
	}
	internalKey := os.Getenv("INTERNAL_SERVICE_KEY")
	if internalKey == "" {
		log.Fatal("INTERNAL_SERVICE_KEY wajib diisi")
	}
	orderClient := client.NewOrderClient(orderURL, internalKey)
	paymentRepo := repository.NewPaymentRepository(db)
	paymentService := service.NewPaymentService(paymentRepo, orderClient)
	paymentHandler := handler.NewPaymentHandler(paymentService)
	auth := authmiddleware.NewAuthMiddleware()

	e.POST("/payments/pay", paymentHandler.PayOrder, auth.Authenticated)
	e.GET("/payments/order/:order_id", paymentHandler.GetByOrderID, auth.Authenticated)
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{"service": "payment-service", "status": "healthy"})
	})

	log.Println("Payment-Service berjalan di port 8083...")
	if err := e.Start(":8083"); err != nil {
		log.Fatalf("Gagal menjalankan payment-service: %v", err)
	}
}
