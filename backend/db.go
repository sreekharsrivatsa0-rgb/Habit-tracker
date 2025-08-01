package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func InitDB() (*sql.DB, error) {
	connStr := "host=localhost port=5432 user=habituser password=Lionheart@123 dbname=habitdb sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Error opening database: %v", err)
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("❌ Error connecting to the database: %v", err)
		return nil, err
	}

	fmt.Println("✅ Successfully connected to PostgreSQL database!")
	return db, nil
}
