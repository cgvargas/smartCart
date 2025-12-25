/**
 * Storage Service
 * AsyncStorage wrapper for local data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TOKEN: '@SmartCart:token',
    REFRESH_TOKEN: '@SmartCart:refreshToken',
    USER: '@SmartCart:user',
    ACTIVE_LIST: '@SmartCart:activeList',
    SETTINGS: '@SmartCart:settings',
};

export const storage = {
    /**
     * Store item
     */
    set: async (key, value) => {
        try {
            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    /**
     * Get item
     */
    get: async (key) => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (!value) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    /**
     * Remove item
     */
    remove: async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    /**
     * Clear all app data
     */
    clearAll: async () => {
        try {
            const keys = Object.values(KEYS);
            await AsyncStorage.multiRemove(keys);
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    },

    // Convenience methods
    getUser: () => storage.get(KEYS.USER),
    setUser: (user) => storage.set(KEYS.USER, user),

    getActiveList: () => storage.get(KEYS.ACTIVE_LIST),
    setActiveList: (list) => storage.set(KEYS.ACTIVE_LIST, list),

    getSettings: () => storage.get(KEYS.SETTINGS),
    setSettings: (settings) => storage.set(KEYS.SETTINGS, settings),
};

export { KEYS };
export default storage;
