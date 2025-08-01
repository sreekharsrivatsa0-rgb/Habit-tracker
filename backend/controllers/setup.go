package controllers

import (
    "database/sql"
)

var db *sql.DB
var jwtSecret []byte

// SetDB sets the database connection for all controllers
func SetDB(database *sql.DB) {
    db = database
}

// SetJWTSecret sets the JWT secret for authentication
func SetJWTSecret(secret []byte) {
    jwtSecret = secret
}