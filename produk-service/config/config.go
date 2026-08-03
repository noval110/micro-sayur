package config

import "github.com/spf13/viper"

type App struct {
	AppPort string `json:"app_port"`
	AppEnv  string `json:"app_env"`
}

type PsqlDB struct {
	Host      string `json:"host"`
	Port      string `json:"port"`
	User      string `json:"user"`
	Password  string `json:"password"`
	Dbname    string `json:"db_name"`
	DBmaxOpen int    `json:"db_max_open"`
	DBmaxIdle int    `json:"db_max_idle"`
}

type Config struct {
	App  App    `json:"app"`
	Psql PsqlDB `json:"psql"`
}

func NewConfig() *Config {
	return &Config{
		App: App{
			AppPort: viper.GetString("APP_PORT"),
			AppEnv:  viper.GetString("APP_ENV"),
		},
		Psql: PsqlDB{
			Host:      viper.GetString("DATABASE_HOST"),
			Port:      viper.GetString("DATABASE_PORT"),
			User:      viper.GetString("DATABASE_USER"),
			Password:  viper.GetString("DATABASE_PASSWORD"),
			Dbname:    viper.GetString("DATABASE_NAME"),
			DBmaxOpen: viper.GetInt("DATABASE_MAX_OPEN_CONNECTIONS"),
			DBmaxIdle: viper.GetInt("DATABASE_MAX_IDLE_CONNECTIONS"),
		},
	}
}
