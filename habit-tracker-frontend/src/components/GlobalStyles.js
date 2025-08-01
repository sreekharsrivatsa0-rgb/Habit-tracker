import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const GlobalStyles = () => {
  const { theme, currentTheme } = useTheme();

  useEffect(() => {
    // Create and inject global styles
    const styleId = 'global-theme-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const globalCSS = `
      /* Reset and base styles */
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: ${theme.background};
        color: ${theme.text};
        transition: background-color 0.3s ease, color 0.3s ease;
        line-height: 1.6;
      }

      /* Scrollbar styles for dark theme */
      body.theme-dark {
        scrollbar-width: thin;
        scrollbar-color: #555 #2d2d2d;
      }

      body.theme-dark ::-webkit-scrollbar {
        width: 8px;
      }

      body.theme-dark ::-webkit-scrollbar-track {
        background: #2d2d2d;
      }

      body.theme-dark ::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 4px;
      }

      body.theme-dark ::-webkit-scrollbar-thumb:hover {
        background: #666;
      }

      /* Responsive typography */
      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        line-height: 1.2;
      }

      h2 {
        font-size: 2rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        line-height: 1.3;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.75rem 0;
        line-height: 1.4;
      }

      h4 {
        font-size: 1.25rem;
        font-weight: 500;
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
      }

      p {
        margin: 0 0 1rem 0;
        line-height: 1.6;
      }

      /* Responsive text sizes */
      @media (max-width: 768px) {
        h1 {
          font-size: 2rem;
        }
        
        h2 {
          font-size: 1.75rem;
        }
        
        h3 {
          font-size: 1.25rem;
        }
        
        h4 {
          font-size: 1.1rem;
        }
        
        body {
          font-size: 14px;
        }
      }

      @media (max-width: 480px) {
        h1 {
          font-size: 1.75rem;
        }
        
        h2 {
          font-size: 1.5rem;
        }
        
        h3 {
          font-size: 1.1rem;
        }
        
        body {
          font-size: 13px;
        }
      }

      /* Form elements with theme support */
      input, textarea, select {
        background-color: ${theme.cardBackground};
        color: ${theme.text};
        border: 1px solid ${theme.border};
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        transition: all 0.3s ease;
        font-family: inherit;
      }

      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: ${theme.buttonPrimary};
        box-shadow: 0 0 0 3px ${theme.buttonPrimary}20;
      }

      input::placeholder, textarea::placeholder {
        color: ${theme.textMuted};
      }

      /* Responsive form elements */
      @media (max-width: 768px) {
        input, textarea, select {
          padding: 10px 12px;
          font-size: 16px; /* Prevent zoom on iOS */
        }
      }

      /* Button focus styles */
      button:focus {
        outline: none;
        box-shadow: 0 0 0 3px ${theme.buttonPrimary}40;
      }

      /* Links */
      a {
        color: ${theme.buttonPrimary};
        text-decoration: none;
        transition: color 0.3s ease;
      }

      a:hover {
        color: ${theme.buttonInfo};
        text-decoration: underline;
      }

      /* Selection color */
      ::selection {
        background-color: ${theme.buttonPrimary}40;
        color: ${theme.text};
      }

      /* Utility classes */
      .text-center {
        text-align: center;
      }

      .text-left {
        text-align: left;
      }

      .text-right {
        text-align: right;
      }

      .mb-0 { margin-bottom: 0; }
      .mb-1 { margin-bottom: 0.5rem; }
      .mb-2 { margin-bottom: 1rem; }
      .mb-3 { margin-bottom: 1.5rem; }
      .mb-4 { margin-bottom: 2rem; }

      .mt-0 { margin-top: 0; }
      .mt-1 { margin-top: 0.5rem; }
      .mt-2 { margin-top: 1rem; }
      .mt-3 { margin-top: 1.5rem; }
      .mt-4 { margin-top: 2rem; }

      .p-0 { padding: 0; }
      .p-1 { padding: 0.5rem; }
      .p-2 { padding: 1rem; }
      .p-3 { padding: 1.5rem; }
      .p-4 { padding: 2rem; }

      /* Responsive utilities */
      .d-flex {
        display: flex;
      }

      .flex-column {
        flex-direction: column;
      }

      .flex-wrap {
        flex-wrap: wrap;
      }

      .justify-center {
        justify-content: center;
      }

      .justify-between {
        justify-content: space-between;
      }

      .align-center {
        align-items: center;
      }

      .gap-1 { gap: 0.5rem; }
      .gap-2 { gap: 1rem; }
      .gap-3 { gap: 1.5rem; }

      /* Responsive visibility */
      @media (max-width: 768px) {
        .hide-mobile {
          display: none !important;
        }
      }

      @media (min-width: 769px) {
        .show-mobile {
          display: none !important;
        }
      }

      /* Animation classes */
      .fade-in {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .slide-in {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }

      /* Loading spinner */
      .spinner {
        border: 3px solid ${theme.border};
        border-top: 3px solid ${theme.buttonPrimary};
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Custom scrollbar for light theme */
      body.theme-light ::-webkit-scrollbar {
        width: 8px;
      }

      body.theme-light ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      body.theme-light ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }

      body.theme-light ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }

      /* Toast notifications */
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${theme.cardBackground};
        color: ${theme.text};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: ${theme.shadowLarge};
        border: 1px solid ${theme.border};
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .toast {
          left: 10px;
          right: 10px;
          max-width: none;
        }
      }
    `;

    styleElement.textContent = globalCSS;

    // Cleanup function
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [theme, currentTheme]);

  return null; // This component doesn't render anything
};

export default GlobalStyles;
