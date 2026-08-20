package cmd

import (
	"log"
	"os"

	"user-service/internal/app"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "start",
	Long:  `start`,
	Run: func(cmd *cobra.Command, args []string) {
		if err := godotenv.Overload(); err != nil {
			log.Println("Warning: .env tidak ditemukan")
		}

		log.Printf("REDIS_HOST loaded: %t", os.Getenv("REDIS_HOST") != "")
		log.Printf("REDIS_PORT loaded: %t", os.Getenv("REDIS_PORT") != "")
		log.Printf("REDIS_PASSWORD loaded: %t", os.Getenv("REDIS_PASSWORD") != "")
		log.Printf("REDIS_TLS: %s", os.Getenv("REDIS_TLS"))

		app.RunServer()
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}
