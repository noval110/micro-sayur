package repository

import (
	"context"
	"errors"

	"product-service/internal/core/domain/entity"
	"product-service/internal/core/domain/model"

	"github.com/labstack/gommon/log"
	"gorm.io/gorm"
)

var ErrInsufficientStock = errors.New(
	"stok produk tidak mencukupi atau produk tidak ditemukan",
)

var ErrProductNotFound = errors.New(
	"produk tidak ditemukan",
)

type ProductRepositoryInterface interface {
	GetAllProducts(
		ctx context.Context,
	) ([]entity.ProductEntity, error)

	GetProductByID(
		ctx context.Context,
		id int64,
	) (*entity.ProductEntity, error)

	ReduceStock(
		ctx context.Context,
		id int64,
		quantity int,
	) error

	CreateProduct(
		ctx context.Context,
		req entity.ProductEntity,
	) error

	UpdateProduct(
		ctx context.Context,
		id int64,
		req entity.ProductEntity,
	) error

	DeleteProduct(
		ctx context.Context,
		id int64,
	) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(
	db *gorm.DB,
) ProductRepositoryInterface {

	return &productRepository{
		db: db,
	}
}
func (r *productRepository) GetAllProducts(
	ctx context.Context,
) ([]entity.ProductEntity, error) {

	var models []model.Product

	if err :=
		r.db.
			WithContext(ctx).
			Find(&models).
			Error; err != nil {

		log.Errorf(
			"[ProductRepository] GetAllProducts: %v",
			err,
		)

		return nil, err
	}

	entities :=
		make(
			[]entity.ProductEntity,
			0,
			len(models),
		)

	for _, m := range models {

		entities =
			append(
				entities,
				entity.ProductEntity{
					ID:       m.ID,
					Name:     m.Name,
					Category: m.Category,
					Price:    m.Price,
					Stock:    m.Stock,
					Unit:     m.Unit,
					Image:    m.Image,
					Rating:   m.Rating,
				},
			)
	}

	return entities, nil
}
func (r *productRepository) GetProductByID(
	ctx context.Context,
	id int64,
) (*entity.ProductEntity, error) {

	var product model.Product

	if err :=
		r.db.
			WithContext(ctx).
			First(
				&product,
				id,
			).
			Error; err != nil {

		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, ErrProductNotFound
		}

		log.Errorf(
			"[ProductRepository] GetProductByID: %v",
			err,
		)

		return nil, err
	}

	return &entity.ProductEntity{
		ID:       product.ID,
		Name:     product.Name,
		Category: product.Category,
		Price:    product.Price,
		Stock:    product.Stock,
		Unit:     product.Unit,
		Image:    product.Image,
		Rating:   product.Rating,
	}, nil
}
func (r *productRepository) ReduceStock(
	ctx context.Context,
	id int64,
	quantity int,
) error {

	result :=
		r.db.
			WithContext(ctx).
			Model(
				&model.Product{},
			).
			Where(
				"id = ? AND stock >= ?",
				id,
				quantity,
			).
			Update(
				"stock",
				gorm.Expr(
					"stock - ?",
					quantity,
				),
			)

	if result.Error != nil {

		log.Errorf(
			"[ProductRepository] ReduceStock: %v",
			result.Error,
		)

		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrInsufficientStock
	}

	return nil
}
func (r *productRepository) CreateProduct(
	ctx context.Context,
	req entity.ProductEntity,
) error {

	product :=
		model.Product{
			Name:     req.Name,
			Category: req.Category,
			Price:    req.Price,
			Stock:    req.Stock,
			Unit:     req.Unit,
			Image:    req.Image,
		}

	if err :=
		r.db.
			WithContext(ctx).
			Create(&product).
			Error; err != nil {

		log.Errorf(
			"[ProductRepository] CreateProduct: %v",
			err,
		)

		return err
	}

	return nil
}
func (r *productRepository) UpdateProduct(
	ctx context.Context,
	id int64,
	req entity.ProductEntity,
) error {

	result :=
		r.db.
			WithContext(ctx).
			Model(
				&model.Product{},
			).
			Where(
				"id = ?",
				id,
			).
			Updates(
				map[string]interface{}{
					"name":     req.Name,
					"category": req.Category,
					"price":    req.Price,
					"stock":    req.Stock,
					"unit":     req.Unit,
					"image":    req.Image,
				},
			)

	if result.Error != nil {

		log.Errorf(
			"[ProductRepository] UpdateProduct: %v",
			result.Error,
		)

		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
}
func (r *productRepository) DeleteProduct(
	ctx context.Context,
	id int64,
) error {

	result :=
		r.db.
			WithContext(ctx).
			Delete(
				&model.Product{},
				id,
			)

	if result.Error != nil {

		log.Errorf(
			"[ProductRepository] DeleteProduct: %v",
			result.Error,
		)

		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
}
