package service

import (
	"context"

	"product-service/internal/adapter/repository"
	"product-service/internal/core/domain/entity"
)

type ProductServiceInterface interface {
	GetAllProducts(ctx context.Context) ([]entity.ProductEntity, error)

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

type productService struct {
	repo repository.ProductRepositoryInterface
}

func NewProductService(
	repo repository.ProductRepositoryInterface,
) ProductServiceInterface {
	return &productService{
		repo: repo,
	}
}

func (s *productService) GetAllProducts(
	ctx context.Context,
) ([]entity.ProductEntity, error) {
	return s.repo.GetAllProducts(ctx)
}

func (s *productService) GetProductByID(
	ctx context.Context,
	id int64,
) (*entity.ProductEntity, error) {
	return s.repo.GetProductByID(
		ctx,
		id,
	)
}

func (s *productService) ReduceStock(
	ctx context.Context,
	id int64,
	quantity int,
) error {
	return s.repo.ReduceStock(
		ctx,
		id,
		quantity,
	)
}

func (s *productService) CreateProduct(
	ctx context.Context,
	req entity.ProductEntity,
) error {
	return s.repo.CreateProduct(
		ctx,
		req,
	)
}

func (s *productService) UpdateProduct(
	ctx context.Context,
	id int64,
	req entity.ProductEntity,
) error {
	return s.repo.UpdateProduct(
		ctx,
		id,
		req,
	)
}

func (s *productService) DeleteProduct(
	ctx context.Context,
	id int64,
) error {
	return s.repo.DeleteProduct(
		ctx,
		id,
	)
}