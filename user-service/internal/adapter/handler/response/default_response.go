package response

type DefaultResponse struct {
	Massage string `json:"message"`
	Data interface{} `json:"data"`
}