/**
 * Home Screen
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useShopping } from '../../context/ShoppingContext';
import Button from '../../components/common/Button';
import BudgetBar from '../../components/shopping/BudgetBar';
import colors from '../../styles/colors';
import { SCREENS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { activeList, fetchActiveList, loading } = useShopping();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchActiveList();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchActiveList();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Welcome */}
            <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>
                    Olá, {user?.first_name || 'Usuário'}! 👋
                </Text>
                <Text style={styles.welcomeText}>
                    {activeList
                        ? 'Você tem uma compra em andamento'
                        : 'Pronto para fazer compras?'}
                </Text>
            </View>

            {/* Active List or New List Button */}
            {activeList ? (
                <View style={styles.activeListSection}>
                    <BudgetBar
                        planned={parseFloat(activeList.planned_budget)}
                        spent={parseFloat(activeList.total_spent)}
                        percentage={activeList.budget_percentage}
                        alertPercentage={user?.alert_percentage || 80}
                    />

                    <View style={styles.listInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Itens na lista:</Text>
                            <Text style={styles.infoValue}>{activeList.items_count}</Text>
                        </View>
                    </View>

                    <Button
                        title="Continuar Compras"
                        onPress={() => navigation.navigate(SCREENS.SHOPPING)}
                        style={styles.continueButton}
                    />
                </View>
            ) : (
                <View style={styles.newListSection}>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🛒</Text>
                        <Text style={styles.emptyTitle}>Nenhuma lista ativa</Text>
                        <Text style={styles.emptyText}>
                            Crie uma nova lista de compras para começar
                        </Text>
                    </View>

                    <Button
                        title="+ Nova Lista de Compras"
                        onPress={() => navigation.navigate(SCREENS.NEW_LIST)}
                        style={styles.newListButton}
                    />
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Acesso Rápido</Text>

                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate(SCREENS.PAYMENTS)}
                    >
                        <Text style={styles.actionIcon}>💳</Text>
                        <Text style={styles.actionText}>Pagamentos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate(SCREENS.HISTORY)}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionText}>Histórico</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate(SCREENS.PROFILE)}
                    >
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <Text style={styles.actionText}>Configurações</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingBottom: 24,
    },
    welcomeSection: {
        backgroundColor: colors.primary,
        padding: 24,
        paddingTop: 32,
        paddingBottom: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    welcomeText: {
        fontSize: 16,
        color: colors.white,
        opacity: 0.9,
    },
    activeListSection: {
        marginTop: -20,
    },
    listInfo: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    continueButton: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    newListSection: {
        marginTop: -20,
        paddingHorizontal: 16,
    },
    emptyState: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
    },
    newListButton: {
        marginTop: 16,
    },
    quickActions: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        color: colors.textMedium,
        fontWeight: '500',
    },
});
