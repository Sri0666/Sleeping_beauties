import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, useMediaQuery } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Import pages
import Dashboard from './pages/Dashboard';
import SleepTracking from './pages/SleepTracking';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import DeviceManagement from './pages/DeviceManagement';
import Profile from './pages/Profile';
import AdaptivePositionSystem from './pages/AdaptivePositionSystem';

// Import components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Import services
import { WebSocketProvider } from './services/WebSocketService';

// Create modern dark theme optimized for sleep tracking and mobile
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Modern indigo
      light: '#818cf8',
      dark: '#4338ca',
    },
    secondary: {
      main: '#06b6d4', // Cyan
      light: '#67e8f9',
      dark: '#0891b2',
    },
    background: {
      default: '#0f0f23', // Very dark blue
      paper: '#1e1b4b', // Dark indigo
    },
    surface: {
      main: '#312e81', // Medium indigo for cards
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    divider: 'rgba(148, 163, 184, 0.2)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontSize: 'clamp(0.875rem, 1.25vw, 1rem)',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    body1: {
      fontSize: 'clamp(0.875rem, 1vw, 1rem)',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#6366f1 #1e1b4b',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e1b4b',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6366f1',
            borderRadius: 4,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 27, 75, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1b4b',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.4)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WebSocketProvider>
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Navbar onMenuClick={handleDrawerToggle} />
            <Sidebar 
              mobileOpen={mobileOpen} 
              onMobileClose={() => setMobileOpen(false)}
            />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                pt: { xs: 2, sm: 3 },
                pr: { xs: 2, sm: 3 },
                pb: { xs: 2, sm: 3 },
                pl: 0, // remove all left padding to eliminate gap
                mt: { xs: 7, sm: 8 }, // Account for navbar height
                ml: { xs: 0, md: '280px' }, // Account for sidebar width on desktop
                minHeight: 'calc(100vh - 64px)',
                backgroundColor: 'background.default',
                width: { xs: '100%', md: 'calc(100% - 280px)' },
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tracking" element={<SleepTracking />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/devices" element={<DeviceManagement />} />
                <Route path="/position-system" element={<AdaptivePositionSystem />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Box>
          </Box>
          <Toaster 
            position={isMobile ? "top-center" : "top-right"}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e1b4b',
                color: '#f8fafc',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '12px',
                fontSize: isMobile ? '14px' : '16px',
              },
            }}
          />
        </Router>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;