import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change for production
const API_URL = 'https://smartcart-cj79.onrender.com/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const response = await axios.post(`${API_URL}/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                await AsyncStorage.setItem('accessToken', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear tokens
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth functions
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/token/', { email, password });
        await AsyncStorage.setItem('accessToken', response.data.access);
        await AsyncStorage.setItem('refreshToken', response.data.refresh);
        return response.data;
    },

    register: async (email, password, firstName, lastName) => {
        // Generate username from email (before @)
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const response = await api.post('/accounts/register/', {
            email,
            username,
            password,
            password_confirm: password,
            first_name: firstName,
            last_name: lastName,
        });
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
    },

    getProfile: async () => {
        const response = await api.get('/accounts/profile/');
        return response.data;
    },

    updateProfile: async (data, image) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));

        if (image) {
            // Determine file type from extension
            const filename = image.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('avatar', {
                uri: image.uri,
                name: filename,
                type: type,
            });
        }

        const response = await api.patch('/accounts/profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// Shopping functions
export const shoppingAPI = {
    // Lists
    getLists: async () => {
        const response = await api.get('/shopping/');
        return response.data;
    },

    getActiveList: async () => {
        const response = await api.get('/shopping/active/');
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/shopping/history/');
        return response.data;
    },

    getListDetails: async (listId) => {
        const response = await api.get(`/shopping/${listId}/`);
        return response.data;
    },

    createList: async (name, budget) => {
        const response = await api.post('/shopping/', {
            name,
            planned_budget: budget,
        });
        return response.data;
    },

    updateList: async (listId, data) => {
        const response = await api.patch(`/shopping/${listId}/`, data);
        return response.data;
    },

    deleteList: async (listId) => {
        await api.delete(`/shopping/${listId}/`);
    },

    completeList: async (listId, paymentMethodId = null) => {
        const response = await api.post(`/shopping/${listId}/complete/`, {
            payment_method_id: paymentMethodId
        });
        return response.data;
    },

    uploadReceipt: async (listId, fileUri) => {
        const formData = new FormData();
        formData.append('receipt_pdf', {
            uri: fileUri,
            name: `receipt_${listId}.pdf`,
            type: 'application/pdf',
        });

        const response = await api.patch(`/shopping/${listId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    cancelList: async (listId) => {
        const response = await api.post(`/shopping/${listId}/cancel/`);
        return response.data;
    },

    duplicateList: async (listId) => {
        const response = await api.post(`/shopping/${listId}/duplicate/`);
        return response.data;
    },

    getBudgetStatus: async (listId) => {
        const response = await api.get(`/shopping/${listId}/budget_status/`);
        return response.data;
    },

    getProductHistory: async (query) => {
        if (!query || query.length < 2) return [];
        const response = await api.get(`/shopping/product_history/?name=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Items
    getItems: async (listId) => {
        const response = await api.get(`/shopping/${listId}/items/`);
        return response.data;
    },

    addItem: async (listId, item) => {
        const response = await api.post(`/shopping/${listId}/items/`, {
            name: item.name,
            unit_price: item.price,
            quantity: item.quantity || 1,
            notes: item.notes || '',
        });
        return response.data;
    },

    updateItem: async (listId, itemId, data) => {
        const response = await api.patch(`/shopping/${listId}/items/${itemId}/`, data);
        return response.data;
    },

    deleteItem: async (listId, itemId) => {
        await api.delete(`/shopping/${listId}/items/${itemId}/`);
    },

    toggleItemCheck: async (listId, itemId) => {
        const response = await api.post(`/shopping/${listId}/items/${itemId}/toggle_check/`);
        return response.data;
    },
};

// Payment functions
export const paymentAPI = {
    getPaymentMethods: async () => {
        const response = await api.get('/payments/');
        return response.data.results || response.data;
    },

    getTotalAvailable: async () => {
        const response = await api.get('/payments/total_available/');
        return response.data;
    },

    createPayment: async (paymentType, name, amount) => {
        const response = await api.post('/payments/', {
            payment_type: paymentType,
            name: name,
            available_amount: amount,
        });
        return response.data;
    },

    updatePayment: async (paymentId, data) => {
        const response = await api.patch(`/payments/${paymentId}/`, data);
        return response.data;
    },

    deletePayment: async (paymentId) => {
        await api.delete(`/payments/${paymentId}/`);
    },

    addFunds: async (paymentId, amount) => {
        const response = await api.post(`/payments/${paymentId}/add_funds/`, {
            amount: amount,
        });
        return response.data;
    },
};

// Analytics functions
export const analyticsAPI = {
    getSummary: async () => {
        const response = await api.get('/analytics/dashboard/summary/');
        return response.data;
    },
};

export default api;
