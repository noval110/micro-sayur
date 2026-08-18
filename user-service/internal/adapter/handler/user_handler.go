package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"user-service/config"
	"user-service/internal/adapter"
	"user-service/internal/adapter/handler/request"
	"user-service/internal/adapter/handler/response"
	"user-service/internal/core/domain/entity"
	"user-service/internal/core/service"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

type UserHandlerInterface interface {
	SignIn(c echo.Context) error
	CreateUserAccount(c echo.Context) error
	GetAllUsers(c echo.Context) error
	GetProfile(c echo.Context) error
	UpdateProfile(c echo.Context) error
	UploadProfilePhoto(c echo.Context) error
}

type userHandler struct {
	userService service.UserServiceInterface
}

type UpdateProfileRequest struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Lat     string `json:"lat"`
	Lng     string `json:"lng"`
	Photo   string `json:"photo"`
}

var err error

func getSessionUserID(c echo.Context) (int64, error) {
	sessionValue := c.Get("user")
	if sessionValue == nil {
		return 0, fmt.Errorf("user session tidak ditemukan")
	}
	sessionData, ok := sessionValue.(map[string]string)
	if !ok {
		return 0, fmt.Errorf("format session tidak valid")
	}
	userID, err := strconv.ParseInt(sessionData["user_id"], 10, 64)
	if err != nil || userID < 1 {
		return 0, fmt.Errorf("user id pada session tidak valid")
	}
	return userID, nil
}

func profileData(user *entity.UserEntity) echo.Map {
	return echo.Map{
		"id": user.ID, "name": user.Name, "email": user.Email,
		"phone": user.Phone, "photo": user.Photo, "role": user.RoleName,
		"address": user.Address, "lat": user.Lat, "lng": user.Lng,
		"is_verified": user.IsVerified,
	}
}

func (u *userHandler) GetProfile(c echo.Context) error {
	userID, err := getSessionUserID(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid user session", "data": nil})
	}
	user, err := u.userService.GetProfile(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error(), "data": nil})
	}
	return c.JSON(http.StatusOK, echo.Map{"message": "success get profile", "data": profileData(user)})
}

func (u *userHandler) UpdateProfile(c echo.Context) error {
	userID, err := getSessionUserID(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid user session", "data": nil})
	}
	var req UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "payload tidak valid"})
	}
	photo := strings.TrimSpace(req.Photo)
	if photo == "" {
		currentUser, err := u.userService.GetProfile(c.Request().Context(), userID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
		}
		photo = currentUser.Photo
	}
	updatedUser, err := u.userService.UpdateProfile(c.Request().Context(), userID, entity.UserEntity{
		Name: req.Name, Phone: req.Phone, Address: req.Address,
		Lat: req.Lat, Lng: req.Lng, Photo: photo,
	})
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, echo.Map{"message": "profile berhasil diperbarui", "data": profileData(updatedUser)})
}

func getPublicBaseURL(c echo.Context) string {
	baseURL := strings.TrimSpace(os.Getenv("PUBLIC_API_URL"))

	if baseURL != "" {
		return strings.TrimRight(baseURL, "/")
	}

	host := strings.TrimSpace(c.Request().Host)

	if host != "" &&
		!strings.Contains(host, "localhost") &&
		!strings.HasPrefix(host, "127.0.0.1") {

		return "https://" + host
	}

	return "http://localhost:8000"
}

