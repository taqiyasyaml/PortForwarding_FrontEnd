import { Box, Typography, createTheme } from '@mui/material';
import React, { useContext } from 'react';
import { RouterProvider } from 'react-router-dom';
import Router from './Router';
import './helper/i18n';
import AuthProvider, { AuthContext } from './components/AuthProvider';
import ThemeProvider from './components/ThemeProvider';

const darkTheme = createTheme({ palette: { mode: 'light' } })

function App() {
  const auth = useContext(AuthContext)
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
