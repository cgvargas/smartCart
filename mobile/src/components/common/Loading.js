/**
 * Loading Component
 * Full screen loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

export default function Loading({ message = 'Carregando...' }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    message: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textMedium,
    },
});
