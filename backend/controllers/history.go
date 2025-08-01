package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"
	
	"github.com/gin-gonic/gin"
)

// GET /habits/<id>/history
func GetHabitHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	habitID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid habit ID"})
		return
	}

	query := `
		SELECT date_completed
		FROM habit_completions
		WHERE habit_id = $1 AND user_id = $2
		ORDER BY date_completed ASC
	`

	rows, err := db.Query(query, habitID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}
	defer rows.Close()

	var history []string
	for rows.Next() {
		var date time.Time
		if err := rows.Scan(&date); err != nil {
			fmt.Println("scan error: ", err)
			continue
		}
		history = append(history, date.Format("2006-01-02"))
	}

	c.JSON(http.StatusOK, gin.H{
		"habit_id": habitID,
		"history":  history,
	})
}