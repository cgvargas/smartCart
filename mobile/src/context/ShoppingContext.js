/**
 * Shopping Context
 * Global shopping state management
 */

import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import storage from '../services/storage';

const ShoppingContext = createContext({});

export function ShoppingProvider({ children }) {
    const [activeList, setActiveList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch active shopping list
    const fetchActiveList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/shopping/active/');
            setActiveList(response.data);
            await storage.setActiveList(response.data);
            return response.data;
        } catch (err) {
            if (err.response?.status !== 404) {
                setError('Erro ao buscar lista');
            }
            setActiveList(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new shopping list
    const createList = async (data) => {
        setLoading(true);
        try {
            const response = await api.post('/shopping/', data);
            setActiveList(response.data);
            await storage.setActiveList(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, error: 'Erro ao criar lista' };
        } finally {
            setLoading(false);
        }
    };

    // Add item to list
    const addItem = async (listId, itemData) => {
        try {
            const response = await api.post(`/shopping/${listId}/items/`, itemData);
            await fetchActiveList(); // Refresh list
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, error: 'Erro ao adicionar item' };
        }
    };

    // Update item
    const updateItem = async (listId, itemId, data) => {
        try {
            const response = await api.patch(`/shopping/${listId}/items/${itemId}/`, data);
            await fetchActiveList();
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, error: 'Erro ao atualizar item' };
        }
    };

    // Remove item
    const removeItem = async (listId, itemId) => {
        try {
            await api.delete(`/shopping/${listId}/items/${itemId}/`);
            await fetchActiveList();
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Erro ao remover item' };
        }
    };

    // Toggle item checked
    const toggleItemCheck = async (listId, itemId) => {
        try {
            const response = await api.post(`/shopping/${listId}/items/${itemId}/toggle_check/`);
            await fetchActiveList();
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, error: 'Erro ao marcar item' };
        }
    };

    // Complete list
    const completeList = async (listId) => {
        try {
            const response = await api.post(`/shopping/${listId}/complete/`);
            setActiveList(null);
            await storage.setActiveList(null);
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, error: 'Erro ao finalizar lista' };
        }
    };

    // Get budget status
    const getBudgetStatus = async (listId) => {
        try {
            const response = await api.get(`/shopping/${listId}/budget_status/`);
            return response.data;
        } catch (err) {
            return null;
        }
    };

    // Get history
    const getHistory = async () => {
        try {
            const response = await api.get('/shopping/history/');
            return response.data;
        } catch (err) {
            return [];
        }
    };

    // Duplicate list
    const duplicateList = async (listId) => {
        try {
            const response = await api.post(`/shopping/${listId}/duplicate/`);
            setActiveList(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, error: 'Erro ao duplicar lista' };
        }
    };

    return (
        <ShoppingContext.Provider
            value={{
                activeList,
                loading,
                error,
                fetchActiveList,
                createList,
                addItem,
                updateItem,
                removeItem,
                toggleItemCheck,
                completeList,
                getBudgetStatus,
                getHistory,
                duplicateList,
            }}
        >
            {children}
        </ShoppingContext.Provider>
    );
}

export function useShopping() {
    const context = useContext(ShoppingContext);
    if (!context) {
        throw new Error('useShopping must be used within ShoppingProvider');
    }
    return context;
}

export default ShoppingContext;
