import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import axios from '../api/axios';

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { theme } = useTheme();

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/habits/summary');
            setSummary(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching summary:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
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
        cardsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                gap: '15px',
                marginBottom: '20px'
            },
            '@media (max-width: 480px)': {
                gridTemplateColumns: '1fr'
            }
        },
        card: {
            backgroundColor: theme.cardBackground,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: theme.shadowLarge,
            textAlign: 'center',
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '@media (max-width: 768px)': {
                padding: '20px'
            }
        },
        cardIcon: {
            fontSize: '48px',
            marginBottom: '15px',
            '@media (max-width: 768px)': {
                fontSize: '40px',
                marginBottom: '12px'
            }
        },
        cardTitle: {
            margin: '0 0 8px 0',
            color: theme.text,
            fontSize: '18px',
            '@media (max-width: 768px)': {
                fontSize: '16px'
            }
        },
        cardValue: {
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
            '@media (max-width: 768px)': {
                fontSize: '28px'
            }
        },
        quickActionsCard: {
            backgroundColor: theme.cardBackground,
            padding: '25px',
            borderRadius: '12px',
            boxShadow: theme.shadowLarge,
            border: `1px solid ${theme.border}`,
            marginTop: '20px',
            '@media (max-width: 768px)': {
                padding: '20px'
            }
        },
        quickActionsTitle: {
            marginTop: 0,
            color: theme.text,
            marginBottom: '20px'
        },
        buttonsContainer: {
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            '@media (max-width: 768px)': {
                flexDirection: 'column',
                gap: '12px'
            }
        },
        button: {
            padding: '12px 20px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            textAlign: 'center',
            minWidth: '140px',
            '@media (max-width: 768px)': {
                padding: '14px 20px',
                fontSize: '16px',
                minWidth: 'auto',
                width: '100%'
            }
        },
        primaryButton: {
            backgroundColor: theme.buttonSuccess,
            color: 'white'
        },
        secondaryButton: {
            backgroundColor: theme.buttonPurple,
            color: 'white'
        },
        tertiaryButton: {
            backgroundColor: theme.buttonPrimary,
            color: 'white'
        },
        motivationalCard: {
            background: theme.gradientPrimary,
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            marginTop: '20px',
            textAlign: 'center',
            boxShadow: theme.shadowLarge,
            '@media (max-width: 768px)': {
                padding: '20px'
            }
        },
        motivationalTitle: {
            color: 'white',
            marginTop: 0,
            marginBottom: '10px'
        },
        motivationalText: {
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px',
            margin: 0,
            lineHeight: '1.6',
            '@media (max-width: 768px)': {
                fontSize: '14px'
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
        loadingContainer: {
            textAlign: 'center',
            padding: '50px',
            color: theme.textSecondary
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Welcome to your Dashboard 🎯</h2>
            <p style={styles.subtitle}>
                Track your progress and stay motivated!
            </p>

            {error && (
                <div style={styles.errorCard}>
                    {error}
                </div>
            )}

            {summary && (
                <div style={styles.cardsGrid}>
                    {/* Total Habits Card */}
                    <div 
                        style={{
                            ...styles.card,
                            ':hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadowLarge
                            }
                        }}
                    >
                        <div style={styles.cardIcon}>📋</div>
                        <h3 style={styles.cardTitle}>Total Habits</h3>
                        <p style={{
                            ...styles.cardValue,
                            color: theme.buttonPrimary
                        }}>
                            {summary.total_habits}
                        </p>
                    </div>

                    {/* Total Completions Card */}
                    <div style={styles.card}>
                        <div style={styles.cardIcon}>✅</div>
                        <h3 style={styles.cardTitle}>Total Completions</h3>
                        <p style={{
                            ...styles.cardValue,
                            color: theme.buttonSuccess
                        }}>
                            {summary.total_completions}
                        </p>
                    </div>

                    {/* Longest Streak Card */}
                    <div style={styles.card}>
                        <div style={styles.cardIcon}>🔥</div>
                        <h3 style={styles.cardTitle}>Longest Streak</h3>
                        <p style={{
                            ...styles.cardValue,
                            color: theme.buttonDanger
                        }}>
                            {summary.longest_streak} days
                        </p>
                    </div>

                    {/* Most Consistent Habit Card */}
                    <div style={styles.card}>
                        <div style={styles.cardIcon}>🏆</div>
                        <h3 style={styles.cardTitle}>Most Consistent</h3>
                        <p style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            margin: 0,
                            color: theme.buttonWarning,
                            '@media (max-width: 768px)': {
                                fontSize: '16px'
                            }
                        }}>
                            {summary.most_consistent || 'No habits yet'}
                        </p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div style={styles.quickActionsCard}>
                <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
                <div style={styles.buttonsContainer}>
                    <Link 
                        to="/habits" 
                        style={{
                            ...styles.button,
                            ...styles.primaryButton
                        }}
                    >
                        📋 Manage Habits
                    </Link>
                    <Link 
                        to="/analytics" 
                        style={{
                            ...styles.button,
                            ...styles.secondaryButton
                        }}
                    >
                        📈 View Analytics
                    </Link>
                    <button 
                        onClick={fetchSummary}
                        style={{
                            ...styles.button,
                            ...styles.tertiaryButton
                        }}
                    >
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            {/* Motivational Section */}
            <div style={styles.motivationalCard}>
                <h3 style={styles.motivationalTitle}>💪 Keep Going!</h3>
                <p style={styles.motivationalText}>
                    {summary?.total_habits === 0 
                        ? "Start building your first habit today!" 
                        : `You're doing great! ${summary?.total_completions} completions and counting!`
                    }
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
