import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');
    
    // Optional: Add more sophisticated token validation
    const isTokenValid = () => {
        if (!token) return false;
        
        try {
            // Basic check - you could add JWT expiration check here
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            // Check if token is expired
            if (payload.exp && payload.exp < currentTime) {
                localStorage.removeItem('token');
                return false;
            }
            
            return true;
        } catch (error) {
            // If token is malformed, remove it
            localStorage.removeItem('token');
            return false;
        }
    };

    return isTokenValid() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
