package middleware

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	userServiceURL string
	client         *http.Client
}

type AuthCheckResponse struct {
	Message string `json:"message"`

	Data struct {
		UserID   string `json:"user_id"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		Role     string `json:"role"`
		LoggedIn string `json:"logged_in"`
	} `json:"data"`
}

func NewAuthMiddleware() *AuthMiddleware {
	userServiceURL := os.Getenv("USER_SERVICE_URL")

	if userServiceURL == "" {
		userServiceURL = "http://127.0.0.1:8080"
	}

	return &AuthMiddleware{
		userServiceURL: userServiceURL,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// ==========================================
// AUTHENTICATED
//
// Semua user yang sudah login:
// - Customer
// - Super Admin
//
// Middleware akan mengambil user_id dari
// user-service lalu menyimpannya ke Context.
// ==========================================

func (m *AuthMiddleware) Authenticated(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")

		if authHeader == "" {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "missing authorization token",
					"data":    nil,
				},
			)
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "invalid authorization format",
					"data":    nil,
				},
			)
		}

		req, err := http.NewRequest(
			http.MethodGet,
			m.userServiceURL+"/auth/check",
			nil,
		)

		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				echo.Map{
					"message": "failed to create authentication request",
					"data":    nil,
				},
			)
		}

		req.Header.Set(
			"Authorization",
			authHeader,
		)

		resp, err := m.client.Do(req)

		if err != nil {
			return c.JSON(
				http.StatusServiceUnavailable,
				echo.Map{
					"message": "authentication service unavailable",
					"data":    nil,
				},
			)
		}

		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "unauthorized",
					"data":    nil,
				},
			)
		}

		var authResponse AuthCheckResponse

		if err := json.NewDecoder(resp.Body).Decode(&authResponse); err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				echo.Map{
					"message": "failed to parse authentication response",
					"data":    nil,
				},
			)
		}

		userID, err := strconv.Atoi(
			authResponse.Data.UserID,
		)

		if err != nil || userID < 1 {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "invalid user session",
					"data":    nil,
				},
			)
		}

		// Simpan informasi user ke Echo Context
		c.Set("user_id", userID)
		c.Set("user_role", authResponse.Data.Role)
		c.Set("user_name", authResponse.Data.Name)
		c.Set("user_email", authResponse.Data.Email)

		return next(c)
	}
}

// ==========================================
// ADMIN ONLY
// ==========================================

func (m *AuthMiddleware) AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")

		if authHeader == "" {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "missing authorization token",
					"data":    nil,
				},
			)
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "invalid authorization format",
					"data":    nil,
				},
			)
		}

		req, err := http.NewRequest(
			http.MethodGet,
			m.userServiceURL+"/admin/check",
			nil,
		)

		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				echo.Map{
					"message": "failed to create authentication request",
					"data":    nil,
				},
			)
		}

		req.Header.Set(
			"Authorization",
			authHeader,
		)

		resp, err := m.client.Do(req)

		if err != nil {
			return c.JSON(
				http.StatusServiceUnavailable,
				echo.Map{
					"message": "authentication service unavailable",
					"data":    nil,
				},
			)
		}

		defer resp.Body.Close()

		switch resp.StatusCode {

		case http.StatusOK:
			return next(c)

		case http.StatusUnauthorized:
			return c.JSON(
				http.StatusUnauthorized,
				echo.Map{
					"message": "unauthorized",
					"data":    nil,
				},
			)

		case http.StatusForbidden:
			return c.JSON(
				http.StatusForbidden,
				echo.Map{
					"message": "admin access required",
					"data":    nil,
				},
			)

		default:
			return c.JSON(
				http.StatusServiceUnavailable,
				echo.Map{
					"message": "failed to verify admin access",
					"data":    nil,
				},
			)
		}
	}
}
