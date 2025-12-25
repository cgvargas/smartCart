/**
 * Formatters
 * Utility functions for formatting values
 */

/**
 * Format currency to BRL
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Format date to Brazilian format
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Format date and time
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
    if (!date) return '';

    const d = new Date(date);
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
}

/**
 * Parse currency string to number
 * @param {string} value
 * @returns {number}
 */
export function parseCurrency(value) {
    if (!value) return 0;

    // Remove currency symbol and spaces
    const cleaned = value
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    return parseFloat(cleaned) || 0;
}

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 30) {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}
/**
 * Resolve image URL
 * @param {string} url
 * @returns {string}
 */
export function resolveImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    // Hardcoded API URL base for now - ideally should come from config
    const API_BASE = 'http://192.168.1.3:8000';
    return `${API_BASE}/${cleanPath}`;
}
