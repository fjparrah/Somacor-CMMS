import React, { useState, useMemo, createContext, useContext } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    const login = async (username, password) => {
        const response = await apiClient.post('/login/', { username, password });
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    };

    const logout = async () => {
        try {
            await apiClient.post('/logout/');
        } catch (error) {
            console.error("Error en logout:", error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    };
    
    const authContextValue = useMemo(() => ({
        user,
        login,
        logout,
        isAuthenticated: !!token
    }), [user, token]);

    return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);