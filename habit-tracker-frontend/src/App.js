import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import PrivateRoute from './components/PrivateRoute';
import Habits from './pages/Habits';
import Navbar from './components/Navbar';
import GlobalStyles from './components/GlobalStyles';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

// Separate component to use theme context
function AppContent() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      transition: 'background-color 0.3s ease',
      // Background will be handled by GlobalStyles
    }}>
      <Navbar />
      <main style={{ 
        paddingTop: '20px',
        // Responsive padding
        '@media (max-width: 768px)': {
          paddingTop: '15px'
        }
      }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
