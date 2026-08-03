package app

import (
	"github.com/micro-sayur/order-service/config"
	"github.com/micro-sayur/order-service/internal/adapter/client"
	"github.com/micro-sayur/order-service/internal/adapter/handler"
	"github.com/micro-sayur/order-service/internal/adapter/repository"
	"github.com/micro-sayur/order-service/internal/core/service"
	"github.com/micro-sayur/order-service/utils/validator"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func StartApp() {
	// Inisialisasi DB
	db := config.InitDB()
	defer db.Close()

	productServiceURL := os.Getenv("PRODUCT_SERVICE_URL")
	if productServiceURL == "" {
		productServiceURL = "http://127.0.0.1:8081"
	}
	productClient := client.NewProductClient(productServiceURL)

	// Inisialisasi Layer Clean Architecture
	orderRepo := repository.NewOrderRepository(db)
	orderService := service.NewOrderService(orderRepo, productClient)
	orderHandler := handler.NewOrderHandler(orderService)

	// Setup Echo
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Validator = validator.NewCustomValidator()

	// Routes
	e.POST("/orders", orderHandler.CreateOrder)
	e.GET("/orders", orderHandler.GetAllOrders)
	e.GET("/orders/:id", orderHandler.GetOrderByID)
	e.PATCH("/orders/:id/status", orderHandler.UpdateOrderStatus)

	// Start Server
	e.Logger.Fatal(e.Start(":8082"))
}
