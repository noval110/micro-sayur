package handler

import (
	"database/sql"
	"errors"
	"github.com/micro-sayur/order-service/internal/adapter/repository"
	"github.com/micro-sayur/order-service/internal/core/dto"
	"github.com/micro-sayur/order-service/internal/core/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type OrderHandler struct {
	orderService service.OrderService
}

func NewOrderHandler(os service.OrderService) *OrderHandler {
	return &OrderHandler{orderService: os}
}

func (h *OrderHandler) CreateOrder(c echo.Context) error {
	var req dto.CreateOrderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "invalid request body"})
	}

	order, err := h.orderService.CreateOrder(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"message": "order created successfully",
		"data":    order,
	})
}

func (h *OrderHandler) GetAllOrders(c echo.Context) error {
	orders, err := h.orderService.GetAllOrders(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "success get all orders",
		"data":    orders,
	})
}

func (h *OrderHandler) GetOrderByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id < 1 {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "invalid order id"})
	}

	order, err := h.orderService.GetOrderByID(c.Request().Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusNotFound, echo.Map{"message": "order not found"})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "success get order detail",
		"data":    order,
	})
}

func (h *OrderHandler) UpdateOrderStatus(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id < 1 {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "invalid order id"})
	}

	status := c.QueryParam("status")
	if status != "PAID" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "status harus PAID"})
	}

	if err := h.orderService.UpdateOrderStatus(c.Request().Context(), id, status); err != nil {
		if errors.Is(err, repository.ErrOrderNotPending) {
			return c.JSON(http.StatusConflict, echo.Map{"message": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "gagal update status order"})
	}

	return c.JSON(http.StatusOK, echo.Map{"message": "status order berhasil diperbarui"})
}
