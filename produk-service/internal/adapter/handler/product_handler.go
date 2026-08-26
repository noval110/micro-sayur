package handler

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"product-service/config"
	"product-service/internal/adapter/handler/request"
	authmiddleware "product-service/internal/adapter/middleware"
	"product-service/internal/adapter/repository"
	"product-service/internal/core/domain/entity"
	"product-service/internal/core/service"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

type ProductHandlerInterface interface {
	GetProducts(
		c echo.Context,
	) error

	GetProductByID(
		c echo.Context,
	) error

	ReduceStock(
		c echo.Context,
	) error

	CreateProduct(
		c echo.Context,
	) error

	UpdateProduct(
		c echo.Context,
	) error

	DeleteProduct(
		c echo.Context,
	) error

	UploadProductImage(
		c echo.Context,
	) error
}

type productHandler struct {
	service service.ProductServiceInterface
}

type ReduceStockRequest struct {
	Quantity int `json:"quantity"`
}

type UpdateProductRequest struct {
	Name string `json:"name"`

	Category string `json:"category"`

	Price float64 `json:"price"`

	Stock int `json:"stock"`

	Unit string `json:"unit"`

	Image string `json:"image"`
}

func (h *productHandler) GetProducts(
	c echo.Context,
) error {

	ctx :=
		c.Request().
			Context()

	products, err :=
		h.service.GetAllProducts(
			ctx,
		)

	if err != nil {

		return c.JSON(
			http.StatusInternalServerError,
			map[string]interface{}{
				"message": err.Error(),
				"data":    nil,
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]interface{}{
			"message": "success",
			"data":    products,
		},
	)
}
func (h *productHandler) GetProductByID(
	c echo.Context,
) error {

	id, err :=
		strconv.ParseInt(
			c.Param("id"),
			10,
			64,
		)

	if err != nil ||
		id < 1 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "ID tidak valid",
			},
		)
	}

	product, err :=
		h.service.GetProductByID(
			c.Request().
				Context(),
			id,
		)

	if err != nil {

		if errors.Is(
			err,
			repository.ErrProductNotFound,
		) {

			return c.JSON(
				http.StatusNotFound,
				map[string]string{
					"message": "Produk tidak ditemukan",
				},
			)
		}

		return c.JSON(
			http.StatusInternalServerError,
			map[string]string{
				"message": "gagal mengambil produk",
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]interface{}{
			"message": "success get product detail",
			"data":    product,
		},
	)
}
func (h *productHandler) CreateProduct(
	c echo.Context,
) error {

	var req request.CreateProductRequest

	ctx :=
		c.Request().
			Context()

	if err :=
		c.Bind(
			&req,
		); err != nil {

		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]interface{}{
				"message": err.Error(),
			},
		)
	}

	if err :=
		c.Validate(
			&req,
		); err != nil {

		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]interface{}{
				"message": err.Error(),
			},
		)
	}

	reqEntity :=
		entity.ProductEntity{
			Name:     req.Name,
			Category: req.Category,
			Price:    req.Price,
			Stock:    req.Stock,
			Unit:     req.Unit,
			Image:    req.Image,
		}

	if err :=
		h.service.CreateProduct(
			ctx,
			reqEntity,
		); err != nil {

		log.Errorf(
			"[ProductHandler] CreateProduct: %v",
			err,
		)

		return c.JSON(
			http.StatusInternalServerError,
			map[string]interface{}{
				"message": err.Error(),
			},
		)
	}

	return c.JSON(
		http.StatusCreated,
		map[string]interface{}{
			"message": "product created successfully",
			"data":    nil,
		},
	)
}
func (h *productHandler) UpdateProduct(
	c echo.Context,
) error {

	id, err :=
		strconv.ParseInt(
			c.Param("id"),
			10,
			64,
		)

	if err != nil ||
		id < 1 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "ID tidak valid",
			},
		)
	}

	var req UpdateProductRequest

	if err :=
		c.Bind(
			&req,
		); err != nil {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "request body tidak valid",
			},
		)
	}

	req.Name =
		strings.TrimSpace(
			req.Name,
		)

	req.Category =
		strings.TrimSpace(
			req.Category,
		)

	req.Unit =
		strings.TrimSpace(
			req.Unit,
		)

	req.Image =
		strings.TrimSpace(
			req.Image,
		)

	if req.Name == "" {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "nama produk wajib diisi",
			},
		)
	}

	if req.Category == "" {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "kategori wajib diisi",
			},
		)
	}

	if req.Price < 0 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "harga tidak valid",
			},
		)
	}

	if req.Stock < 0 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "stok tidak valid",
			},
		)
	}

	if req.Unit == "" {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "satuan wajib diisi",
			},
		)
	}

	product :=
		entity.ProductEntity{
			Name:     req.Name,
			Category: req.Category,
			Price:    req.Price,
			Stock:    req.Stock,
			Unit:     req.Unit,
			Image:    req.Image,
		}

	err =
		h.service.UpdateProduct(
			c.Request().
				Context(),
			id,
			product,
		)

	if err != nil {

		if errors.Is(
			err,
			repository.ErrProductNotFound,
		) {

			return c.JSON(
				http.StatusNotFound,
				map[string]string{
					"message": "Produk tidak ditemukan",
				},
			)
		}

		log.Errorf(
			"[ProductHandler] UpdateProduct: %v",
			err,
		)

		return c.JSON(
			http.StatusInternalServerError,
			map[string]string{
				"message": "gagal memperbarui produk",
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]interface{}{
			"message": "product updated successfully",
			"data":    nil,
		},
	)
}
func (h *productHandler) DeleteProduct(
	c echo.Context,
) error {

	id, err :=
		strconv.ParseInt(
			c.Param("id"),
			10,
			64,
		)

	if err != nil ||
		id < 1 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "ID tidak valid",
			},
		)
	}

	err =
		h.service.DeleteProduct(
			c.Request().
				Context(),
			id,
		)

	if err != nil {

		if errors.Is(
			err,
			repository.ErrProductNotFound,
		) {

			return c.JSON(
				http.StatusNotFound,
				map[string]string{
					"message": "Produk tidak ditemukan",
				},
			)
		}

		log.Errorf(
			"[ProductHandler] DeleteProduct: %v",
			err,
		)

		return c.JSON(
			http.StatusInternalServerError,
			map[string]string{
				"message": "gagal menghapus produk",
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]interface{}{
			"message": "product deleted successfully",
		},
	)
}
func (h *productHandler) ReduceStock(
	c echo.Context,
) error {

	id, err :=
		strconv.ParseInt(
			c.Param("id"),
			10,
			64,
		)

	if err != nil ||
		id < 1 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "ID tidak valid",
			},
		)
	}

	var req ReduceStockRequest

	if err :=
		c.Bind(
			&req,
		); err != nil ||
		req.Quantity < 1 {

		return c.JSON(
			http.StatusBadRequest,
			map[string]string{
				"message": "payload tidak valid",
			},
		)
	}

	if err :=
		h.service.ReduceStock(
			c.Request().
				Context(),
			id,
			req.Quantity,
		); err != nil {

		return c.JSON(
			http.StatusConflict,
			map[string]string{
				"message": "gagal mengurangi stok",
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]string{
			"message": "stok berhasil dikurangi",
		},
	)
}
func uploadToSupabaseStorage(
	fileName string,
	contentType string,
	fileData []byte,
) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	bucket := os.Getenv("SUPABASE_STORAGE_BUCKET")

	if supabaseURL == "" || serviceKey == "" || bucket == "" {
		return "", fmt.Errorf("supabase storage env belum lengkap")
	}

	objectPath := "products/" + fileName
	uploadURL := fmt.Sprintf(
		"%s/storage/v1/object/%s/%s",
		strings.TrimRight(supabaseURL, "/"),
		bucket,
		objectPath,
	)

	req, err := http.NewRequest(
		http.MethodPost,
		uploadURL,
		bytes.NewReader(fileData),
	)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+serviceKey)
	req.Header.Set("apikey", serviceKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf(
			"supabase upload gagal: status=%d body=%s",
			resp.StatusCode,
			string(body),
		)
	}

	publicURL := fmt.Sprintf(
		"%s/storage/v1/object/public/%s/%s",
		strings.TrimRight(supabaseURL, "/"),
		bucket,
		objectPath,
	)

	return publicURL, nil
}

