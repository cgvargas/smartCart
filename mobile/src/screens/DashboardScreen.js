import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { analyticsAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const loadData = async () => {
        try {
            const result = await analyticsAPI.getSummary();
            setData(result);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#1A237E" />
            </View>
        );
    }

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(26, 35, 126, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7, // Thinner bars for better look
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    const historyData = data?.history ? {
        labels: data.history.map(h => h.month).reverse(),
        datasets: [
            {
                data: data.history.map(h => h.total).reverse()
            }
        ]
    } : null;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.headerTitle}>Resumo Financeiro</Text>

            {/* Summary Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Gasto Mensal (Atual)</Text>
                <Text style={styles.bigTotal}>
                    R$ {data?.spent_this_month?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.subText}>
                    {data?.lists_this_month || 0} listas finalizadas este mês
                </Text>
            </View>

            {/* Payment Distribution Pie Chart */}
            {data?.payment_distribution && data.payment_distribution.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Gastos por Método</Text>
                    <PieChart
                        data={data.payment_distribution}
                        width={screenWidth - 60}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"total"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                </View>
            )}

            {/* History Bar Chart */}
            {historyData && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Histórico (6 Meses)</Text>
                    <BarChart
                        data={historyData}
                        width={screenWidth - 60}
                        height={220}
                        yAxisLabel="R$"
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        verticalLabelRotation={0}
                        showValuesOnTopOfBars={true}
                        fromZero={true}
                    />
                </View>
            )}

            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A237E',
        marginBottom: 20,
        marginTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    bigTotal: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subText: {
        fontSize: 14,
        color: '#757575',
        marginTop: 5,
    },
});
