package seeds

import (
	"log"
	"product-service/internal/core/domain/model"

	"gorm.io/gorm"
)

func SeedProducts(db *gorm.DB) {
	products := []model.Product{
		{Name: "Bayam Hijau Organik", Category: "Sayuran Segar", Price: 8500, Stock: 50, Unit: "250 gram", Image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500", Rating: 4.9},
		{Name: "Wortel Berastagi Super", Category: "Sayuran Segar", Price: 12000, Stock: 30, Unit: "500 gram", Image: "https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=500", Rating: 4.8},
		{Name: "Alpukat Mentega Super", Category: "Buah Segar", Price: 35000, Stock: 20, Unit: "1 kg", Image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500", Rating: 5.0},
	}

	for _, p := range products {
		if err := db.FirstOrCreate(&p, model.Product{Name: p.Name}).Error; err != nil {
			log.Fatalf("Seed error: %v", err)
		}
	}
}
