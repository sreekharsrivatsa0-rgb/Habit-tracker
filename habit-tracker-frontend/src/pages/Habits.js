import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

function Habits() {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState({});
  const [history, setHistory] = useState({});
  const [showHistory, setShowHistory] = useState({});
  const [showDatePicker, setShowDatePicker] = useState({});
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => {
    fetchHabits();
    fetchStreaks();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      // No need to manually add Authorization header - axios interceptor handles it
      const res = await axios.get('/habits');
      setHabits(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError(err.response?.data?.error || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreaks = async () => {
    try {
      // No need to manually add Authorization header - axios interceptor handles it
      const res = await axios.get('/habits/streak');
      const streakMap = {};
      res.data.forEach(h => {
        streakMap[h.habit_id] = {
          current: h.current_streak || 0,
          longest: h.longest_streak || 0,
          last: h.last_completed || 'Never'
        };
      });
      setStreaks(streakMap);
    } catch (err) {
      console.error("Streak fetch failed:", err);
      // Don't show error to user for streaks, just log it
    }
  };

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`/habits/${id}/history`);
      setHistory(prev => ({ ...prev, [id]: res.data.history || [] }));
    } catch (err) {
      console.error(`History fetch failed for habit ${id}:`, err);
      setHistory(prev => ({ ...prev, [id]: [] }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!form.title.trim()) {
      setError('Habit title is required');
      return;
    }

    try {
      // No need to manually add Authorization header - axios interceptor handles it
      await axios.post('/habits', form);
      setForm({ title: '', description: '' });
      await fetchHabits(); // Refresh the list
      await fetchStreaks(); // Refresh streaks
      setMessage('Habit added successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding habit:', err);
      setError(err.response?.data?.error || 'Failed to add habit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      await axios.delete(`/habits/${id}`);
      await fetchHabits(); // Refresh the list
      await fetchStreaks(); // Refresh streaks
      setMessage('Habit deleted successfully!');
      
      // Clear any history for this habit
      setHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[id];
        return newHistory;
      });
      
      // Clear show history state
      setShowHistory(prev => {
        const newShow = { ...prev };
        delete newShow[id];
        return newShow;
      });
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError(err.response?.data?.error || 'Failed to delete habit');
    }
  };

  const handleComplete = async (id, date = null) => {
    try {
      // Build URL with optional date parameter
      const url = date ? `/habits/${id}?date=${date}` : `/habits/${id}`;
      
      // Backend expects POST /habits/:id to mark as complete
      await axios.post(url, {});
      await fetchStreaks(); // Refresh streaks after completion
      
      const dateText = date ? ` for ${date}` : '';
      setMessage(`Habit marked as complete${dateText}!`);
      
      // Hide date picker after completion
      if (date) {
        setShowDatePicker(prev => ({ ...prev, [id]: false }));
        setSelectedDates(prev => ({ ...prev, [id]: '' }));
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error completing habit:', err);
      setError(err.response?.data?.error || 'Failed to mark habit as complete');
    }
  };

  const toggleDatePicker = (id) => {
    setShowDatePicker(prev => ({ ...prev, [id]: !prev[id] }));
    // Initialize with today's date
    if (!selectedDates[id]) {
      setSelectedDates(prev => ({ ...prev, [id]: new Date().toISOString().split('T')[0] }));
    }
  };

  const handleDateChange = (id, date) => {
    setSelectedDates(prev => ({ ...prev, [id]: date }));
  };

  const handleDateSubmit = (id) => {
    const date = selectedDates[id];
    if (date) {
      handleComplete(id, date);
    }
  };

  const toggleHistory = async (id) => {
    if (showHistory[id]) {
      // Hide history
      setShowHistory(prev => ({ ...prev, [id]: false }));
    } else {
      // Show history - fetch if not already loaded
      if (!history[id]) {
        await fetchHistory(id);
      }
      setShowHistory(prev => ({ ...prev, [id]: true }));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading habits...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📋 Habit Tracker</h2>

      {/* Feature Info Banner */}
      <div style={{ 
        backgroundColor: '#d1ecf1', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #bee5eb'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>
          🆕 New Feature: Mark Completed for Past Dates!
        </h4>
        <p style={{ margin: '0', color: '#0c5460', fontSize: '14px' }}>
          Forgot to mark a habit yesterday? No problem! Use the "📅 Mark for Date" button to select any past date and mark your habit as completed. This helps maintain accurate streaks and tracking.
        </p>
      </div>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>➕ Add New Habit</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Habit title (e.g., 'Drink 8 glasses of water')"
              required
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          <button 
            type="submit"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ➕ Add Habit
          </button>
        </form>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ 
          color: 'green', 
          backgroundColor: '#d4edda',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#f8d7da',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p>No habits found. Create your first habit above! 🎯</p>
        </div>
      ) : (
        <div>
          <h3>Your Habits ({habits.length})</h3>
          {habits.map(habit => (
            <div 
              key={habit.id} 
              style={{ 
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: 'white'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                  {habit.title}
                </h4>
                {habit.description && (
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Streak Information */}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                <div>🔥 Current Streak: <strong>{streaks[habit.id]?.current || 0} days</strong></div>
                <div>🏆 Longest Streak: <strong>{streaks[habit.id]?.longest || 0} days</strong></div>
                <div>📅 Last Completed: <strong>{streaks[habit.id]?.last || 'Never'}</strong></div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => handleComplete(habit.id)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  ✅ Complete Today
                </button>
                
                <button 
                  onClick={() => toggleDatePicker(habit.id)}
                  style={{
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  📅 {showDatePicker[habit.id] ? 'Cancel' : 'Mark for Date'}
                </button>
                
                <button 
                  onClick={() => toggleHistory(habit.id)}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  📈 {showHistory[habit.id] ? 'Hide' : 'Show'} History
                </button>
                
                <button 
                  onClick={() => handleDelete(habit.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Date Picker for Past Completion */}
              {showDatePicker[habit.id] && (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '15px', 
                  borderRadius: '4px',
                  marginBottom: '10px',
                  border: '1px solid #ffeaa7'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>📅 Mark as completed for a specific date:</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="date"
                      value={selectedDates[habit.id] || ''}
                      onChange={(e) => handleDateChange(habit.id, e.target.value)}
                      max={new Date().toISOString().split('T')[0]} // Don't allow future dates
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={() => handleDateSubmit(habit.id)}
                      disabled={!selectedDates[habit.id]}
                      style={{
                        backgroundColor: selectedDates[habit.id] ? '#28a745' : '#6c757d',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedDates[habit.id] ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                      }}
                    >
                      ✅ Mark Complete
                    </button>
                    <button
                      onClick={() => toggleDatePicker(habit.id)}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
                    💡 <em>Tip: You can mark habits as complete for any past date, but not future dates.</em>
                  </div>
                </div>
              )}

              {/* History Display */}
              {showHistory[habit.id] && (
                <div style={{ 
                  backgroundColor: '#e9ecef', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <strong>📊 Completion History:</strong>
                  {history[habit.id] && history[habit.id].length > 0 ? (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                        gap: '5px',
                        fontSize: '12px'
                      }}>
                        {history[habit.id].map((date, idx) => (
                          <div 
                            key={idx}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              textAlign: 'center'
                            }}
                          >
                            {date}
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                        Total completions: {history[habit.id].length}
                      </p>
                    </div>
                  ) : (
                    <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
                      No completion history yet. Complete this habit to start tracking!
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Habits;
