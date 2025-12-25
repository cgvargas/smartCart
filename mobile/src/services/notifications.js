/**
 * Notifications Service
 * Local push notifications for budget alerts
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const NOTIFICATIONS_ENABLED_KEY = '@smartcart_notifications_enabled';

/**
 * Request notification permissions from the user
 * @returns {boolean} Whether permissions were granted
 */
export const requestNotificationPermissions = async () => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permissions not granted');
            return false;
        }

        // Android needs a notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('budget-alerts', {
                name: 'Alertas de Orçamento',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#1A237E',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
};

/**
 * Check if notifications are enabled in app settings
 * @returns {boolean}
 */
export const areNotificationsEnabled = async () => {
    try {
        const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        return value !== 'false'; // Default to true
    } catch (error) {
        return true;
    }
};

/**
 * Set notifications enabled state
 * @param {boolean} enabled
 */
export const setNotificationsEnabled = async (enabled) => {
    try {
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
    } catch (error) {
        console.error('Error saving notification preference:', error);
    }
};

/**
 * Send a budget warning notification
 * @param {number} percentage - Current usage percentage
 * @param {number} threshold - Alert threshold
 */
export const sendBudgetWarningNotification = async (percentage, threshold) => {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return;

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⚠️ Alerta de Orçamento',
                body: `Você atingiu ${Math.round(percentage)}% do seu orçamento! Limite configurado: ${threshold}%`,
                data: { type: 'budget_warning', percentage },
                sound: true,
            },
            trigger: null, // Immediate
        });
    } catch (error) {
        console.error('Error sending budget warning notification:', error);
    }
};

/**
 * Send an over-budget notification
 * @param {number} exceededAmount - Amount over budget
 */
export const sendOverBudgetNotification = async (exceededAmount) => {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return;

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🚫 Orçamento Ultrapassado!',
                body: `Você ultrapassou R$ ${Math.abs(exceededAmount).toFixed(2)}. Adicione crédito ou revise os itens.`,
                data: { type: 'over_budget', amount: exceededAmount },
                sound: true,
            },
            trigger: null, // Immediate
        });
    } catch (error) {
        console.error('Error sending over budget notification:', error);
    }
};

/**
 * Send a test notification
 */
export const sendTestNotification = async () => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '✅ Notificações Ativas',
                body: 'Os alertas de orçamento estão funcionando!',
                sound: true,
            },
            trigger: null,
        });
        return true;
    } catch (error) {
        console.error('Error sending test notification:', error);
        return false;
    }
};

export default {
    requestNotificationPermissions,
    areNotificationsEnabled,
    setNotificationsEnabled,
    sendBudgetWarningNotification,
    sendOverBudgetNotification,
    sendTestNotification,
};
