package cmd

import (
	"github.com/micro-sayur/order-service/internal/app"

	"github.com/spf13/cobra"
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Start order service HTTP server",
	Run: func(cmd *cobra.Command, args []string) {
		app.StartApp()
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}
