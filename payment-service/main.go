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

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	_ = godotenv.Load()

	db := config.InitDB()
	defer db.Close()
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			frontendURL,
			"http://localhost:3000",
			"https://micro-sayur.vercel.app",
		},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
	}))

	orderURL := os.Getenv("ORDER_SERVICE_URL")
	if orderURL == "" {
		orderURL = "http://127.0.0.1:8082"
	}
	userURL := os.Getenv("USER_SERVICE_URL")
	if userURL == "" {
		userURL = "http://127.0.0.1:8080"
	}
	internalKey := os.Getenv("INTERNAL_SERVICE_KEY")
	if internalKey == "" {
		log.Fatal("INTERNAL_SERVICE_KEY wajib diisi")
	}
	orderClient := client.NewOrderClient(orderURL, internalKey)
	userClient := client.NewUserClient(userURL, internalKey)
	paymentRepo := repository.NewPaymentRepository(db)
	paydisiniClient := client.NewPaydisiniClient()
	paymentService := service.NewPaymentService(
		paymentRepo,
		orderClient,
		userClient,
		paydisiniClient,
	)
	paymentHandler := handler.NewPaymentHandler(paymentService)
	auth := authmiddleware.NewAuthMiddleware()

	e.POST("/payments/pay", paymentHandler.PayOrder, auth.Authenticated)
	e.GET("/payments/order/:order_id", paymentHandler.GetByOrderID, auth.Authenticated)
	e.POST("/payments/order/:order_id/check-status", paymentHandler.CheckStatus, auth.Authenticated)
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{"service": "payment-service", "status": "healthy"})
	})

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8086"
	}

	log.Printf("Payment-Service berjalan di port %s...", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Gagal menjalankan payment-service: %v", err)
	}
}
