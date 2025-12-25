/**
 * Constants
 * App-wide configuration
 */

// API URL - change for production
export const API_URL = __DEV__
    ? 'http://172.22.32.1:8000/api'  // Local development IP
    : 'https://smartcart-api.render.com/api'; // Production

// Payment types
export const PAYMENT_TYPES = {
    cash: { label: 'Dinheiro', icon: 'cash' },
    debit: { label: 'Cartão de Débito', icon: 'credit-card' },
    credit: { label: 'Cartão de Crédito', icon: 'credit-card-outline' },
    pix: { label: 'PIX', icon: 'qrcode' },
    ticket: { label: 'Ticket Alimentação', icon: 'ticket' },
    paypal: { label: 'PayPal', icon: 'paypal' },
};

// Shopping list statuses
export const LIST_STATUS = {
    active: { label: 'Em Andamento', color: '#4CAF50' },
    completed: { label: 'Finalizada', color: '#2196F3' },
    cancelled: { label: 'Cancelada', color: '#F44336' },
};

// Alert thresholds
export const BUDGET_THRESHOLDS = {
    ok: { max: 60, color: '#4CAF50' },          // Green
    warning: { max: 80, color: '#FF9800' },     // Orange
    danger: { max: 100, color: '#F44336' },     // Red
    exceeded: { max: Infinity, color: '#D32F2F' }, // Dark Red
};

// Screen names
export const SCREENS = {
    // Auth
    LOGIN: 'Login',
    REGISTER: 'Register',

    // Main tabs
    HOME: 'Home',
    SHOPPING: 'Shopping',
    HISTORY: 'History',
    PROFILE: 'Profile',

    // Shopping flow
    NEW_LIST: 'NewList',
    CAMERA: 'Camera',
    PRODUCT_DETAIL: 'ProductDetail',

    // Payments
    PAYMENTS: 'Payments',
    ADD_PAYMENT: 'AddPayment',
};
