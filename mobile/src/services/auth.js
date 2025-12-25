/**
 * Auth Service
 * Authentication API calls
 */

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     */
    login: async (email, password) => {
        const response = await api.post('/token/', { email, password });
        const { access, refresh } = response.data;

        await AsyncStorage.setItem('@SmartCart:token', access);
        await AsyncStorage.setItem('@SmartCart:refreshToken', refresh);

        return response.data;
    },

    /**
     * Register new user
     * @param {object} userData
     */
    register: async (userData) => {
        const response = await api.post('/accounts/register/', userData);
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        await AsyncStorage.multiRemove([
            '@SmartCart:token',
            '@SmartCart:refreshToken',
            '@SmartCart:user',
        ]);
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        const response = await api.get('/accounts/profile/');
        return response.data;
    },

    /**
     * Update user profile
     * @param {object} data
     */
    updateProfile: async (data) => {
        const response = await api.put('/accounts/profile/', data);
        return response.data;
    },

    /**
     * Change password
     * @param {string} oldPassword
     * @param {string} newPassword
     */
    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/accounts/change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
            new_password_confirm: newPassword,
        });
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async () => {
        const token = await AsyncStorage.getItem('@SmartCart:token');
        return !!token;
    },
};

export default authService;
