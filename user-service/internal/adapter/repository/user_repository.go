package repository

import (
	"context"
	"errors"
	"time"

	"user-service/internal/core/domain/entity"
	"user-service/internal/core/domain/model"

	"github.com/labstack/gommon/log"
	"gorm.io/gorm"
)

type UserRepositoryInterface interface {
	GetUserByEmail(
		ctx context.Context,
		email string,
	) (*entity.UserEntity, error)

	CreateUserAccount(
		ctx context.Context,
		req entity.UserEntity,
	) error

	GetAllUsers(
		ctx context.Context,
	) ([]entity.UserEntity, error)

	GetUserByID(
		ctx context.Context,
		id int64,
	) (*entity.UserEntity, error)

	UpdateProfile(
		ctx context.Context,
		id int64,
		req entity.UserEntity,
	) error
}

type userRepository struct {
	db *gorm.DB
}

func (u *userRepository) CreateUserAccount(
	ctx context.Context,
	req entity.UserEntity,
) error {

	modelUser := model.User{
		Name:       req.Name,
		Email:      req.Email,
		Password:   req.Password,
		IsVerified: true,
	}

	var customerRole model.Role

	if err :=
		u.db.
			WithContext(ctx).
			Where(
				"name = ?",
				"Customer",
			).
			First(
				&customerRole,
			).
			Error; err == nil {

		modelUser.Roles =
			[]model.Role{
				customerRole,
			}
	}

	if err :=
		u.db.
			WithContext(ctx).
			Create(
				&modelUser,
			).
			Error; err != nil {

		log.Errorf(
			"[UserRepository] CreateUserAccount: %v",
			err,
		)

		return err
	}

	currentTime :=
		time.Now()

	modelVerify :=
		model.VerificationToken{
			UserID: modelUser.ID,

			Token: req.Token,

			TokenType: "email_verification",

			ExpiresAt: currentTime.Add(
				time.Hour * 1,
			),
		}

	if err :=
		u.db.
			WithContext(ctx).
			Create(
				&modelVerify,
			).
			Error; err != nil {

		log.Errorf(
			"[UserRepository] Create verification token: %v",
			err,
		)

		return err
	}

	return nil
}
func (u *userRepository) GetUserByEmail(
	ctx context.Context,
	email string,
) (*entity.UserEntity, error) {

	modelUser :=
		model.User{}

	if err :=
		u.db.
			WithContext(ctx).
			Where(
				"email = ? AND is_verified = ?",
				email,
				true,
			).
			Preload(
				"Roles",
			).
			First(
				&modelUser,
			).
			Error; err != nil {

		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil,
				errors.New("404")
		}

		log.Errorf(
			"[UserRepository] GetUserByEmail: %v",
			err,
		)

		return nil, err
	}

	roleName := ""

	if len(
		modelUser.Roles,
	) > 0 {

		roleName =
			modelUser.Roles[0].Name
	}

	return &entity.UserEntity{
		ID: modelUser.ID,

		Name: modelUser.Name,

		Email: modelUser.Email,

		Password: modelUser.Password,

		RoleName: roleName,

		Address: modelUser.Address,

		Lat: modelUser.Lat,

		Lng: modelUser.Lng,

		Phone: modelUser.Phone,

		Photo: modelUser.Photo,

		IsVerified: modelUser.IsVerified,
	}, nil
}
func (u *userRepository) GetAllUsers(
	ctx context.Context,
) ([]entity.UserEntity, error) {

	var users []model.User

	err :=
		u.db.
			WithContext(ctx).
			Preload(
				"Roles",
			).
			Order(
				"id DESC",
			).
			Find(
				&users,
			).
			Error

	if err != nil {
		log.Errorf(
			"[UserRepository] GetAllUsers: %v",
			err,
		)

		return nil, err
	}

	result :=
		make(
			[]entity.UserEntity,
			0,
			len(users),
		)

	for _, user := range users {

		roleName := ""

		if len(
			user.Roles,
		) > 0 {

			roleName =
				user.Roles[0].Name
		}

		result =
			append(
				result,
				entity.UserEntity{
					ID: user.ID,

					Name: user.Name,

					Email: user.Email,

					RoleName: roleName,

					Address: user.Address,

					Lat: user.Lat,

					Lng: user.Lng,

					Phone: user.Phone,

					Photo: user.Photo,

					IsVerified: user.IsVerified,
				},
			)
	}

	return result, nil
}

func NewUserRepository(
	db *gorm.DB,
) UserRepositoryInterface {

	return &userRepository{
		db: db,
	}
}

func (u *userRepository) GetUserByID(
	ctx context.Context,
	id int64,
) (*entity.UserEntity, error) {
	var modelUser model.User

	err := u.db.
		WithContext(ctx).
		Preload("Roles").
		First(&modelUser, id).
		Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		log.Errorf("[UserRepository] GetUserByID: %v", err)
		return nil, err
	}

	roleName := ""
	if len(modelUser.Roles) > 0 {
		roleName = modelUser.Roles[0].Name
	}

	return &entity.UserEntity{
		ID:         modelUser.ID,
		Name:       modelUser.Name,
		Email:      modelUser.Email,
		Phone:      modelUser.Phone,
		Photo:      modelUser.Photo,
		RoleName:   roleName,
		Address:    modelUser.Address,
		Lat:        modelUser.Lat,
		Lng:        modelUser.Lng,
		IsVerified: modelUser.IsVerified,
	}, nil
}

func (u *userRepository) UpdateProfile(
	ctx context.Context,
	id int64,
	req entity.UserEntity,
) error {
	result := u.db.
		WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"name":    req.Name,
			"phone":   req.Phone,
			"address": req.Address,
			"lat":     req.Lat,
			"lng":     req.Lng,
			"photo":   req.Photo,
		})
	if result.Error != nil {
		log.Errorf("[UserRepository] UpdateProfile: %v", result.Error)
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}
	return nil
}
