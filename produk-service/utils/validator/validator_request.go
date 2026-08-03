package validator

import (
	"errors"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	enTranslations "github.com/go-playground/validator/v10/translations/en"
	"github.com/labstack/gommon/log"
)

type Validator struct {
	Validator  *validator.Validate
	Translator ut.Translator
}

func NewValidator() *Validator {
	validate := validator.New()

	// Inisialisasi Translator Bahasa Inggris
	english := en.New()
	uni := ut.New(english, english)
	trans, _ := uni.GetTranslator("en")

	// Daftarkan translation bawaan ke validator
	_ = enTranslations.RegisterDefaultTranslations(validate, trans)

	return &Validator{
		Validator:  validate,
		Translator: trans,
	}
}

func (v *Validator) Validate(i interface{}) error {
	err := v.Validator.Struct(i)
	if err != nil {
		if errs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range errs {
				log.Infof("[Validator] Error: %s", e.Error())
				return errors.New(e.Translate(v.Translator))
			}
		}
		return err
	}
	return nil
}