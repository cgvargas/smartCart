/**
 * Validators
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} - { isValid, errors }
 */
export function validatePassword(password) {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('Mínimo de 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Pelo menos um número');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate phone number (Brazilian format)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Validate required field
 * @param {string} value
 * @returns {boolean}
 */
export function isRequired(value) {
    return value && value.trim().length > 0;
}

/**
 * Validate positive number
 * @param {number|string} value
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0;
}

/**
 * Validate price format
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPrice(value) {
    // Allow formats: 12.99, 12,99
    const regex = /^\d+([.,]\d{1,2})?$/;
    return regex.test(value);
}

/**
 * Form validation helper
 * @param {object} fields - { fieldName: value }
 * @param {object} rules - { fieldName: [validators] }
 * @returns {object} - { isValid, errors }
 */
export function validateForm(fields, rules) {
    const errors = {};

    Object.keys(rules).forEach((field) => {
        const value = fields[field];
        const fieldRules = rules[field];

        fieldRules.forEach((rule) => {
            if (!rule.validator(value)) {
                errors[field] = rule.message;
            }
        });
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
