import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to automatically include auth token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request for debugging
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors and other common errors
instance.interceptors.response.use(
    (response) => {
        // Log successful response for debugging
        console.log(`Successful response from: ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('Response interceptor error:', error);
        
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            
            if (status === 401) {
                // Token is invalid or expired
                console.log('401 Unauthorized - removing token and redirecting to login');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (status === 404) {
                console.error('404 Not Found - Check if the endpoint exists on the backend');
            } else if (status === 500) {
                console.error('500 Internal Server Error - Backend server error');
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received - Backend might be down or unreachable');
        } else {
            // Something else happened
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default instance;
