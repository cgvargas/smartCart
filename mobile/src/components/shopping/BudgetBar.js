/**
 * BudgetBar Component
 * Visual progress bar for budget tracking
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BUDGET_THRESHOLDS } from '../../utils/constants';

export default function BudgetBar({
    planned,
    spent,
    percentage,
    alertPercentage = 80,
}) {
    // Determine color based on percentage
    const getColor = () => {
        if (percentage > 100) return colors.budgetExceeded;
        if (percentage >= alertPercentage) return colors.budgetDanger;
        if (percentage >= 60) return colors.budgetWarning;
        return colors.budgetOk;
    };

    const progressWidth = Math.min(percentage, 100);
    const barColor = getColor();
    const remaining = planned - spent;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>Orçamento</Text>
                    <Text style={styles.planned}>{formatCurrency(planned)}</Text>
                </View>
                <View style={styles.rightInfo}>
                    <Text style={[styles.percentage, { color: barColor }]}>
                        {formatPercentage(percentage)}
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progressWidth}%`, backgroundColor: barColor },
                        ]}
                    />
                </View>
                {/* Alert marker */}
                <View
                    style={[styles.alertMarker, { left: `${alertPercentage}%` }]}
                />
            </View>

            {/* Footer info */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Gasto</Text>
                    <Text style={[styles.footerValue, { color: barColor }]}>
                        {formatCurrency(spent)}
                    </Text>
                </View>
                <View style={styles.footerRight}>
                    <Text style={styles.footerLabel}>Restante</Text>
                    <Text
                        style={[
                            styles.footerValue,
                            remaining < 0 && styles.negativeValue,
                        ]}
                    >
                        {formatCurrency(remaining)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: colors.textLight,
    },
    planned: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    percentage: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    progressContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    progressBackground: {
        height: 12,
        backgroundColor: colors.divider,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    alertMarker: {
        position: 'absolute',
        top: -4,
        width: 2,
        height: 20,
        backgroundColor: colors.error,
        opacity: 0.7,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerRight: {
        alignItems: 'flex-end',
    },
    footerLabel: {
        fontSize: 11,
        color: colors.textLight,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    negativeValue: {
        color: colors.error,
    },
});
