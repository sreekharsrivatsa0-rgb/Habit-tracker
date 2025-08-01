package controllers

import (
	"habit-tracker/backend/models"
	"net/http"
	"time"
	
	"github.com/gin-gonic/gin"
)

// GET /habits
func GetHabits(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	rows, err := db.Query("SELECT id, title, description, created_at, updated_at FROM habits WHERE user_id=$1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch habits"})
		return
	}
	defer rows.Close()

	var habits []models.Habit
	for rows.Next() {
		var habit models.Habit
		habit.UserID = int(userID.(float64))
		if err := rows.Scan(&habit.ID, &habit.Title, &habit.Description, &habit.CreatedAt, &habit.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse habit data"})
			return
		}
		habits = append(habits, habit)
	}

	c.JSON(http.StatusOK, habits)
}

// POST /habits
func CreateHabit(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var habit models.Habit
	if err := c.ShouldBindJSON(&habit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	habit.UserID = int(userID.(float64))
	habit.CreatedAt = time.Now()
	habit.UpdatedAt = time.Now()

	query := `INSERT INTO habits(user_id, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`

	err := db.QueryRow(query, habit.UserID, habit.Title, habit.Description, habit.CreatedAt, habit.UpdatedAt).Scan(&habit.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create habit"})
		return
	}

	c.JSON(http.StatusCreated, habit)
}

// DELETE /habits/:id
func DeleteHabit(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	habitID := c.Param("id") // Extract habit ID from URL path
	query := `DELETE FROM habits WHERE id=$1 AND user_id=$2`
	res, err := db.Exec(query, habitID, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete habit"})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Habit not found or unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Habit deleted successfully"})
}

// PUT /habits/:id
func UpdateHabit(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	habitID := c.Param("id")

	var updatedHabit models.Habit
	if err := c.ShouldBindJSON(&updatedHabit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE habits
		SET title=$1, description=$2, updated_at=$3
		WHERE id=$4 AND user_id=$5
		RETURNING id, title, description, created_at, updated_at
	`

	err := db.QueryRow(query, updatedHabit.Title, updatedHabit.Description, time.Now(), habitID, userID).Scan(
		&updatedHabit.ID, &updatedHabit.Title, &updatedHabit.Description, &updatedHabit.CreatedAt, &updatedHabit.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update habit"})
		return
	}

	c.JSON(http.StatusOK, updatedHabit)
}