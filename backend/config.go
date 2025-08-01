package main

var jwtSecret = []byte("your_secret_key")

// GetJWTSecret returns the JWT secret
func GetJWTSecret() []byte {
	return jwtSecret
}