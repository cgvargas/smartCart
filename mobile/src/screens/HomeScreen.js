import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import { formatCurrency, resolveImageUrl } from '../utils/formatters';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Load total available on screen focus
    useFocusEffect(
        useCallback(() => {
            loadTotalAvailable();
        }, [])
    );

    const loadTotalAvailable = async () => {
        try {
            const response = await paymentAPI.getTotalAvailable();
            setTotalAvailable(response.total_available || 0);
        } catch (error) {
            console.error('Error loading total available:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTotalAvailable();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>
                            Olá, {user?.first_name || 'Usuário'}!
                        </Text>
                        <Text style={styles.subtitle}>Bem-vindo ao SmartCart</Text>
                    </View>
                    {user?.avatar ? (
                        <Image source={{ uri: resolveImageUrl(user.avatar) }} style={styles.headerAvatar} />
                    ) : (
                        <View style={styles.headerAvatarPlaceholder}>
                            <Text style={styles.headerAvatarText}>
                                {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Saldo Card */}
                <TouchableOpacity
                    style={styles.balanceCard}
                    onPress={() => navigation.navigate('Payments')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.balanceLabel}>Orçamento Disponível</Text>
                    <Text style={styles.balanceValue}>{formatCurrency(totalAvailable)}</Text>
                    <Text style={styles.balanceHint}>Toque para gerenciar</Text>
                </TouchableOpacity>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Ações Rápidas</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Shopping')}
                >
                    <View style={styles.actionIcon}>
                        <Text style={styles.actionIconText}>+</Text>
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Nova Compra</Text>
                        <Text style={styles.actionDesc}>Iniciar uma nova lista de compras</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('History')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
                        <Text style={styles.actionIconText}>📋</Text>
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Histórico</Text>
                        <Text style={styles.actionDesc}>Ver compras anteriores</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Payments')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
                        <Text style={styles.actionIconText}>💳</Text>
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Pagamentos</Text>
                        <Text style={styles.actionDesc}>Gerenciar formas de pagamento</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#1A237E',
        paddingTop: 15,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#fff',
    },
    headerAvatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
    },
    content: {
        flex: 1,
        padding: 20,
        marginTop: -20,
    },
    balanceCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    balanceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    balanceHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#1A237E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionIconText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    actionDesc: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
});
