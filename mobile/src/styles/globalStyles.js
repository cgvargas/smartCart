/**
 * Global Styles
 * Shared styles across the app
 */

import { StyleSheet } from 'react-native';
import colors from './colors';

export const globalStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    // Cards
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Typography
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },

    text: {
        fontSize: 16,
        color: colors.text,
    },

    textSmall: {
        fontSize: 14,
        color: colors.textMedium,
    },

    textLight: {
        fontSize: 14,
        color: colors.textLight,
    },

    // Inputs
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
        marginBottom: 12,
    },

    inputError: {
        borderColor: colors.error,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textMedium,
        marginBottom: 6,
    },

    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: -8,
        marginBottom: 8,
    },

    // Buttons
    button: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
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

    buttonDisabled: {
        backgroundColor: colors.disabled,
    },

    // Row layouts
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Dividers
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: 12,
    },

    // Spacing
    mt8: { marginTop: 8 },
    mt16: { marginTop: 16 },
    mt24: { marginTop: 24 },
    mb8: { marginBottom: 8 },
    mb16: { marginBottom: 16 },
    mb24: { marginBottom: 24 },
    p16: { padding: 16 },
    ph16: { paddingHorizontal: 16 },
    pv16: { paddingVertical: 16 },
});

export default globalStyles;
