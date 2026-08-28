package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"user-service/config"
	"user-service/internal/adapter/massage"
	"user-service/internal/adapter/repository"
	"user-service/internal/core/domain/entity"
	"user-service/utils/conv"

	"github.com/google/uuid"
	"github.com/labstack/gommon/log"
)

type UserServiceInterface interface {
	SignIn(
		ctx context.Context,
		req entity.UserEntity,
	) (*entity.UserEntity, string, error)

	GoogleSignIn(ctx context.Context, name, email string) (*entity.UserEntity, string, error)

	CreateUserAccount(
		ctx context.Context,
		req entity.UserEntity,
	) error

	GetAllUsers(
		ctx context.Context,
	) ([]entity.UserEntity, error)

	GetProfile(
		ctx context.Context,
		userID int64,
	) (*entity.UserEntity, error)

	UpdateProfile(
		ctx context.Context,
		userID int64,
		req entity.UserEntity,
	) (*entity.UserEntity, error)
}

func (u *userService) createSession(ctx context.Context, user *entity.UserEntity) (string, error) {
	token, err := u.jwtService.GenerateToken(user.ID)
	if err != nil {
		return "", err
	}
	sessionData := map[string]interface{}{
		"user_id": user.ID, "name": user.Name, "email": user.Email,
		"role": user.RoleName, "logged_in": "true",
		"created_at": time.Now().String(), "token": token,
	}
	if err := config.NewRedisClient().HSet(ctx, token, sessionData).Err(); err != nil {
		log.Errorf("[UserService] Redis session error: %v", err)
		return "", err
	}
	return token, nil
}

func (u *userService) GoogleSignIn(ctx context.Context, name, email string) (*entity.UserEntity, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	name = strings.TrimSpace(name)
	if email == "" {
		return nil, "", errors.New("email Google tidak ditemukan")
	}
	if name == "" {
		name = strings.Split(email, "@")[0]
	}

	user, err := u.repo.FindUserByEmail(ctx, email)
	if err != nil && err.Error() == "404" {
		if err := u.repo.CreateGoogleUser(ctx, entity.UserEntity{
			Name: name, Email: email, Password: uuid.NewString(),
		}); err != nil {
			return nil, "", err
		}
		user, err = u.repo.FindUserByEmail(ctx, email)
	}
	if err != nil {
		return nil, "", err
	}
	if !user.IsVerified {
		if err := u.repo.MarkUserVerified(ctx, user.ID); err != nil {
			return nil, "", err
		}
		user.IsVerified = true
	}
	token, err := u.createSession(ctx, user)
	return user, token, err
}

type userService struct {
	repo repository.UserRepositoryInterface

	cfg *config.Config

	jwtService JwtServiceInterface
}

func (
	u *userService,
) CreateUserAccount(
	ctx context.Context,
	req entity.UserEntity,
) error {

	password, err :=
		conv.HashPassword(
			req.Password,
		)

	if err != nil {
		return err
	}

	req.Password =
		password

	token :=
		uuid.New().
			String()

	req.Token =
		token

	if err :=
		u.repo.CreateUserAccount(
			ctx,
			req,
		); err != nil {

		return err
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	urlVerify :=
		fmt.Sprintf(
			"%s/verify?token=%v",
			strings.TrimRight(frontendURL, "/"),
			req.Token,
		)

	messageParam := fmt.Sprintf(`
	<p>Halo!</p>
	<p>Terima kasih sudah mendaftar di <strong>Sayur-day</strong>.</p>
	<p>Silakan verifikasi akun kamu dengan menekan tombol berikut:</p>

	<p style="margin:24px 0;">
		<a href="%s"
			style="
				background:#16a34a;
				color:#ffffff;
				padding:12px 22px;
				text-decoration:none;
				border-radius:8px;
				display:inline-block;
				font-weight:bold;
			">
			Verifikasi Akun
		</a>
	</p>

	<p style="font-size:13px;color:#666;">
		Jika tombol tidak bisa digunakan, buka link berikut:<br>
		<a href="%s">%s</a>
	</p>
`, urlVerify, urlVerify, urlVerify)

	if err :=
		massage.PublishMassage(
			req.Email,
			messageParam,
			"email_verification",
		); err != nil {

		return err
	}

	return nil
}
func (
	u *userService,
) SignIn(
	ctx context.Context,
	req entity.UserEntity,
) (*entity.UserEntity, string, error) {

	user, err :=
		u.repo.GetUserByEmail(
			ctx,
			req.Email,
		)

	if err != nil {
		return nil, "", err
	}

	if checkPass :=
		conv.CheckPasswordHash(
			req.Password,
			user.Password,
		); !checkPass {

		return nil,
			"",
			errors.New(
				"password is incorrect",
			)
	}

	token, err := u.createSession(ctx, user)
	if err != nil {
		return nil, "", err
	}

	return user,
		token,
		nil
}
func (
	u *userService,
) GetAllUsers(
	ctx context.Context,
) ([]entity.UserEntity, error) {

	return u.repo.GetAllUsers(
		ctx,
	)
}

func NewUserService(
	repo repository.UserRepositoryInterface,
	cfg *config.Config,
	jwtService JwtServiceInterface,
) UserServiceInterface {

	return &userService{
		repo: repo,

		cfg: cfg,

		jwtService: jwtService,
	}
}

func (u *userService) GetProfile(
	ctx context.Context,
	userID int64,
) (*entity.UserEntity, error) {
	if userID < 1 {
		return nil, errors.New("user id tidak valid")
	}
	return u.repo.GetUserByID(ctx, userID)
}

func (u *userService) UpdateProfile(
	ctx context.Context,
	userID int64,
	req entity.UserEntity,
) (*entity.UserEntity, error) {
	if userID < 1 {
		return nil, errors.New("user id tidak valid")
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Address = strings.TrimSpace(req.Address)
	req.Lat = strings.TrimSpace(req.Lat)
	req.Lng = strings.TrimSpace(req.Lng)
	req.Photo = strings.TrimSpace(req.Photo)
	if req.Name == "" {
		return nil, errors.New("nama wajib diisi")
	}
	if err := u.repo.UpdateProfile(ctx, userID, req); err != nil {
		return nil, err
	}
	return u.repo.GetUserByID(ctx, userID)
}