func (h *productHandler) UploadProductImage(
	c echo.Context,
) error {

	const maxImageSize = 5 * 1024 * 1024

	file, err :=
		c.FormFile(
			"image",
		)

	if err != nil {

		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "gambar produk wajib dipilih",
			},
		)
	}

	if file.Size >
		maxImageSize {

		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "ukuran gambar maksimal 5 MB",
			},
		)
	}

	src, err :=
		file.Open()

	if err != nil {

		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "gagal membuka gambar",
			},
		)
	}

	defer src.Close()

	header :=
		make(
			[]byte,
			512,
		)

	bytesRead, readErr :=
		io.ReadFull(
			src,
			header,
		)

	if readErr != nil &&
		readErr != io.ErrUnexpectedEOF &&
		readErr != io.EOF {

		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "gagal membaca gambar",
			},
		)
	}

	contentType :=
		http.DetectContentType(
			header[:bytesRead],
		)

	var ext string

	switch contentType {

	case "image/jpeg":
		ext = ".jpg"

	case "image/png":
		ext = ".png"

	case "image/webp":
		ext = ".webp"

	default:

		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "format gambar harus JPG, PNG, atau WEBP",
			},
		)
	}

	if seeker, ok :=
		src.(io.Seeker); ok {

		if _, err =
			seeker.Seek(
				0,
				io.SeekStart,
			); err != nil {

			return c.JSON(
				http.StatusInternalServerError,
				map[string]interface{}{
					"message": "gagal membaca ulang gambar",
				},
			)
		}
	}

	fileName :=
		fmt.Sprintf(
			"product-%d%s",
			time.Now().UnixNano(),
			ext,
		)

	fileData, err := io.ReadAll(
		io.LimitReader(src, maxImageSize+1),
	)
	if err != nil {
		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "gagal membaca gambar",
			},
		)
	}

	if len(fileData) > maxImageSize {
		return c.JSON(
			http.StatusBadRequest,
			map[string]interface{}{
				"message": "ukuran gambar maksimal 5 MB",
			},
		)
	}

	imageURL, err := uploadToSupabaseStorage(
		fileName,
		contentType,
		fileData,
	)
	if err != nil {
		return c.JSON(
			http.StatusInternalServerError,
			map[string]interface{}{
				"message": "gagal upload gambar ke storage",
				"error":   err.Error(),
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		map[string]interface{}{
			"message": "gambar berhasil diupload",
			"data": map[string]interface{}{
				"url": imageURL,
			},
		},
	)
}
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
				map[string]string{
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
				map[string]string{
					"message": "missing internal service key",
				},
			)
		}

		if requestKey !=
			internalKey {

			return c.JSON(
				http.StatusUnauthorized,
				map[string]string{
					"message": "invalid internal service key",
				},
			)
		}

		return next(c)
	}
}
func NewProductHandler(
	e *echo.Echo,
	service service.ProductServiceInterface,
	cfg *config.Config,
) ProductHandlerInterface {

	handler :=
		&productHandler{
			service: service,
		}

	e.Use(
		echomiddleware.Recover(),
	)

	auth :=
		authmiddleware.NewAuthMiddleware()

	// PUBLIC

	e.GET(
		"/products",
		handler.GetProducts,
	)

	e.GET(
		"/products/:id",
		handler.GetProductByID,
	)

	// INTERNAL

	e.PATCH(
		"/internal/products/:id/reduce-stock",
		handler.ReduceStock,
		internalServiceAuth,
	)

	// ADMIN

	e.POST(
		"/products",
		handler.CreateProduct,
		auth.AdminOnly,
	)

	e.PATCH(
		"/products/:id",
		handler.UpdateProduct,
		auth.AdminOnly,
	)

	e.DELETE(
		"/products/:id",
		handler.DeleteProduct,
		auth.AdminOnly,
	)

	e.POST(
		"/products/upload-image",
		handler.UploadProductImage,
		auth.AdminOnly,
	)

	e.Static(
		"/uploads",
		"uploads",
	)

	return handler
}