func (u *userHandler) UploadProfilePhoto(c echo.Context) error {
	const maxPhotoSize = 5 * 1024 * 1024
	if _, err := getSessionUserID(c); err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "invalid user session"})
	}
	file, err := c.FormFile("photo")
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "foto wajib dipilih"})
	}
	if file.Size > maxPhotoSize {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "ukuran foto maksimal 5 MB"})
	}
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "gagal membuka foto"})
	}
	defer src.Close()
	header := make([]byte, 512)
	read, readErr := io.ReadFull(src, header)
	if readErr != nil && readErr != io.ErrUnexpectedEOF && readErr != io.EOF {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "gagal membaca foto"})
	}
	var ext string
	switch http.DetectContentType(header[:read]) {
	case "image/jpeg":
		ext = ".jpg"
	case "image/png":
		ext = ".png"
	case "image/webp":
		ext = ".webp"
	default:
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "format foto harus JPG, PNG, atau WEBP"})
	}
	if seeker, ok := src.(io.Seeker); ok {
		if _, err := seeker.Seek(0, io.SeekStart); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"message": "gagal membaca ulang foto"})
		}
	}
	uploadDir := filepath.Join("uploads", "profiles")
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "gagal membuat folder upload"})
	}
	fileName := fmt.Sprintf("profile-%d%s", time.Now().UnixNano(), ext)
	destination := filepath.Join(uploadDir, fileName)
	dst, err := os.Create(destination)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "gagal menyimpan foto"})
	}
	written, copyErr := io.Copy(dst, io.LimitReader(src, maxPhotoSize+1))
	closeErr := dst.Close()
	if copyErr != nil || closeErr != nil || written > maxPhotoSize {
		_ = os.Remove(destination)
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "gagal menyimpan foto"})
	}
	baseURL := getPublicBaseURL(c)

	photoURL := fmt.Sprintf(
		"%s/users/uploads/profiles/%s",
		baseURL,
		fileName,
	)
	return c.JSON(http.StatusOK, echo.Map{
		"message": "foto berhasil diupload",
		"data":    echo.Map{"url": photoURL},
	})
}

// ==========================================
// GET ALL USERS
// ADMIN ONLY
// ==========================================

func (u *userHandler) GetAllUsers(c echo.Context) error {
	users, err := u.userService.GetAllUsers(
		c.Request().Context(),
	)
	if err != nil {
		log.Errorf(
			"[UserHandler] GetAllUsers: %v",
			err,
		)

		return c.JSON(
			http.StatusInternalServerError,
			echo.Map{
				"message": "gagal mengambil data pengguna",
				"data":    nil,
			},
		)
	}

	result := make(
		[]echo.Map,
		0,
		len(users),
	)

	for _, user := range users {
		result = append(
			result,
			echo.Map{
				"id":          user.ID,
				"name":        user.Name,
				"email":       user.Email,
				"role":        user.RoleName,
				"address":     user.Address,
				"phone":       user.Phone,
				"photo":       user.Photo,
				"is_verified": user.IsVerified,
			},
		)
	}

	return c.JSON(
		http.StatusOK,
		echo.Map{
			"message": "success get users",
			"data":    result,
		},
	)
}

// ==========================================
// CREATE USER ACCOUNT
// ==========================================

