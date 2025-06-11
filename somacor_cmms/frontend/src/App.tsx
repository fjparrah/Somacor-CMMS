import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';

const Router = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <AppLayout /> : <AuthPage />;
};

const App = () => (
    <AuthProvider>
        <Router />
    </AuthProvider>
);

export default App;