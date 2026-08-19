package app

import (
	"log"
	"net/http"
	"os"

	"github.com/micro-sayur/order-service/config"
	"github.com/micro-sayur/order-service/internal/adapter/client"
	"github.com/micro-sayur/order-service/internal/adapter/handler"
	authmiddleware "github.com/micro-sayur/order-service/internal/adapter/middleware"
	"github.com/micro-sayur/order-service/internal/adapter/repository"
	"github.com/micro-sayur/order-service/internal/core/service"
	"github.com/micro-sayur/order-service/utils/validator"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func StartApp() {
	db := config.InitDB()
	defer db.Close()
	productServiceURL :=
		os.Getenv("PRODUCT_SERVICE_URL")

	if productServiceURL == "" {
		productServiceURL =
			"http://127.0.0.1:8081"
	}

	internalKey :=
		os.Getenv(
			"INTERNAL_SERVICE_KEY",
		)

	if internalKey == "" {
		log.Fatal(
			"INTERNAL_SERVICE_KEY wajib diisi",
		)
	}

	productClient :=
		client.NewProductClient(
			productServiceURL,
			internalKey,
		)
	orderRepo :=
		repository.NewOrderRepository(
			db,
		)

	orderService :=
		service.NewOrderService(
			orderRepo,
			productClient,
		)

	orderHandler :=
		handler.NewOrderHandler(
			orderService,
		)
	e := echo.New()

	e.Use(
		middleware.CORS(),
	)

	e.Use(
		middleware.Logger(),
	)

	e.Use(
		middleware.Recover(),
	)

	e.Validator =
		validator.NewCustomValidator()
	auth :=
		authmiddleware.NewAuthMiddleware()
		// Customer membuat order.
	// user_id tidak dipercaya dari frontend.
	// user_id diambil dari token.
	e.POST(
		"/orders",
		orderHandler.CreateOrder,
		auth.Authenticated,
	)

	// Customer melihat semua order miliknya.
	e.GET(
		"/orders/my",
		orderHandler.GetMyOrders,
		auth.Authenticated,
	)

	// Customer melihat SATU order miliknya.
	// Handler ini nanti melakukan pengecekan:
	// order.UserID == userID dari token
	e.GET(
		"/orders/:id",
		orderHandler.GetMyOrderByID,
		auth.Authenticated,
	)
	// Admin melihat semua order.
	e.GET(
		"/orders",
		orderHandler.GetAllOrders,
		auth.AdminOnly,
	)

	// Admin update status order.
	e.PATCH(
		"/orders/:id/status",
		orderHandler.UpdateOrderStatus,
		auth.AdminOnly,
	)
	// Payment-service mengambil detail order.
	// Contoh:
	// GET /internal/orders/5
	// Header:
	// X-Internal-Key: ...
	e.GET(
		"/internal/orders/:id",
		orderHandler.GetOrderByID,
		internalServiceAuth,
	)

	// Payment-service mengubah status:
	// PENDING -> PAID
	e.PATCH(
		"/internal/orders/:id/status",
		orderHandler.UpdateOrderStatus,
		internalServiceAuth,
	)
	e.GET(
		"/health",
		func(c echo.Context) error {
			return c.JSON(
				http.StatusOK,
				echo.Map{
					"service": "order-service",

					"status": "healthy",
				},
			)
		},
	)
	e.Logger.Fatal(
		e.Start(":8082"),
	)
}

// internalServiceAuth validates X-Internal-Key for requests from payment-service.
func internalServiceAuth(
	next echo.HandlerFunc,
) echo.HandlerFunc {

	return func(
		c echo.Context,
	) error {

		internalKey :=
			os.Getenv(
				"INTERNAL_SERVICE_KEY",
			)

		if internalKey == "" {
			return c.JSON(
				http.StatusInternalServerError,
				echo.Map{
					"message": "internal service configuration error",
				},
			)
		}

		requestKey :=
			c.Request().
				Header.
				Get(
					"X-Internal-Key",
				)

		if requestKey == "" {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "missing internal service key",
				},
			)
		}

		if requestKey !=
			internalKey {

			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "invalid internal service key",
				},
			)
		}

		return next(c)
	}
}
