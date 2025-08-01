package main

import (
	"habit-tracker/backend/controllers"
	"log"
	
	"github.com/gin-gonic/gin"
)

// CORS middleware
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	db, err := InitDB()
	if err != nil {
		log.Fatalf("❌ Error connecting to the database: %v", err)
	}

	// Pass db and jwtSecret to controllers
	controllers.SetDB(db)
	controllers.SetJWTSecret(GetJWTSecret())

	r := gin.Default()
	
	// Add CORS middleware
	r.Use(CORSMiddleware())

	// These are public routes
	r.POST("/users", controllers.RegisterUser)
	r.POST("/login", controllers.LoginUser)
	
	// These are protected by JWT middleware
	r.GET("/habits", AuthMiddleware(), controllers.GetHabits)
	r.POST("/habits", AuthMiddleware(), controllers.CreateHabit)
	r.PUT("/habits/:id", AuthMiddleware(), controllers.UpdateHabit)
	r.DELETE("/habits/:id", AuthMiddleware(), controllers.DeleteHabit)
	r.POST("/habits/:id", AuthMiddleware(), controllers.CompleteHabit)
	r.GET("/habits/completed", AuthMiddleware(), controllers.GetCompletedHabits)
	r.GET("/habits/streak", AuthMiddleware(), controllers.GetHabitsStreaks)
	r.GET("/habits/:id/history", AuthMiddleware(), controllers.GetHabitHistory)
	r.GET("/habits/:id/analytics", AuthMiddleware(), controllers.GetHabitAnalytics)
	r.GET("/habits/summary", AuthMiddleware(), controllers.GetHabitSummary)

	log.Println("🚀 Server starting on http://localhost:8080")
	r.Run() // Default port :8080
}