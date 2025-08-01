import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme configuration
export const themes = {
  light: {
    // Background colors
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    navBackground: '#2c3e50',
    
    // Text colors
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    textMuted: '#666666',
    navText: '#ecf0f1',
    
    // Border colors
    border: '#e9ecef',
    borderDark: '#dee2e6',
    
    // Button colors
    buttonPrimary: '#3498db',
    buttonSuccess: '#27ae60',
    buttonDanger: '#e74c3c',
    buttonWarning: '#f39c12',
    buttonInfo: '#17a2b8',
    buttonPurple: '#6f42c1',
    
    // Status colors
    success: '#d4edda',
    successBorder: '#c3e6cb',
    error: '#f8d7da',
    errorBorder: '#f5c6cb',
    warning: '#fff3cd',
    warningBorder: '#ffeaa7',
    info: '#d1ecf1',
    infoBorder: '#bee5eb',
    
    // Shadow
    shadow: '0 2px 4px rgba(0,0,0,0.1)',
    shadowLarge: '0 4px 12px rgba(0,0,0,0.1)',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientSuccess: 'linear-gradient(90deg, #4facfe, #00f2fe)',
    gradientWarning: 'linear-gradient(90deg, #ff6b6b, #feca57)',
    
    name: 'light'
  },
  dark: {
    // Background colors
    background: '#1a1a1a',
    cardBackground: '#2d2d2d',
    navBackground: '#1e1e1e',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    textMuted: '#888888',
    navText: '#ffffff',
    
    // Border colors
    border: '#404040',
    borderDark: '#555555',
    
    // Button colors (same as light but will appear different on dark background)
    buttonPrimary: '#4fa8e8',
    buttonSuccess: '#2ecc71',
    buttonDanger: '#e67e22',
    buttonWarning: '#f1c40f',
    buttonInfo: '#1abc9c',
    buttonPurple: '#9b59b6',
    
    // Status colors (darker versions)
    success: '#1e4d2b',
    successBorder: '#27ae60',
    error: '#4d1f1f',
    errorBorder: '#e74c3c',
    warning: '#4d3d1a',
    warningBorder: '#f39c12',
    info: '#1a3d4d',
    infoBorder: '#17a2b8',
    
    // Shadow (lighter for dark theme)
    shadow: '0 2px 8px rgba(0,0,0,0.3)',
    shadowLarge: '0 4px 16px rgba(0,0,0,0.3)',
    
    // Gradients (adjusted for dark theme)
    gradientPrimary: 'linear-gradient(135deg, #4a69bd 0%, #5f4bb6 100%)',
    gradientSuccess: 'linear-gradient(90deg, #00a8ff, #0078ff)',
    gradientWarning: 'linear-gradient(90deg, #ff4757, #ff6348)',
    
    name: 'dark'
  }
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    // Update body class for global styles
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = themes[currentTheme];

  const value = {
    theme,
    currentTheme,
    toggleTheme,
    isLight: currentTheme === 'light',
    isDark: currentTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Responsive breakpoints
export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px'
};

// Helper function to create responsive styles
export const responsive = {
  mobile: (styles) => `@media (max-width: ${breakpoints.mobile}) { ${styles} }`,
  tablet: (styles) => `@media (max-width: ${breakpoints.tablet}) { ${styles} }`,
  desktop: (styles) => `@media (min-width: ${breakpoints.desktop}) { ${styles} }`
};

// Common responsive styles
export const getResponsiveStyles = (theme) => ({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    '@media (max-width: 768px)': {
      padding: '15px'
    }
  },
  
  grid: {
    display: 'grid',
    gap: '20px',
    '@media (max-width: 768px)': {
      gap: '15px'
    }
  },
  
  gridAutoFit: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  
  card: {
    backgroundColor: theme.cardBackground,
    padding: '20px',
    borderRadius: '12px',
    boxShadow: theme.shadowLarge,
    border: `1px solid ${theme.border}`,
    '@media (max-width: 768px)': {
      padding: '15px',
      borderRadius: '8px'
    }
  },
  
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '10px'
    }
  },
  
  button: {
    padding: '12px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    '@media (max-width: 768px)': {
      padding: '10px 16px',
      fontSize: '13px',
      width: '100%'
    }
  }
});

export default ThemeContext;
