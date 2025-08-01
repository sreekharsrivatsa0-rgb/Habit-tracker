import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import axios from '../api/axios';

function Analytics() {
    const [habits, setHabits] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedHabit, setSelectedHabit] = useState(null);
    const { theme } = useTheme();

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/habits');
            setHabits(res.data || []);
            
            // Auto-select first habit if available
            if (res.data && res.data.length > 0) {
                setSelectedHabit(res.data[0].id);
                fetchAnalytics(res.data[0].id);
            }
            setError('');
        } catch (err) {
            console.error('Error fetching habits:', err);
            setError('Failed to fetch habits');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (habitId) => {
        try {
            const res = await axios.get(`/habits/${habitId}/analytics`);
            setAnalytics(prev => ({ ...prev, [habitId]: res.data }));
            setError('');
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to fetch analytics for this habit');
        }
    };

    const handleHabitSelect = (habitId) => {
        setSelectedHabit(habitId);
        if (!analytics[habitId]) {
            fetchAnalytics(habitId);
        }
    };

    const getMotivationalMessage = (analytics) => {
        if (!analytics) return "Select a habit to see your amazing progress! 🎯";
        
        const { current_streak, longest_streak, completion_rate } = analytics;
        const rate = parseFloat(completion_rate?.replace('%', '') || '0');
        
        if (current_streak >= 7) {
            return `🔥 Incredible! You're on a ${current_streak}-day streak! You're building an amazing habit!`;
        } else if (current_streak >= 3) {
            return `⭐ Great job! ${current_streak} days in a row! Keep the momentum going!`;
        } else if (rate >= 80) {
            return `🏆 Outstanding consistency! ${completion_rate} completion rate shows real dedication!`;
        } else if (rate >= 50) {
            return `💪 You're doing well! ${completion_rate} completion rate - every step counts!`;
        } else if (longest_streak > 0) {
            return `🌟 You've done ${longest_streak} days before - you can do it again! Don't give up!`;
        } else {
            return `🚀 Every journey starts with a single step. Your next completion could be the start of something amazing!`;
        }
    };

    const getStreakIcon = (streak) => {
        if (streak >= 30) return '🏆';
        if (streak >= 14) return '🔥';
        if (streak >= 7) return '⭐';
        if (streak >= 3) return '💪';
        return '🌱';
    };

    const getCompletionRateColor = (rate) => {
        const numRate = parseFloat(rate?.replace('%', '') || '0');
        if (numRate >= 80) return theme.buttonSuccess;
        if (numRate >= 60) return theme.buttonWarning;
        if (numRate >= 40) return '#e67e22';
        return theme.buttonDanger;
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            '@media (max-width: 768px)': {
                padding: '15px'
            }
        },
        title: {
            color: theme.text,
            marginBottom: '10px'
        },
        subtitle: {
            color: theme.textSecondary,
            marginBottom: '30px',
            '@media (max-width: 768px)': {
                marginBottom: '20px',
                fontSize: '14px'
            }
        },
        card: {
            backgroundColor: theme.cardBackground,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: theme.shadowLarge,
            border: `1px solid ${theme.border}`,
            marginBottom: '20px',
            '@media (max-width: 768px)': {
                padding: '20px',
                marginBottom: '15px'
            }
        },
        cardTitle: {
            marginTop: 0,
            color: theme.text,
            marginBottom: '20px'
        },
        habitGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '15px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                gap: '10px'
            }
        },
        habitButton: {
            padding: '15px',
            borderRadius: '8px',
            border: `2px solid ${theme.border}`,
            backgroundColor: theme.cardBackground,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.3s ease',
            '@media (max-width: 768px)': {
                padding: '12px'
            }
        },
        habitButtonActive: {
            border: `2px solid ${theme.buttonPrimary}`,
            backgroundColor: theme.buttonPrimary + '10'
        },
        motivationalBanner: {
            background: theme.gradientPrimary,
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: theme.shadowLarge,
            '@media (max-width: 768px)': {
                padding: '20px'
            }
        },
        motivationalIcon: {
            fontSize: '32px',
            marginBottom: '15px',
            '@media (max-width: 768px)': {
                fontSize: '28px',
                marginBottom: '10px'
            }
        },
        motivationalTitle: {
            margin: '0 0 10px 0',
            fontSize: '24px',
            '@media (max-width: 768px)': {
                fontSize: '20px'
            }
        },
        motivationalSubtitle: {
            margin: 0,
            opacity: 0.9,
            fontSize: '14px'
        },
        analyticsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                gap: '15px',
                marginBottom: '20px'
            }
        },
        metricCard: {
            backgroundColor: theme.cardBackground,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: theme.shadowLarge,
            textAlign: 'center',
            border: `1px solid ${theme.border}`,
            position: 'relative',
            overflow: 'hidden',
            '@media (max-width: 768px)': {
                padding: '20px'
            }
        },
        metricTopBar: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px'
        },
        metricIcon: {
            fontSize: '48px',
            marginBottom: '15px',
            '@media (max-width: 768px)': {
                fontSize: '40px',
                marginBottom: '12px'
            }
        },
        metricTitle: {
            margin: '0 0 8px 0',
            color: theme.text,
            fontSize: '18px',
            '@media (max-width: 768px)': {
                fontSize: '16px'
            }
        },
        metricValue: {
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            '@media (max-width: 768px)': {
                fontSize: '32px'
            }
        },
        metricSubtext: {
            margin: 0,
            color: theme.textSecondary,
            fontSize: '14px'
        },
        detailsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                gap: '15px'
            }
        },
        detailItem: {
            textAlign: 'center',
            padding: '15px',
            '@media (max-width: 768px)': {
                padding: '12px'
            }
        },
        detailIcon: {
            fontSize: '24px',
            marginBottom: '8px'
        },
        detailLabel: {
            fontSize: '14px',
            color: theme.textSecondary,
            marginBottom: '5px'
        },
        detailValue: {
            fontWeight: 'bold',
            color: theme.text
        },
        achievementsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '20px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px'
            }
        },
        achievementBadge: {
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px solid',
            '@media (max-width: 768px)': {
                padding: '12px'
            }
        },
        achievementIcon: {
            fontSize: '40px',
            marginBottom: '8px',
            '@media (max-width: 768px)': {
                fontSize: '32px',
                marginBottom: '6px'
            }
        },
        achievementTitle: {
            fontWeight: 'bold',
            marginBottom: '4px',
            fontSize: '14px',
            '@media (max-width: 768px)': {
                fontSize: '13px'
            }
        },
        achievementDesc: {
            fontSize: '12px',
            color: theme.textMuted,
            '@media (max-width: 768px)': {
                fontSize: '11px'
            }
        },
        errorCard: {
            color: theme.buttonDanger,
            backgroundColor: theme.error,
            border: `1px solid ${theme.errorBorder}`,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: theme.cardBackground,
            borderRadius: '12px',
            border: `2px dashed ${theme.borderDark}`,
            '@media (max-width: 768px)': {
                padding: '40px 15px'
            }
        },
        emptyStateIcon: {
            fontSize: '64px',
            marginBottom: '20px',
            '@media (max-width: 768px)': {
                fontSize: '48px',
                marginBottom: '15px'
            }
        },
        emptyStateTitle: {
            color: theme.textSecondary,
            marginBottom: '15px'
        },
        emptyStateText: {
            color: theme.textSecondary,
            marginBottom: '20px'
        },
        emptyStateButton: {
            backgroundColor: theme.buttonPrimary,
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            display: 'inline-block'
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: theme.textSecondary }}>
                <div className="spinner"></div>
                <p>Loading your analytics...</p>
            </div>
        );
    }

    if (habits.length === 0) {
        return (
            <div style={styles.container}>
                <h2 style={styles.title}>📊 Analytics Dashboard</h2>
                <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>📈</div>
                    <h3 style={styles.emptyStateTitle}>No Habits to Analyze Yet</h3>
                    <p style={styles.emptyStateText}>
                        Create some habits and start tracking to see your amazing progress here!
                    </p>
                    <a href="/habits" style={styles.emptyStateButton}>
                        🎯 Create Your First Habit
                    </a>
                </div>
            </div>
        );
    }

    const currentAnalytics = selectedHabit ? analytics[selectedHabit] : null;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📊 Analytics Dashboard</h2>
            <p style={styles.subtitle}>
                Track your progress and celebrate your achievements! 🎉
            </p>

            {error && (
                <div style={styles.errorCard}>
                    {error}
                </div>
            )}

            {/* Habit Selector */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>📋 Select Habit to Analyze</h3>
                <div style={styles.habitGrid}>
                    {habits.map(habit => (
                        <button
                            key={habit.id}
                            onClick={() => handleHabitSelect(habit.id)}
                            style={{
                                ...styles.habitButton,
                                ...(selectedHabit === habit.id ? styles.habitButtonActive : {})
                            }}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: theme.text }}>
                                {habit.title}
                            </div>
                            {habit.description && (
                                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                                    {habit.description}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Motivational Banner */}
            <div style={styles.motivationalBanner}>
                <div style={styles.motivationalIcon}>
                    {currentAnalytics ? getStreakIcon(currentAnalytics.current_streak) : '🎯'}
                </div>
                <h3 style={styles.motivationalTitle}>
                    {getMotivationalMessage(currentAnalytics)}
                </h3>
                <p style={styles.motivationalSubtitle}>
                    {currentAnalytics ? `Analyzing: ${habits.find(h => h.id === selectedHabit)?.title}` : 'Your progress matters, every single day! 💫'}
                </p>
            </div>

            {/* Analytics Cards */}
            {currentAnalytics && (
                <div style={styles.analyticsGrid}>
                    {/* Current Streak Card */}
                    <div style={styles.metricCard}>
                        <div style={{
                            ...styles.metricTopBar,
                            background: currentAnalytics.current_streak >= 7 ? 
                                'linear-gradient(90deg, #ff6b6b, #feca57)' : theme.buttonPrimary
                        }}></div>
                        <div style={styles.metricIcon}>
                            {getStreakIcon(currentAnalytics.current_streak)}
                        </div>
                        <h3 style={styles.metricTitle}>Current Streak</h3>
                        <p style={{
                            ...styles.metricValue,
                            color: theme.buttonDanger
                        }}>
                            {currentAnalytics.current_streak}
                        </p>
                        <p style={styles.metricSubtext}>
                            {currentAnalytics.current_streak === 1 ? 'day' : 'days'} in a row
                        </p>
                    </div>

                    {/* Longest Streak Card */}
                    <div style={styles.metricCard}>
                        <div style={{
                            ...styles.metricTopBar,
                            background: 'linear-gradient(90deg, #f093fb, #f5576c)'
                        }}></div>
                        <div style={styles.metricIcon}>🏆</div>
                        <h3 style={styles.metricTitle}>Personal Best</h3>
                        <p style={{
                            ...styles.metricValue,
                            color: theme.buttonWarning
                        }}>
                            {currentAnalytics.longest_streak}
                        </p>
                        <p style={styles.metricSubtext}>
                            longest streak achieved
                        </p>
                    </div>

                    {/* Completion Rate Card */}
                    <div style={styles.metricCard}>
                        <div style={{
                            ...styles.metricTopBar,
                            background: theme.gradientSuccess
                        }}></div>
                        <div style={styles.metricIcon}>📈</div>
                        <h3 style={styles.metricTitle}>Success Rate</h3>
                        <p style={{
                            ...styles.metricValue,
                            color: getCompletionRateColor(currentAnalytics.completion_rate)
                        }}>
                            {currentAnalytics.completion_rate}
                        </p>
                        <p style={styles.metricSubtext}>
                            overall completion rate
                        </p>
                    </div>

                    {/* Total Completions Card */}
                    <div style={styles.metricCard}>
                        <div style={{
                            ...styles.metricTopBar,
                            background: 'linear-gradient(90deg, #a8edea, #fed6e3)'
                        }}></div>
                        <div style={styles.metricIcon}>✅</div>
                        <h3 style={styles.metricTitle}>Total Wins</h3>
                        <p style={{
                            ...styles.metricValue,
                            color: theme.buttonSuccess
                        }}>
                            {currentAnalytics.total_completions}
                        </p>
                        <p style={styles.metricSubtext}>
                            times completed
                        </p>
                    </div>
                </div>
            )}

            {/* Habit Details */}
            {currentAnalytics && (
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>📊 Detailed Statistics</h3>
                    
                    <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                            <div style={styles.detailIcon}>📅</div>
                            <div style={styles.detailLabel}>Journey Started</div>
                            <div style={styles.detailValue}>
                                {currentAnalytics.start_date || 'Not started yet'}
                            </div>
                        </div>
                        
                        <div style={styles.detailItem}>
                            <div style={styles.detailIcon}>⏱️</div>
                            <div style={styles.detailLabel}>Days Tracking</div>
                            <div style={styles.detailValue}>
                                {currentAnalytics.start_date ? 
                                    Math.ceil((new Date() - new Date(currentAnalytics.start_date)) / (1000 * 60 * 60 * 24)) 
                                    : 0
                                } days
                            </div>
                        </div>
                        
                        <div style={styles.detailItem}>
                            <div style={styles.detailIcon}>🎯</div>
                            <div style={styles.detailLabel}>Habit Title</div>
                            <div style={styles.detailValue}>
                                {habits.find(h => h.id === selectedHabit)?.title}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievement Badges */}
            {currentAnalytics && (
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>🏅 Your Achievements</h3>
                    
                    <div style={styles.achievementsGrid}>
                        {/* First Completion Badge */}
                        <div style={{
                            ...styles.achievementBadge,
                            backgroundColor: currentAnalytics.total_completions >= 1 ? theme.success : theme.cardBackground,
                            borderColor: currentAnalytics.total_completions >= 1 ? theme.buttonSuccess : theme.borderDark,
                            opacity: currentAnalytics.total_completions >= 1 ? 1 : 0.5
                        }}>
                            <div style={styles.achievementIcon}>🌟</div>
                            <div style={styles.achievementTitle}>First Step</div>
                            <div style={styles.achievementDesc}>Complete habit once</div>
                        </div>

                        {/* 3-Day Streak Badge */}
                        <div style={{
                            ...styles.achievementBadge,
                            backgroundColor: currentAnalytics.longest_streak >= 3 ? theme.warning : theme.cardBackground,
                            borderColor: currentAnalytics.longest_streak >= 3 ? theme.buttonWarning : theme.borderDark,
                            opacity: currentAnalytics.longest_streak >= 3 ? 1 : 0.5
                        }}>
                            <div style={styles.achievementIcon}>💪</div>
                            <div style={styles.achievementTitle}>Getting Strong</div>
                            <div style={styles.achievementDesc}>3-day streak</div>
                        </div>

                        {/* 7-Day Streak Badge */}
                        <div style={{
                            ...styles.achievementBadge,
                            backgroundColor: currentAnalytics.longest_streak >= 7 ? theme.info : theme.cardBackground,
                            borderColor: currentAnalytics.longest_streak >= 7 ? theme.buttonInfo : theme.borderDark,
                            opacity: currentAnalytics.longest_streak >= 7 ? 1 : 0.5
                        }}>
                            <div style={styles.achievementIcon}>⭐</div>
                            <div style={styles.achievementTitle}>Week Warrior</div>
                            <div style={styles.achievementDesc}>7-day streak</div>
                        </div>

                        {/* 30-Day Streak Badge */}
                        <div style={{
                            ...styles.achievementBadge,
                            backgroundColor: currentAnalytics.longest_streak >= 30 ? theme.error : theme.cardBackground,
                            borderColor: currentAnalytics.longest_streak >= 30 ? theme.buttonDanger : theme.borderDark,
                            opacity: currentAnalytics.longest_streak >= 30 ? 1 : 0.5
                        }}>
                            <div style={styles.achievementIcon}>🏆</div>
                            <div style={styles.achievementTitle}>Month Master</div>
                            <div style={styles.achievementDesc}>30-day streak</div>
                        </div>

                        {/* High Success Rate Badge */}
                        <div style={{
                            ...styles.achievementBadge,
                            backgroundColor: parseFloat(currentAnalytics.completion_rate?.replace('%', '') || '0') >= 80 ? theme.success : theme.cardBackground,
                            borderColor: parseFloat(currentAnalytics.completion_rate?.replace('%', '') || '0') >= 80 ? theme.buttonSuccess : theme.borderDark,
                            opacity: parseFloat(currentAnalytics.completion_rate?.replace('%', '') || '0') >= 80 ? 1 : 0.5
                        }}>
                            <div style={styles.achievementIcon}>🎯</div>
                            <div style={styles.achievementTitle}>Consistent</div>
                            <div style={styles.achievementDesc}>80%+ completion rate</div>
                        </div>

                        {/* 50 Completions Badge */}
                        <div style={{
                            ...styles.achievementBadge,
                            backgroundColor: currentAnalytics.total_completions >= 50 ? '#e2e3ff' : theme.cardBackground,
                            borderColor: currentAnalytics.total_completions >= 50 ? theme.buttonPurple : theme.borderDark,
                            opacity: currentAnalytics.total_completions >= 50 ? 1 : 0.5
                        }}>
                            <div style={styles.achievementIcon}>💎</div>
                            <div style={styles.achievementTitle}>Dedicated</div>
                            <div style={styles.achievementDesc}>50+ completions</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Analytics;
