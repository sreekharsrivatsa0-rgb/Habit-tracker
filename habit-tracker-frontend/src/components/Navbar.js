import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const { theme, toggleTheme, isDark } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    // Helper function to check if current route is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const navStyles = {
        nav: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: theme.navBackground,
            color: theme.navText,
            boxShadow: theme.shadow,
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            '@media (max-width: 768px)': {
                padding: '15px 20px'
            }
        },
        leftSection: {
            display: 'flex',
            alignItems: 'center',
            flex: '1'
        },
        rightSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            '@media (max-width: 768px)': {
                display: isMobileMenuOpen ? 'flex' : 'none',
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: theme.navBackground,
                flexDirection: 'column',
                padding: '20px',
                boxShadow: theme.shadow,
                gap: '15px'
            }
        },
        logo: {
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: theme.navText,
            '@media (max-width: 768px)': {
                fontSize: '20px'
            }
        },
        link: {
            color: theme.buttonPrimary,
            marginRight: '20px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            ':hover': {
                backgroundColor: theme.buttonPrimary + '20'
            },
            '@media (max-width: 768px)': {
                margin: 0,
                padding: '12px 20px',
                width: '100%',
                textAlign: 'center',
                fontSize: '18px'
            }
        },
        activeLink: {
            backgroundColor: theme.buttonPrimary,
            color: theme.navText
        },
        logoutButton: {
            backgroundColor: theme.buttonDanger,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            marginLeft: '10px',
            ':hover': {
                backgroundColor: theme.buttonDanger + 'cc'
            },
            '@media (max-width: 768px)': {
                margin: 0,
                padding: '12px 20px',
                width: '100%',
                fontSize: '18px'
            }
        },
        themeToggle: {
            backgroundColor: 'transparent',
            border: `2px solid ${theme.buttonPrimary}`,
            color: theme.buttonPrimary,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            transition: 'all 0.3s ease',
            marginLeft: '10px',
            ':hover': {
                backgroundColor: theme.buttonPrimary,
                color: theme.navText
            },
            '@media (max-width: 768px)': {
                margin: 0,
                width: '50px',
                height: '50px',
                fontSize: '20px'
            }
        },
        hamburger: {
            display: 'none',
            flexDirection: 'column',
            cursor: 'pointer',
            padding: '5px',
            '@media (max-width: 768px)': {
                display: 'flex'
            }
        },
        hamburgerLine: {
            width: '25px',
            height: '3px',
            backgroundColor: theme.navText,
            margin: '2px 0',
            transition: 'all 0.3s ease',
            transformOrigin: 'center'
        },
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none',
            '@media (max-width: 768px)': {
                display: isMobileMenuOpen ? 'block' : 'none'
            }
        }
    };

    // Hamburger animation styles
    const getHamburgerStyles = (lineNumber) => {
        const baseStyle = navStyles.hamburgerLine;
        if (!isMobileMenuOpen) return baseStyle;
        
        switch (lineNumber) {
            case 1:
                return { ...baseStyle, transform: 'rotate(45deg) translate(6px, 6px)' };
            case 2:
                return { ...baseStyle, opacity: 0 };
            case 3:
                return { ...baseStyle, transform: 'rotate(-45deg) translate(6px, -6px)' };
            default:
                return baseStyle;
        }
    };

    return (
        <>
            <nav style={navStyles.nav}>
                <div style={navStyles.leftSection}>
                    <h3 style={navStyles.logo}>🎯 Habit Tracker</h3>
                </div>
                
                {/* Mobile Hamburger Menu */}
                <div style={navStyles.hamburger} onClick={toggleMobileMenu}>
                    <span style={getHamburgerStyles(1)}></span>
                    <span style={getHamburgerStyles(2)}></span>
                    <span style={getHamburgerStyles(3)}></span>
                </div>
                
                <div style={navStyles.rightSection}>
                    {token ? (
                        <>
                            <Link 
                                style={{
                                    ...navStyles.link,
                                    ...(isActive('/dashboard') ? navStyles.activeLink : {})
                                }} 
                                to="/dashboard"
                                onClick={closeMobileMenu}
                            >
                                📊 Dashboard
                            </Link>
                            <Link 
                                style={{
                                    ...navStyles.link,
                                    ...(isActive('/habits') ? navStyles.activeLink : {})
                                }} 
                                to="/habits"
                                onClick={closeMobileMenu}
                            >
                                📋 Habits
                            </Link>
                            <Link 
                                style={{
                                    ...navStyles.link,
                                    ...(isActive('/analytics') ? navStyles.activeLink : {})
                                }} 
                                to="/analytics"
                                onClick={closeMobileMenu}
                            >
                                📈 Analytics
                            </Link>
                            
                            {/* Theme Toggle Button */}
                            <button 
                                onClick={toggleTheme}
                                style={navStyles.themeToggle}
                                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                            
                            <button 
                                onClick={handleLogout} 
                                style={navStyles.logoutButton}
                            >
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                style={{
                                    ...navStyles.link,
                                    ...(isActive('/login') ? navStyles.activeLink : {})
                                }} 
                                to="/login"
                                onClick={closeMobileMenu}
                            >
                                🔐 Login
                            </Link>
                            <Link 
                                style={{
                                    ...navStyles.link,
                                    ...(isActive('/register') ? navStyles.activeLink : {})
                                }} 
                                to="/register"
                                onClick={closeMobileMenu}
                            >
                                📝 Register
                            </Link>
                            
                            {/* Theme Toggle Button */}
                            <button 
                                onClick={toggleTheme}
                                style={navStyles.themeToggle}
                                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </>
                    )}
                </div>
            </nav>
            
            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div 
                    style={navStyles.overlay}
                    onClick={closeMobileMenu}
                />
            )}
        </>
    );
}

export default Navbar;
