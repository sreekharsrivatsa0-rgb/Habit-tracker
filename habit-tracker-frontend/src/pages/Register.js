import React, { useState } from 'react';
import axios from '../api/axios'; 
import { Link } from 'react-router-dom';

function Register() {
    const [form, setForm] = useState({username: '', email: '', password: ''});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            // Backend uses '/users' endpoint for registration
            const res = await axios.post('/users', form);
            setMessage('User registered successfully! You can now login.');
            // Clear the form after successful registration
            setForm({username: '', email: '', password: ''});
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response) {
                const errorMsg = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
                setMessage(errorMsg);
            } else if (err.request) {
                setMessage('No response from server. Please check if the backend is running on port 8080.');
            } else {
                setMessage(err.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        name="username" 
                        value={form.username}
                        onChange={handleChange} 
                        placeholder="Username" 
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                    />
                </div>
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
                        backgroundColor: loading ? '#ccc' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            
            {message && (
                <p style={{ 
                    color: message.includes('successfully') ? 'green' : 'red',
                    marginTop: '10px',
                    textAlign: 'center'
                }}>
                    {message}
                </p>
            )}
            
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
            
            {/* Debug info - remove in production */}
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', border: '1px solid #ddd', padding: '10px' }}>
                <h4>Debug Information:</h4>
                <p>Backend URL: http://localhost:8080</p>
                <p>Register endpoint: /users</p>
            </div>
        </div>
    );
}

export default Register;
