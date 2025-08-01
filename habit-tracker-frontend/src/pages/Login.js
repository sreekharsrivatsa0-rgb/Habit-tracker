import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            console.log('Attempting login with:', { email: form.email }); // Debug log
            
            // Backend uses '/login' endpoint
            const res = await axios.post('/login', form);
            console.log('Login response:', res.data); // Debug log
            
            const { token, user } = res.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }
            
            localStorage.setItem('token', token);
            console.log('Token saved, redirecting to dashboard'); // Debug log
            
            setMessage('Login successful! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            
        } catch (err) {
            console.error('Login error:', err); // Debug log
            console.error('Error response:', err.response); // Debug log
            
            if (err.response) {
                // Server responded with error status
                const errorMsg = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
                setMessage(errorMsg);
            } else if (err.request) {
                // Request was made but no response received
                setMessage('No response from server. Please check if the backend is running on port 8080.');
            } else {
                // Something else happened
                setMessage(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        name="email" 
                        value={form.email}
                        onChange={handleChange} 
                        placeholder="Email" 
                        type="email" 
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        name="password" 
                        value={form.password}
                        onChange={handleChange} 
                        placeholder="Password" 
                        type="password" 
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: loading ? '#ccc' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            
            {message && (
                <p style={{ 
                    color: message.includes('successful') ? 'green' : 'red',
                    marginTop: '10px',
                    textAlign: 'center'
                }}>
                    {message}
                </p>
            )}
            
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
            
            {/* Debug info - remove in production */}
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', border: '1px solid #ddd', padding: '10px' }}>
                <h4>Debug Information:</h4>
                <p>Backend URL: http://localhost:8080</p>
                <p>Current token: {localStorage.getItem('token') ? 'Present' : 'None'}</p>
                <p>Login endpoint: /login</p>
            </div>
        </div>
    );
}

export default Login;
