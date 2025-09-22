import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const result = await authService.login(email, password);
            
            if (result.success) {
                setUser(result.data);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(result.data));
            }
            
            return result;
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const result = await authService.signup(name, email, password);
            
            if (result.success) {
                setUser(result.data);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(result.data));
            }
            
            return result;
        } catch (error) {
            return { success: false, error: 'Signup failed. Please try again.' };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await authService.loginWithGoogle();
            
            if (result.success) {
                setUser(result.data);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(result.data));
            }
            
            return result;
        } catch (error) {
            return { success: false, error: 'Google login failed. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
