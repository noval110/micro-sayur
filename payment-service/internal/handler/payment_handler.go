package handler

import (
	"errors"
	"net/http"
	"payment-service/internal/client"

	"github.com/labstack/echo/v4"
)

type PaymentHandler struct {
	orderClient client.OrderClient
}

func NewPaymentHandler(oc client.OrderClient) *PaymentHandler {
	return &PaymentHandler{orderClient: oc}
}

type ProcessPaymentReq struct {
	OrderID int     `json:"order_id"`
	Amount  float64 `json:"amount"`
}

func (h *PaymentHandler) PayOrder(c echo.Context) error {
	var req ProcessPaymentReq
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "payload tidak valid"})
	}
	if req.OrderID < 1 || req.Amount <= 0 {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "order_id dan amount harus lebih besar dari 0"})
	}

	order, err := h.orderClient.GetOrderByID(req.OrderID)
	if err != nil {
		if errors.Is(err, client.ErrOrderNotFound) {
			return c.JSON(http.StatusNotFound, echo.Map{"message": "order tidak ditemukan"})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "gagal mengambil data order: " + err.Error()})
	}

	if order.Status == "PAID" {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "order ini sudah dibayar sebelumnya"})
	}

	if req.Amount < order.TotalPrice {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "jumlah pembayaran kurang dari total tagihan"})
	}

	if err := h.orderClient.UpdateOrderStatus(req.OrderID, "PAID"); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "pembayaran gagal diproses: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message":  "pembayaran berhasil",
		"order_id": req.OrderID,
		"status":   "PAID",
	})
}
