package controllers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"
	
	"github.com/gin-gonic/gin"
)

func CompleteHabit(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid habit ID"})
		return
	}

	// Get date from query parameter, default to today if not provided
	dateStr := c.Query("date")
	var completionDate time.Time
	
	if dateStr != "" {
		// Parse the provided date
		parsedDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}
		
		// Don't allow future dates
		if parsedDate.After(time.Now()) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot mark habit complete for future dates"})
			return
		}
		
		completionDate = parsedDate
	} else {
		// Default to today
		completionDate = time.Now()
	}

	completionDateStr := completionDate.Format("2006-01-02")

	// Step 1: Insert into habit_completions
	insertQuery := `
		INSERT INTO habit_completions (habit_id, user_id, date_completed)
		VALUES ($1, $2, $3)
		ON CONFLICT (habit_id, date_completed) DO NOTHING
		RETURNING id
	`

	var completionID sql.NullInt64
	err = db.QueryRow(insertQuery, id, userID, completionDateStr).Scan(&completionID)
	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark habit as complete", "details": err.Error()})
		return
	}

	// Check if this was a duplicate (no new row inserted)
	if !completionID.Valid {
		c.JSON(http.StatusOK, gin.H{
			"message": "Habit was already marked complete for this date",
			"date": completionDateStr,
		})
		return
	}

	// Step 2: Recalculate streaks based on all completion dates
	// This is more robust than the previous approach
	err = recalculateStreaks(id, int(userID.(float64)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update streak", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Habit marked as complete with streak updated",
		"date": completionDateStr,
	})
}

// Helper function to recalculate streaks based on all completion dates
func recalculateStreaks(habitID, userID int) error {
	// Get all completion dates for this habit, sorted
	rows, err := db.Query(`
		SELECT date_completed
		FROM habit_completions
		WHERE habit_id = $1 AND user_id = $2
		ORDER BY date_completed ASC
	`, habitID, userID)

	if err != nil {
		return err
	}
	defer rows.Close()

	var dates []time.Time
	for rows.Next() {
		var d time.Time
		if err := rows.Scan(&d); err == nil {
			dates = append(dates, d)
		}
	}

	if len(dates) == 0 {
		// No completions, remove streak record if it exists
		_, err = db.Exec(`DELETE FROM habit_streaks WHERE habit_id = $1 AND user_id = $2`, habitID, userID)
		return err
	}

	// Calculate current and longest streaks
	currentStreak, longestStreak := calculateStreaks(dates)
	lastCompleted := dates[len(dates)-1]

	// Upsert the streak record
	upsertQuery := `
		INSERT INTO habit_streaks (habit_id, user_id, current_streak, longest_streak, last_completed)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (habit_id, user_id) 
		DO UPDATE SET 
			current_streak = EXCLUDED.current_streak,
			longest_streak = EXCLUDED.longest_streak,
			last_completed = EXCLUDED.last_completed
	`

	_, err = db.Exec(upsertQuery, habitID, userID, currentStreak, longestStreak, lastCompleted)
	return err
}

// Helper function to calculate streaks from a sorted list of dates
func calculateStreaks(dates []time.Time) (currentStreak, longestStreak int) {
	if len(dates) == 0 {
		return 0, 0
	}

	// Remove duplicates and ensure dates are normalized (date only, no time)
	dateMap := make(map[string]bool)
	var uniqueDates []time.Time
	
	for _, d := range dates {
		dateStr := d.Format("2006-01-02")
		if !dateMap[dateStr] {
			dateMap[dateStr] = true
			normalized := time.Date(d.Year(), d.Month(), d.Day(), 0, 0, 0, 0, d.Location())
			uniqueDates = append(uniqueDates, normalized)
		}
	}

	if len(uniqueDates) == 0 {
		return 0, 0
	}

	// Calculate longest streak by finding consecutive dates
	longestStreak = 1
	currentStreakInLoop := 1

	for i := 1; i < len(uniqueDates); i++ {
		daysDiff := int(uniqueDates[i].Sub(uniqueDates[i-1]).Hours() / 24)
		
		if daysDiff == 1 {
			// Consecutive day
			currentStreakInLoop++
		} else {
			// Break in streak
			if currentStreakInLoop > longestStreak {
				longestStreak = currentStreakInLoop
			}
			currentStreakInLoop = 1
		}
	}

	// Check if the last streak is the longest
	if currentStreakInLoop > longestStreak {
		longestStreak = currentStreakInLoop
	}

	// Calculate current streak (from most recent date backwards)
	currentStreak = 1
	today := time.Now()
	lastDate := uniqueDates[len(uniqueDates)-1]

	// Only count as current streak if the last completion was recent (today or yesterday)
	daysSinceLastCompletion := int(today.Sub(lastDate).Hours() / 24)
	if daysSinceLastCompletion > 1 {
		currentStreak = 0
	} else {
		// Count backwards from the last date
		for i := len(uniqueDates) - 2; i >= 0; i-- {
			daysDiff := int(uniqueDates[i+1].Sub(uniqueDates[i]).Hours() / 24)
			if daysDiff == 1 {
				currentStreak++
			} else {
				break
			}
		}
	}

	return currentStreak, longestStreak
}

// GET /habits/completed
func GetCompletedHabits(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	query := `
		SELECT hc.id, hc.habit_id, hc.date_completed, h.title, h.description
		FROM habit_completions hc
		JOIN habits h ON hc.habit_id = h.id
		WHERE hc.user_id = $1
		ORDER BY hc.date_completed DESC
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "failed to fetch completed habits",
			"details": err.Error(),
		})
		return
	}

	defer rows.Close()

	var completedHabits []gin.H

	for rows.Next() {
		var id int
		var habitID int
		var dateCompleted time.Time
		var title, description string

		err := rows.Scan(&id, &habitID, &dateCompleted, &title, &description)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error reading completed habit data"})
			return
		}

		completedHabits = append(completedHabits, gin.H{
			"id":             id,
			"habit_id":       habitID,
			"title":          title,
			"description":    description,
			"date_completed": dateCompleted.Format("2006-01-02"),
		})
	}

	c.JSON(http.StatusOK, completedHabits)
}

// GET /habits/streak
func GetHabitsStreaks(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Query to fetch habit info with streak data
	query := `
		SELECT h.id, h.title, h.description,
		       s.current_streak, s.longest_streak, s.last_completed
		FROM habits h
		LEFT JOIN habit_streaks s ON h.id = s.habit_id
		WHERE h.user_id = $1
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch habits with streaks"})
		return
	}
	defer rows.Close()

	var results []gin.H

	for rows.Next() {
		var id int
		var title, description string
		var currentStreak, longestStreak sql.NullInt64
		var lastCompleted sql.NullTime

		if err := rows.Scan(&id, &title, &description, &currentStreak, &longestStreak, &lastCompleted); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error reading result"})
			return
		}

		lastCompletedStr := ""
		if lastCompleted.Valid {
			lastCompletedStr = lastCompleted.Time.Format("2006-01-02")
		}

		results = append(results, gin.H{
			"habit_id":       id,
			"title":          title,
			"description":    description,
			"current_streak": currentStreak.Int64,
			"longest_streak": longestStreak.Int64,
			"last_completed": lastCompletedStr,
		})
	}

	c.JSON(http.StatusOK, results)
}