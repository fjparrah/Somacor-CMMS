import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import apiClient from '../api/apiClient';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    usuarios: {
        idrol: number;
        nombrerol: string;
        idespecialidad: number | null;
        telefono: string | null;
        cargo: string | null;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            const storedUser = localStorage.getItem('user');
            if (token && storedUser) {
                try {
                    const parsedUser: User = JSON.parse(storedUser);
                    setUser(parsedUser);
                    apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
                } catch (error) {
                    console.error("Failed to parse user from localStorage", error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, [token]);

    const login = async (username: string, password: string) => {
        const response = await apiClient.post<{ token: string; user: User }>('/login/', {
            username,
            password,
        });
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    };

    const logout = () => {
        apiClient.post('/logout/').catch(err => console.error("Logout API call failed, proceeding with client-side logout.", err));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const value = { user, token, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
