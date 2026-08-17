package service

import (
	"context"
	"errors"
	"fmt"
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

type userService struct {
	repo repository.UserRepositoryInterface

	cfg *config.Config

	jwtService JwtServiceInterface
}

// ==========================================
// CREATE USER
// ==========================================

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

	urlVerify :=
		fmt.Sprintf(
			"http://localhost:8080/verify?token=%v",
			req.Token,
		)

	messageParam :=
		fmt.Sprintf(
			"Please verify your account with click link below:%v",
			urlVerify,
		)

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

// ==========================================
// SIGN IN
// ==========================================

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

	token, err :=
		u.jwtService.GenerateToken(
			user.ID,
		)

	if err != nil {
		return nil, "", err
	}

	sessionData :=
		map[string]interface{}{
			"user_id": user.ID,

			"name": user.Name,

			"email": user.Email,

			"role": user.RoleName,

			"logged_in": "true",

			"created_at": time.Now().String(),

			"token": token,
		}

	redisConn :=
		config.NewRedisClient()

	err =
		redisConn.
			HSet(
				ctx,
				token,
				sessionData,
			).
			Err()

	if err != nil {

		log.Errorf(
			"[UserService] Redis session error: %v",
			err,
		)

		return nil, "", err
	}

	return user,
		token,
		nil
}

// ==========================================
// GET ALL USERS
// ADMIN
// ==========================================

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
