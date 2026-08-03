package main

import (
	"os"
	"payment-service/internal/client"
	"payment-service/internal/handler"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	orderServiceURL := os.Getenv("ORDER_SERVICE_URL")
	if orderServiceURL == "" {
		orderServiceURL = "http://127.0.0.1:8082"
	}
	orderClient := client.NewOrderClient(orderServiceURL)
	paymentHandler := handler.NewPaymentHandler(orderClient)

	// payment-service berjalan pada port 8083.
	e.POST("/payments", paymentHandler.PayOrder)

	e.Logger.Fatal(e.Start(":8083"))
}
