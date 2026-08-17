package handler

import (
	"errors"
	"net/http"
	"strconv"

	"payment-service/internal/client"
	"payment-service/internal/repository"
	"payment-service/internal/service"

	"github.com/labstack/echo/v4"
)

type PaymentHandler struct{ paymentService service.PaymentService }

func NewPaymentHandler(paymentService service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

func authenticatedUserID(c echo.Context) (int, bool) {
	userID, ok := c.Get("user_id").(int)
	return userID, ok && userID > 0
}

func (h *PaymentHandler) PayOrder(c echo.Context) error {
	var req service.PayRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "payload tidak valid"})
	}
	if req.OrderID < 1 {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "invalid order id"})
	}
	userID, ok := authenticatedUserID(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid user session"})
	}
	payment, err := h.paymentService.Pay(c.Request().Context(), userID, req)
	if err != nil {
		switch {
		case errors.Is(err, client.ErrOrderNotFound):
			return c.JSON(http.StatusNotFound, echo.Map{"message": err.Error()})
		case errors.Is(err, service.ErrForbidden):
			return c.JSON(http.StatusForbidden, echo.Map{"message": err.Error()})
		case errors.Is(err, service.ErrOrderAlreadyPaid), errors.Is(err, service.ErrOrderNotPayable):
			return c.JSON(http.StatusConflict, echo.Map{"message": err.Error()})
		case errors.Is(err, service.ErrInvalidPaymentMethod):
			return c.JSON(http.StatusBadRequest, echo.Map{"message": err.Error()})
		default:
			return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
		}
	}
	return c.JSON(http.StatusOK, echo.Map{"message": "pembayaran berhasil", "data": payment})
}

func (h *PaymentHandler) GetByOrderID(c echo.Context) error {
	orderID, err := strconv.Atoi(c.Param("order_id"))
	if err != nil || orderID < 1 {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "invalid order id"})
	}
	userID, ok := authenticatedUserID(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid user session"})
	}
	payment, err := h.paymentService.GetByOrderID(c.Request().Context(), userID, orderID)
	if err != nil {
		switch {
		case errors.Is(err, repository.ErrPaymentNotFound), errors.Is(err, client.ErrOrderNotFound):
			return c.JSON(http.StatusNotFound, echo.Map{"message": "payment tidak ditemukan"})
		case errors.Is(err, service.ErrForbidden):
			return c.JSON(http.StatusForbidden, echo.Map{"message": err.Error()})
		default:
			return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
		}
	}
	return c.JSON(http.StatusOK, echo.Map{"message": "success get payment", "data": payment})
}
