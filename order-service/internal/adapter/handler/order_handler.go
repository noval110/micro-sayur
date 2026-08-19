package handler

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"

	"github.com/micro-sayur/order-service/internal/core/dto"
	"github.com/micro-sayur/order-service/internal/core/service"
)

type OrderHandler struct {
	orderService service.OrderService
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

func NewOrderHandler(
	os service.OrderService,
) *OrderHandler {

	return &OrderHandler{
		orderService: os,
	}
}
func getUserIDFromContext(
	c echo.Context,
) (int, bool) {

	userIDValue :=
		c.Get("user_id")

	if userIDValue == nil {
		return 0, false
	}

	userID, ok :=
		userIDValue.(int)

	if !ok || userID < 1 {
		return 0, false
	}

	return userID, true
}
func (h *OrderHandler) CreateOrder(
	c echo.Context,
) error {

	var req dto.CreateOrderRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.Map{
				"message": "invalid request body",
			},
		)
	}

	// Jangan percaya user_id dari frontend.
	// Ambil user_id dari token.
	userID, ok :=
		getUserIDFromContext(c)

	if !ok {
		return c.JSON(
			http.StatusUnauthorized,
			echo.Map{
				"message": "invalid user session",
			},
		)
	}

	req.UserID = userID

	order, err :=
		h.orderService.CreateOrder(
			c.Request().Context(),
			req,
		)

	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": err.Error(),
			},
		)
	}

	return c.JSON(
		http.StatusCreated,
		echo.Map{
			"message": "order created successfully",
			"data":    order,
		},
	)
}
func (h *OrderHandler) GetMyOrders(
	c echo.Context,
) error {

	userID, ok :=
		getUserIDFromContext(c)

	if !ok {
		return c.JSON(
			http.StatusUnauthorized,
			echo.Map{
				"message": "invalid user session",
			},
		)
	}

	orders, err :=
		h.orderService.GetOrdersByUserID(
			c.Request().Context(),
			userID,
		)

	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": err.Error(),
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		echo.Map{
			"message": "success get my orders",

			"data": orders,
		},
	)
}
func (h *OrderHandler) GetMyOrderByID(
	c echo.Context,
) error {
	id, err :=
		strconv.Atoi(
			c.Param("id"),
		)

	if err != nil || id < 1 {
		return c.JSON(
			http.StatusBadRequest,
			echo.Map{
				"message": "invalid order id",
			},
		)
	}
	userID, ok :=
		getUserIDFromContext(c)

	if !ok {
		return c.JSON(
			http.StatusUnauthorized,
			echo.Map{
				"message": "invalid user session",
			},
		)
	}
	order, err :=
		h.orderService.GetOrderByID(
			c.Request().Context(),
			id,
		)

	if err != nil {

		if err == sql.ErrNoRows {
			return c.JSON(
				http.StatusNotFound,
				echo.Map{
					"message": "order not found",
				},
			)
		}

		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": err.Error(),
			},
		)
	}
	if order.UserID != userID {
		return c.JSON(
			http.StatusForbidden,
			echo.Map{
				"message": "you are not allowed to access this order",
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		echo.Map{
			"message": "success get my order detail",

			"data": order,
		},
	)
}
func (h *OrderHandler) GetAllOrders(
	c echo.Context,
) error {

	orders, err :=
		h.orderService.GetAllOrders(
			c.Request().Context(),
		)

	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": err.Error(),
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		echo.Map{
			"message": "success get all orders",

			"data": orders,
		},
	)
}

// Digunakan oleh:
// payment-service
// Route:
// GET /internal/orders/:id
// Route ini harus dilindungi
// X-Internal-Key di app.go.
func (h *OrderHandler) GetOrderByID(
	c echo.Context,
) error {

	id, err :=
		strconv.Atoi(
			c.Param("id"),
		)

	if err != nil || id < 1 {
		return c.JSON(
			http.StatusBadRequest,
			echo.Map{
				"message": "invalid order id",
			},
		)
	}

	order, err :=
		h.orderService.GetOrderByID(
			c.Request().Context(),
			id,
		)

	if err != nil {

		if err == sql.ErrNoRows {
			return c.JSON(
				http.StatusNotFound,
				echo.Map{
					"message": "order not found",
				},
			)
		}

		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": err.Error(),
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		echo.Map{
			"message": "success get order detail",

			"data": order,
		},
	)
}
func (h *OrderHandler) UpdateOrderStatus(
	c echo.Context,
) error {

	id, err :=
		strconv.Atoi(
			c.Param("id"),
		)

	if err != nil || id < 1 {
		return c.JSON(
			http.StatusBadRequest,
			echo.Map{
				"message": "invalid order id",
			},
		)
	}

	var req UpdateOrderStatusRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(
			http.StatusBadRequest,
			echo.Map{
				"message": "invalid request body",
			},
		)
	}

	req.Status =
		strings.ToUpper(
			strings.TrimSpace(
				req.Status,
			),
		)

	allowedStatuses :=
		map[string]bool{
			"PENDING":    true,
			"PAID":       true,
			"PROCESSING": true,
			"SHIPPED":    true,
			"DONE":       true,
			"CANCELLED":  true,
		}

	if !allowedStatuses[req.Status] {

		return c.JSON(
			http.StatusBadRequest,
			echo.Map{
				"message": "invalid order status",
			},
		)
	}

	err =
		h.orderService.UpdateOrderStatus(
			c.Request().Context(),
			id,
			req.Status,
		)

	if err != nil {

		if err == sql.ErrNoRows {
			return c.JSON(
				http.StatusNotFound,
				echo.Map{
					"message": "order not found",
				},
			)
		}

		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": "gagal update status order",
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		echo.Map{
			"message": "status order berhasil diperbarui",
		},
	)
}
