package adapter

import (
	"net/http"
	"strings"

	"user-service/config"
	"user-service/internal/adapter/handler/response"

	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
)

type MiddlewareAdapterInterface interface {
	CheckToken() echo.MiddlewareFunc
	CheckAdmin() echo.MiddlewareFunc
}

type middlewareAdapter struct {
	cfg *config.Config
}

// CheckToken
// Mengecek apakah request punya token
// dan apakah token tersebut masih punya session di Redis.
func (m *middlewareAdapter) CheckToken() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			respErr := response.DefaultResponse{}

			authHeader := c.Request().Header.Get("Authorization")

			if authHeader == "" {
				log.Errorf(
					"[MiddlewareAdapter-1] CheckToken: missing authorization header",
				)

				respErr.Massage = "missing or invalid token"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			// Pastikan format token adalah:
			// Authorization: Bearer <token>
			if !strings.HasPrefix(authHeader, "Bearer ") {
				log.Errorf(
					"[MiddlewareAdapter-2] CheckToken: invalid authorization format",
				)

				respErr.Massage = "missing or invalid token"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			tokenString := strings.TrimPrefix(
				authHeader,
				"Bearer ",
			)

			if tokenString == "" {
				log.Errorf(
					"[MiddlewareAdapter-3] CheckToken: token empty",
				)

				respErr.Massage = "missing or invalid token"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			redisConn := config.NewRedisClient()

			getSession, err := redisConn.HGetAll(
				c.Request().Context(),
				tokenString,
			).Result()

			if err != nil {
				log.Errorf(
					"[MiddlewareAdapter-4] CheckToken Redis Error: %v",
					err,
				)

				respErr.Massage = "failed to validate session"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			// Session tidak ditemukan
			if len(getSession) == 0 {
				log.Errorf(
					"[MiddlewareAdapter-5] CheckToken: session not found",
				)

				respErr.Massage = "session expired or invalid token"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			// Simpan session ke Echo Context.
			// Nanti bisa diambil oleh CheckAdmin().
			c.Set("user", getSession)

			return next(c)
		}
	}
}

// CheckAdmin
// Middleware ini harus dipasang SETELAH CheckToken().
// CheckToken() memasukkan session Redis ke:
//	c.Set("user", getSession)
// Lalu CheckAdmin() membaca role dari session tersebut.
func (m *middlewareAdapter) CheckAdmin() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			respErr := response.DefaultResponse{}

			sessionValue := c.Get("user")

			if sessionValue == nil {
				log.Errorf(
					"[MiddlewareAdapter-1] CheckAdmin: user session not found",
				)

				respErr.Massage = "unauthorized"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			// Karena HGetAll dari Redis menghasilkan:
			// map[string]string
			sessionData, ok := sessionValue.(map[string]string)

			if !ok {
				log.Errorf(
					"[MiddlewareAdapter-2] CheckAdmin: invalid session format",
				)

				respErr.Massage = "invalid session"
				respErr.Data = nil

				return c.JSON(
					http.StatusUnauthorized,
					respErr,
				)
			}

			role := sessionData["role"]

			// Hanya role Super Admin yang diperbolehkan
			if role != "Super Admin" {
				log.Errorf(
					"[MiddlewareAdapter-3] CheckAdmin: forbidden role=%s",
					role,
				)

				respErr.Massage = "access forbidden"
				respErr.Data = nil

				return c.JSON(
					http.StatusForbidden,
					respErr,
				)
			}

			return next(c)
		}
	}
}

func NewMiddlewareAdapter(
	cfg *config.Config,
) MiddlewareAdapterInterface {
	return &middlewareAdapter{
		cfg: cfg,
	}
}
