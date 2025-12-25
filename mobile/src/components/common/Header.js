/**
 * Header Component
 * Reusable header for screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../styles/colors';

export default function Header({
    title,
    showBack = false,
    rightComponent = null,
}) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            <View style={styles.rightContainer}>
                {rightComponent}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
    },
    leftContainer: {
        width: 50,
        alignItems: 'flex-start',
    },
    rightContainer: {
        width: 50,
        alignItems: 'flex-end',
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.white,
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 24,
        color: colors.white,
    },
});