func (u *userHandler) CreateUserAccount(c echo.Context) error {
	var (
		req  = request.SignUpRequest{}
		resp = response.DefaultResponse{}
		ctx  = c.Request().Context()
	)

	// Bind request body
	if err = c.Bind(&req); err != nil {
		log.Errorf(
			"[UserHandler-1] CreateUserAccount: %v",
			err,
		)

		resp.Massage = err.Error()
		resp.Data = nil

		return c.JSON(
			http.StatusUnprocessableEntity,
			resp,
		)
	}

	// Validasi request
	if err = c.Validate(&req); err != nil {
		log.Errorf(
			"[UserHandler-2] CreateUserAccount: %v",
			err,
		)

		resp.Massage = err.Error()
		resp.Data = nil

		return c.JSON(
			http.StatusUnprocessableEntity,
			resp,
		)
	}

	// Password confirmation
	if req.Password != req.PasswordConfirmation {
		log.Errorf(
			"[UserHandler-3] CreateUserAccount: password not match",
		)

		resp.Massage = "password not match"
		resp.Data = nil

		return c.JSON(
			http.StatusBadRequest,
			resp,
		)
	}

	reqEntity := entity.UserEntity{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	err = u.userService.CreateUserAccount(
		ctx,
		reqEntity,
	)

	if err != nil {
		log.Errorf(
			"[UserHandler-4] CreateUserAccount: %v",
			err,
		)

		resp.Massage = err.Error()
		resp.Data = nil

		return c.JSON(
			http.StatusInternalServerError,
			resp,
		)
	}

	resp.Massage = "success"
	resp.Data = nil

	return c.JSON(
		http.StatusCreated,
		resp,
	)
}

// ==========================================
// SIGN IN
// ==========================================

func (u *userHandler) SignIn(c echo.Context) error {
	var (
		req        = request.SignInRequest{}
		resp       = response.DefaultResponse{}
		respSignIn = response.SignInResponse{}
		ctx        = c.Request().Context()
	)

	// Bind body
	if err = c.Bind(&req); err != nil {
		log.Errorf(
			"[UserHandler-1] SignIn: %v",
			err,
		)

		resp.Massage = err.Error()
		resp.Data = nil

		return c.JSON(
			http.StatusUnprocessableEntity,
			resp,
		)
	}

	// Validasi
	if err = c.Validate(&req); err != nil {
		log.Errorf(
			"[UserHandler-2] SignIn: %v",
			err,
		)

		resp.Massage = err.Error()
		resp.Data = nil

		return c.JSON(
			http.StatusUnprocessableEntity,
			resp,
		)
	}

	reqEntity := entity.UserEntity{
		Email:    req.Email,
		Password: req.Password,
	}

	user, token, err := u.userService.SignIn(
		ctx,
		reqEntity,
	)

	if err != nil {
		if err.Error() == "404" {
			log.Errorf(
				"[UserHandler-3] SignIn: user not found",
			)

			resp.Massage = "user not found"
			resp.Data = nil

			return c.JSON(
				http.StatusNotFound,
				resp,
			)
		}

		log.Errorf(
			"[UserHandler-4] SignIn: %v",
			err,
		)

		resp.Massage = err.Error()
		resp.Data = nil

		return c.JSON(
			http.StatusInternalServerError,
			resp,
		)
	}

	// Data yang dikirim ke frontend
	respSignIn.ID = user.ID
	respSignIn.Name = user.Name
	respSignIn.Email = user.Email
	respSignIn.Role = user.RoleName
	respSignIn.Lat = user.Lat
	respSignIn.Lng = user.Lng
	respSignIn.Phone = user.Phone
	respSignIn.AccessToken = token

	resp.Massage = "success"
	resp.Data = respSignIn

	return c.JSON(
		http.StatusOK,
		resp,
	)
}

// ==========================================
// REGISTER ROUTES
// ==========================================

func NewUserHandler(
	e *echo.Echo,
	userService service.UserServiceInterface,
	cfg *config.Config,
) UserHandlerInterface {

	userHandler := &userHandler{
		userService: userService,
	}

	// Recover dari panic
	e.Use(middleware.Recover())

	// ==========================================
	// PUBLIC ROUTES
	// ==========================================

	e.POST(
		"/signin",
		userHandler.SignIn,
	)

	e.POST(
		"/signup",
		userHandler.CreateUserAccount,
	)

	// ==========================================
	// AUTH MIDDLEWARE
	// ==========================================

	mid := adapter.NewMiddlewareAdapter(cfg)

	// ==========================================
	// AUTH CHECK
	// Semua user yang sudah login boleh akses
	// ==========================================

	authGroup := e.Group(
		"/auth",
		mid.CheckToken(),
	)

	authGroup.GET(
		"/check",
		func(c echo.Context) error {

			session := c.Get("user")

			if session == nil {
				return c.JSON(
					http.StatusUnauthorized,
					echo.Map{
						"message": "unauthorized",
						"data":    nil,
					},
				)
			}

			return c.JSON(
				http.StatusOK,
				echo.Map{
					"message": "authenticated",
					"data":    session,
				},
			)
		},
	)

	profileGroup := e.Group(
		"",
		mid.CheckToken(),
	)

	profileGroup.GET(
		"/profile",
		userHandler.GetProfile,
	)

	profileGroup.PATCH(
		"/profile",
		userHandler.UpdateProfile,
	)

	profileGroup.POST(
		"/profile/photo",
		userHandler.UploadProfilePhoto,
	)

	e.Static(
		"/uploads",
		"uploads",
	)

	// ==========================================
	// ADMIN ROUTES
	// Hanya Super Admin
	// ==========================================

	adminGroup := e.Group(
		"/admin",
		mid.CheckToken(),
		mid.CheckAdmin(),
	)

	adminGroup.GET(
		"/check",
		func(c echo.Context) error {
			return c.JSON(
				http.StatusOK,
				echo.Map{
					"message": "admin authenticated",
				},
			)
		},
	)

	adminGroup.GET(
		"/users",
		userHandler.GetAllUsers,
	)

	return userHandler
}
