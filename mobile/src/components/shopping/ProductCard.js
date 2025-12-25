/**
 * ProductCard Component
 * Card for displaying product in shopping list
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import colors from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';

export default function ProductCard({
    item,
    onPress,
    onToggleCheck,
    onRemove,
}) {
    const { name, unit_price, quantity, subtotal, is_checked, image } = item;

    return (
        <TouchableOpacity
            style={[styles.container, is_checked && styles.containerChecked]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Checkbox */}
            <TouchableOpacity
                style={[styles.checkbox, is_checked && styles.checkboxChecked]}
                onPress={onToggleCheck}
            >
                {is_checked && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            {/* Product Image */}
            {image && (
                <Image source={{ uri: image }} style={styles.image} />
            )}

            {/* Product Info */}
            <View style={styles.info}>
                <Text
                    style={[styles.name, is_checked && styles.nameChecked]}
                    numberOfLines={2}
                >
                    {name}
                </Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>
                        {formatCurrency(unit_price)} x {quantity}
                    </Text>
                </View>
            </View>

            {/* Subtotal */}
            <View style={styles.subtotalContainer}>
                <Text style={[styles.subtotal, is_checked && styles.subtotalChecked]}>
                    {formatCurrency(subtotal)}
                </Text>
            </View>

            {/* Remove button */}
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 12,
        marginVertical: 4,
        marginHorizontal: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    containerChecked: {
        backgroundColor: colors.primaryLight,
        opacity: 0.8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    nameChecked: {
        textDecorationLine: 'line-through',
        color: colors.textLight,
    },
    priceRow: {
        flexDirection: 'row',
    },
    price: {
        fontSize: 13,
        color: colors.textLight,
    },
    subtotalContainer: {
        marginLeft: 8,
        alignItems: 'flex-end',
    },
    subtotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    subtotalChecked: {
        color: colors.textLight,
    },
    removeButton: {
        marginLeft: 8,
        padding: 4,
    },
    removeText: {
        fontSize: 24,
        color: colors.error,
        fontWeight: '300',
    },
});
