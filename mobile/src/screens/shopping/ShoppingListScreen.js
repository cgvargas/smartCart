/**
 * Shopping List Screen
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { useShopping } from '../../context/ShoppingContext';
import { useAuth } from '../../context/AuthContext';
import BudgetBar from '../../components/shopping/BudgetBar';
import ProductCard from '../../components/shopping/ProductCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import { SCREENS } from '../../utils/constants';

export default function ShoppingListScreen({ navigation }) {
    const { user } = useAuth();
    const {
        activeList,
        fetchActiveList,
        toggleItemCheck,
        removeItem,
        completeList,
        loading,
    } = useShopping();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchActiveList();
    }, []);

    // Check budget alert
    useEffect(() => {
        if (activeList) {
            const alertPercentage = user?.alert_percentage || 80;
            if (activeList.budget_percentage >= alertPercentage) {
                Alert.alert(
                    '⚠️ Atenção!',
                    `Você já gastou ${activeList.budget_percentage.toFixed(1)}% do seu orçamento.`,
                    [
                        { text: 'Continuar', style: 'cancel' },
                        { text: 'Ver Opções', onPress: () => { } },
                    ]
                );
            }
        }
    }, [activeList?.budget_percentage]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchActiveList();
        setRefreshing(false);
    };

    const handleToggleCheck = async (itemId) => {
        await toggleItemCheck(activeList.id, itemId);
    };

    const handleRemoveItem = (item) => {
        Alert.alert(
            'Remover Item',
            `Remover "${item.name}" da lista?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => removeItem(activeList.id, item.id),
                },
            ]
        );
    };

    const handleComplete = () => {
        Alert.alert(
            'Finalizar Compra',
            'Deseja finalizar esta compra?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    onPress: async () => {
                        await completeList(activeList.id);
                        navigation.navigate(SCREENS.HOME);
                    },
                },
            ]
        );
    };

    if (loading && !activeList) {
        return <Loading message="Carregando lista..." />;
    }

    if (!activeList) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Nenhuma lista ativa</Text>
                <Text style={styles.emptyText}>
                    Crie uma nova lista para começar suas compras
                </Text>
                <Button
                    title="+ Nova Lista"
                    onPress={() => navigation.navigate(SCREENS.NEW_LIST)}
                    style={styles.newListButton}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Budget Bar */}
            <BudgetBar
                planned={parseFloat(activeList.planned_budget)}
                spent={parseFloat(activeList.total_spent)}
                percentage={activeList.budget_percentage}
                alertPercentage={user?.alert_percentage || 80}
            />

            {/* Items List */}
            <FlatList
                data={activeList.items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ProductCard
                        item={item}
                        onToggleCheck={() => handleToggleCheck(item.id)}
                        onRemove={() => handleRemoveItem(item)}
                        onPress={() => navigation.navigate(SCREENS.PRODUCT_DETAIL, { item })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyList}>
                        <Text style={styles.emptyListText}>
                            Nenhum item na lista ainda
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => navigation.navigate(SCREENS.CAMERA)}
                >
                    <Text style={styles.scanButtonText}>📷 Escanear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate(SCREENS.PRODUCT_DETAIL, { item: null })}
                >
                    <Text style={styles.addButtonText}>+ Adicionar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={handleComplete}
                >
                    <Text style={styles.finishButtonText}>✓ Finalizar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: colors.background,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 24,
    },
    newListButton: {
        paddingHorizontal: 32,
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyList: {
        padding: 32,
        alignItems: 'center',
    },
    emptyListText: {
        fontSize: 16,
        color: colors.textLight,
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    scanButton: {
        flex: 1,
        backgroundColor: colors.secondary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    scanButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    addButton: {
        flex: 1,
        backgroundColor: colors.accent,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    finishButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    finishButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});
