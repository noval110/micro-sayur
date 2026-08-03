package handler

import (
	"net/http"
	"product-service/config"
	"product-service/internal/adapter/handler/request"
	"product-service/internal/core/domain/entity"
	"product-service/internal/core/service"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

type ProductHandlerInterface interface {
	GetProducts(c echo.Context) error
	GetProductByID(c echo.Context) error
	ReduceStock(c echo.Context) error
	CreateProduct(c echo.Context) error
}

type productHandler struct {
	service service.ProductServiceInterface
}

type ReduceStockRequest struct {
	Quantity int `json:"quantity"`
}

func (h *productHandler) GetProducts(c echo.Context) error {
	ctx := c.Request().Context()
	products, err := h.service.GetAllProducts(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"message": err.Error(),
			"data":    nil,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "success",
		"data":    products,
	})
}

func (h *productHandler) GetProductByID(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "ID tidak valid"})
	}

	product, err := h.service.GetProductByID(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Produk tidak ditemukan"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data":    product,
		"message": "success get product detail",
	})
}

func (h *productHandler) ReduceStock(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "ID tidak valid"})
	}

	var req ReduceStockRequest
	if err := c.Bind(&req); err != nil || req.Quantity < 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "payload tidak valid"})
	}

	if err := h.service.ReduceStock(c.Request().Context(), id, req.Quantity); err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"message": "gagal mengurangi stok"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "stok berhasil dikurangi"})
}

func (h *productHandler) CreateProduct(c echo.Context) error {
	var req request.CreateProductRequest
	ctx := c.Request().Context()

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{"message": err.Error()})
	}
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{"message": err.Error()})
	}

	reqEntity := entity.ProductEntity{
		Name:     req.Name,
		Category: req.Category,
		Price:    req.Price,
		Stock:    req.Stock,
		Unit:     req.Unit,
		Image:    req.Image,
	}

	if err := h.service.CreateProduct(ctx, reqEntity); err != nil {
		log.Errorf("[ProductHandler] CreateProduct error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"message": err.Error()})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "product created successfully",
		"data":    nil,
	})
}

func NewProductHandler(e *echo.Echo, service service.ProductServiceInterface, cfg *config.Config) ProductHandlerInterface {
	handler := &productHandler{service: service}

	e.Use(middleware.Recover())
	e.GET("/products", handler.GetProducts)
	e.GET("/products/:id", handler.GetProductByID)
	e.PATCH("/products/:id/reduce-stock", handler.ReduceStock)
	e.POST("/products", handler.CreateProduct)

	return handler
}
