package validator

import (
	"errors"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/gommon/log"
)

type Validator struct {
	Validator *validator.Validate
	Translator ut.Translator
}

func NewValidator() *Validator {
	en := en.New()
	uni := ut.New(en, en)
	trans, found := uni.GetTranslator("en")
	if !found {
		log.Fatalf("[Validator-1] NewValidator: Translator not found")
	}

	validate := validator.New()

	return &Validator{
		Validator: validate,
		Translator: trans,
	}
}

func (v *Validator) Validate(i interface{}) error {
	err := v.Validator.Struct(i)
	
	if err != nil {
		objects := err.(validator.ValidationErrors)
		for _, e := range objects {
			log.Infof("[Validator-1] Validate: %s", e.Translate(v.Translator))

			return errors.New(e.Translate(v.Translator))
		}
	}
	return nil
}