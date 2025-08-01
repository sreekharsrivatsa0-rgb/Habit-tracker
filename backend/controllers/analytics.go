package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"
	
	"github.com/gin-gonic/gin"
)

type HabitAnalytics struct {
	CurrentStreak  int
	LongestStreak  int
	CompletionRate string
}

func GetHabitAnalytics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	habitID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Habit ID"})
		return
	}

	// Step 1: Check if habit exists and belongs to user
	var title string
	err = db.QueryRow("SELECT title FROM habits WHERE id = $1 AND user_id = $2", habitID, userID).Scan(&title)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Habit not found"})
		return
	}

	// Step 2: Fetch all completion dates
	rows, err := db.Query(`
		SELECT date_completed
		FROM habit_completions
		WHERE habit_id = $1 AND user_id = $2
		ORDER BY date_completed ASC
	`, habitID, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch completions"})
		return
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
		c.JSON(http.StatusOK, gin.H{
			"habit_id":        habitID,
			"title":           title,
			"current_streak":  0,
			"longest_streak":  0,
			"total_completions": 0,
			"start_date":      nil,
			"completion_rate": "0%",
		})
		return
	}

	// Step 3: Compute Analytics
	analytics := ComputeHabitAnalytics(dates)

	c.JSON(http.StatusOK, gin.H{
		"habit_id":          habitID,
		"title":             title,
		"current_streak":    analytics.CurrentStreak,
		"longest_streak":    analytics.LongestStreak,
		"total_completions": len(dates),
		"start_date":        dates[0].Format("2006-01-02"),
		"completion_rate":   analytics.CompletionRate,
	})
}

func ComputeHabitAnalytics(dates []time.Time) HabitAnalytics {
	if len(dates) == 0 {
		return HabitAnalytics{}
	}

	// Normalize dates: strip time component (in case any time is set)
	dateMap := make(map[time.Time]bool)
	for _, d := range dates {
		normalized := time.Date(d.Year(), d.Month(), d.Day(), 0, 0, 0, 0, d.Location())
		dateMap[normalized] = true
	}

	// Convert map to sorted slice again
	var allDates []time.Time
	for d := range dateMap {
		allDates = append(allDates, d)
	}
	sort.Slice(allDates, func(i, j int) bool {
		return allDates[i].Before(allDates[j])
	})

	// Initialize streak counters
	currentStreak := 0
	longestStreak := 0
	streak := 0

	// Used to calculate streaks
	for i := 0; i < len(allDates); i++ {
		if i == 0 || allDates[i].Sub(allDates[i-1]) == 24*time.Hour {
			streak++
		} else {
			streak = 1
		}
		if streak > longestStreak {
			longestStreak = streak
		}
	}

	// Calculate current streak (check backwards from today)
	today := time.Now()
	for i := len(allDates) - 1; i >= 0; i-- {
		d := allDates[i]
		if today.Sub(d).Hours() > 24 {
			break
		}
		if today.Sub(d).Hours() <= 24 && today.Sub(d).Hours() >= 0 {
			currentStreak++
			today = d
		}
	}

	// Completion rate = (completions / days from start) * 100
	startDate := allDates[0]
	daysSinceStart := int(time.Since(startDate).Hours()/24) + 1
	completionRate := float64(len(allDates)) / float64(daysSinceStart) * 100

	return HabitAnalytics{
		CurrentStreak:  currentStreak,
		LongestStreak:  longestStreak,
		CompletionRate: fmt.Sprintf("%.2f%%", completionRate),
	}
}

// GET /habits/summary - Get overall habit summary for dashboard
func GetHabitSummary(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get total habits count
	var totalHabits int
	err := db.QueryRow(`SELECT COUNT(*) FROM habits WHERE user_id=$1`, userID).Scan(&totalHabits)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total habits"})
		return
	}

	// Get total completions count
	var totalCompletions int
	err = db.QueryRow(`SELECT COUNT(*) FROM habit_completions WHERE user_id=$1`, userID).Scan(&totalCompletions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total completions"})
		return
	}

	// Get longest streak across all habits
	var longestStreak int
	err = db.QueryRow(`SELECT COALESCE(MAX(longest_streak), 0) FROM habit_streaks WHERE user_id=$1`, userID).Scan(&longestStreak)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch longest streak"})
		return
	}

	// Get most consistent habit (highest current streak)
	var mostConsistentHabitTitle sql.NullString
	err = db.QueryRow(`
		SELECT h.title
		FROM habit_streaks s
		JOIN habits h ON s.habit_id = h.id
		WHERE s.user_id=$1
		ORDER BY s.current_streak DESC
		LIMIT 1
	`, userID).Scan(&mostConsistentHabitTitle)
	
	// Handle case where user has no habits or streaks
	mostConsistent := ""
	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch most consistent habit"})
		return
	} else if mostConsistentHabitTitle.Valid {
		mostConsistent = mostConsistentHabitTitle.String
	}

	summary := gin.H{
		"total_habits":       totalHabits,
		"total_completions":  totalCompletions,
		"longest_streak":     longestStreak,
		"most_consistent":    mostConsistent,
	}

	c.JSON(http.StatusOK, summary)
}