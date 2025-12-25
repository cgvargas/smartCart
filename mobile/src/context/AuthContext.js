import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                const profile = await authAPI.getProfile();
                setUser(profile);
            }
        } catch (error) {
            console.log('Not authenticated');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            await authAPI.login(email, password);
            const profile = await authAPI.getProfile();
            setUser(profile);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao fazer login'
            };
        }
    };

    const register = async (email, password, firstName, lastName) => {
        try {
            await authAPI.register(email, password, firstName, lastName);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao registrar'
            };
        }
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const updateUser = async () => {
        try {
            const profile = await authAPI.getProfile();
            setUser(profile);
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
