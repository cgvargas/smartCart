/**
 * Button Component
 * Reusable button with variants
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../../styles/colors';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) {
    const buttonStyles = [
        styles.button,
        variant === 'outline' && styles.buttonOutline,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        style,
    ];

    const textStyles = [
        styles.buttonText,
        variant === 'outline' && styles.buttonOutlineText,
        disabled && styles.buttonDisabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonOutline: {
        backgroundColor: colors.transparent,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonOutlineText: {
        color: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonDanger: {
        backgroundColor: colors.error,
    },
    buttonDisabled: {
        backgroundColor: colors.disabled,
        borderColor: colors.disabled,
    },
    buttonDisabledText: {
        color: colors.textLight,
    },
});
