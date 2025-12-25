/**
 * Payment Screen
 * Manages user's payment methods/budget sources
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_TYPES, SCREENS } from '../../utils/constants';
import { paymentAPI } from '../../services/api';

export default function PaymentScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [payments, setPayments] = useState([]);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState('');

    // Add Funds Modal State
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [addingFundsPayment, setAddingFundsPayment] = useState(null);
    const [fundsAmount, setFundsAmount] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadPayments();
        }, [])
    );

    const loadPayments = async () => {
        try {
            const [paymentsRes, totalRes] = await Promise.all([
                paymentAPI.getPaymentMethods(),
                paymentAPI.getTotalAvailable(),
            ]);

            setPayments(paymentsRes.results || paymentsRes);
            setTotalAvailable(totalRes.total_available);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPayments();
        setRefreshing(false);
    };

    // EDIT PAYMENT
    const openEditModal = (payment) => {
        setEditingPayment(payment);
        setEditName(payment.name);
        setEditAmount(payment.available_amount.toString().replace('.', ','));
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editAmount || parseFloat(editAmount.replace(',', '.')) < 0) {
            Alert.alert('Erro', 'Informe um valor válido');
            return;
        }

        try {
            await paymentAPI.updatePayment(editingPayment.id, {
                name: editName || PAYMENT_TYPES[editingPayment.payment_type]?.label,
                available_amount: parseFloat(editAmount.replace(',', '.')),
            });

            setShowEditModal(false);
            setEditingPayment(null);
            loadPayments();
            Alert.alert('Sucesso', 'Forma de pagamento atualizada!');
        } catch (error) {
            console.error('Error updating payment:', error);
            Alert.alert('Erro', 'Não foi possível atualizar');
        }
    };

    // ADD FUNDS
    const openAddFundsModal = (payment) => {
        setAddingFundsPayment(payment);
        setFundsAmount('');
        setShowAddFundsModal(true);
    };

    const handleAddFunds = async () => {
        const amount = parseFloat(fundsAmount.replace(',', '.'));

        if (!fundsAmount || isNaN(amount) || amount <= 0) {
            Alert.alert('Erro', 'Informe um valor válido maior que zero');
            return;
        }

        try {
            await paymentAPI.addFunds(addingFundsPayment.id, amount);

            setShowAddFundsModal(false);
            setAddingFundsPayment(null);
            loadPayments();
            Alert.alert('Sucesso', `R$ ${amount.toFixed(2).replace('.', ',')} adicionado!`);
        } catch (error) {
            console.error('Error adding funds:', error);
            Alert.alert('Erro', 'Não foi possível adicionar valor');
        }
    };

    // DELETE
    const handleDelete = (payment) => {
        Alert.alert(
            'Excluir',
            `Remover "${payment.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await paymentAPI.deletePayment(payment.id);
                            loadPayments();
                        } catch (error) {
                            console.error('Error deleting payment:', error);
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardIcon}>
                <Text style={styles.iconText}>
                    {item.payment_type === 'cash' ? '💵' :
                        item.payment_type === 'pix' ? '📱' :
                            item.payment_type === 'ticket' ? '🎫' :
                                item.payment_type === 'paypal' ? '🅿️' : '💳'}
                </Text>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.cardType}>
                    {PAYMENT_TYPES[item.payment_type]?.label}
                </Text>
                <Text style={styles.cardName}>{item.name}</Text>
            </View>

            <View style={styles.cardAmount}>
                <Text style={styles.amountValue}>
                    {formatCurrency(item.available_amount)}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.addFundsButton}
                onPress={() => openAddFundsModal(item)}
            >
                <Text style={styles.addFundsText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
            >
                <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return <Loading message="Carregando pagamentos..." />;
    }

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Formas de Pagamento</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Total */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Orçamento Total Disponível</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAvailable)}</Text>
                <Text style={styles.totalHint}>
                    Toque em um item para editar • "+" para adicionar valor
                </Text>
            </View>

            {/* List */}
            <FlatList
                data={payments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>💳</Text>
                        <Text style={styles.emptyText}>
                            Nenhuma forma de pagamento
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Adicione seu orçamento para começar
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {/* Add Button */}
            <View style={styles.addButtonContainer}>
                <Button
                    title="+ Adicionar Forma de Pagamento"
                    onPress={() => navigation.navigate(SCREENS.ADD_PAYMENT)}
                />
            </View>

            {/* Edit Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Pagamento</Text>

                        {editingPayment && (
                            <View style={styles.editTypeInfo}>
                                <Text style={styles.editTypeIcon}>
                                    {editingPayment.payment_type === 'cash' ? '💵' :
                                        editingPayment.payment_type === 'pix' ? '📱' :
                                            editingPayment.payment_type === 'ticket' ? '🎫' :
                                                editingPayment.payment_type === 'paypal' ? '🅿️' : '💳'}
                                </Text>
                                <Text style={styles.editTypeLabel}>
                                    {PAYMENT_TYPES[editingPayment.payment_type]?.label}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.inputLabel}>Nome/Descrição</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Ex: Ticket Alimentação"
                        />

                        <Text style={styles.inputLabel}>Valor Disponível (R$)</Text>
                        <TextInput
                            style={styles.input}
                            value={editAmount}
                            onChangeText={setEditAmount}
                            placeholder="0,00"
                            keyboardType="decimal-pad"
                        />

                        <Button
                            title="Salvar Alterações"
                            onPress={handleSaveEdit}
                            style={styles.modalButton}
                        />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowEditModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Add Funds Modal */}
            <Modal visible={showAddFundsModal} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Valor</Text>

                        {addingFundsPayment && (
                            <View style={styles.fundsInfo}>
                                <Text style={styles.fundsLabel}>
                                    {addingFundsPayment.name}
                                </Text>
                                <Text style={styles.fundsCurrentAmount}>
                                    Saldo atual: {formatCurrency(addingFundsPayment.available_amount)}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.inputLabel}>Valor a adicionar (R$)</Text>
                        <TextInput
                            style={styles.inputLarge}
                            value={fundsAmount}
                            onChangeText={setFundsAmount}
                            placeholder="0,00"
                            keyboardType="decimal-pad"
                            autoFocus
                        />

                        {fundsAmount && addingFundsPayment && (
                            <Text style={styles.newTotal}>
                                Novo saldo: {formatCurrency(
                                    parseFloat(addingFundsPayment.available_amount) +
                                    (parseFloat(fundsAmount.replace(',', '.')) || 0)
                                )}
                            </Text>
                        )}

                        <Button
                            title="Adicionar"
                            onPress={handleAddFunds}
                            style={styles.modalButton}
                        />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowAddFundsModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingBottom: 15,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: colors.white,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.white,
        textAlign: 'center',
        marginRight: 32,
    },
    headerSpacer: {
        width: 40,
    },
    totalCard: {
        backgroundColor: colors.primary,
        padding: 24,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    totalHint: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.7,
        marginTop: 8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    cardInfo: {
        flex: 1,
    },
    cardType: {
        fontSize: 12,
        color: colors.textLight,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    cardAmount: {
        marginRight: 8,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    addFundsButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    addFundsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 24,
        color: colors.error,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textLight,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textLight,
        opacity: 0.7,
        marginTop: 4,
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 20,
    },
    editTypeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        padding: 12,
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
    },
    editTypeIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    editTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    inputLabel: {
        fontSize: 14,
        color: colors.textMedium,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 16,
    },
    inputLarge: {
        backgroundColor: colors.background,
        borderRadius: 10,
        padding: 16,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalButton: {
        marginTop: 8,
    },
    cancelButton: {
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: colors.textLight,
        fontSize: 14,
    },
    fundsInfo: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
    },
    fundsLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    fundsCurrentAmount: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 4,
    },
    newTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
});
