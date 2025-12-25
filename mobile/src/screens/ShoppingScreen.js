import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    Keyboard,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentAPI, shoppingAPI } from '../services/api';
import { printReceipt } from '../services/receipt';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import {
    sendBudgetWarningNotification,
    sendOverBudgetNotification,
    requestNotificationPermissions
} from '../services/notifications';

export default function ShoppingScreen({ navigation }) {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newQty, setNewQty] = useState('1');
    const [budget, setBudget] = useState(0);
    const [activeList, setActiveList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editQty, setEditQty] = useState('');

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);

    // Track if alerts have been sent this session
    const warningAlertSent = useRef(false);
    const overBudgetAlertSent = useRef(false);

    // Load active list and budget on focus
    useFocusEffect(
        useCallback(() => {
            loadData();
            loadPaymentMethods(); // New Function
            warningAlertSent.current = false;
            overBudgetAlertSent.current = false;
            requestNotificationPermissions();
        }, [])
    );



    // Price Intelligence State
    const [priceHistory, setPriceHistory] = useState(null);
    const searchTimeout = useRef(null);

    const loadPaymentMethods = async () => {
        try {
            const methods = await paymentAPI.getPaymentMethods();
            setPaymentMethods(methods);
            if (methods.length > 0) setSelectedPayment(methods[0].id);
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    };

    // Debounced Price History Search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        setPriceHistory(null);

        if (newItem && newItem.length > 2) {
            searchTimeout.current = setTimeout(async () => {
                try {
                    const history = await shoppingAPI.getProductHistory(newItem);
                    if (history && history.length > 0) {
                        setPriceHistory(history[0]); // Get most recent
                    }
                } catch (error) {
                    console.error('Error fetching price history:', error);
                }
            }, 500);
        }
    }, [newItem]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load budget
            const budgetResponse = await paymentAPI.getTotalAvailable();
            setBudget(budgetResponse.total_available || 0);

            // Try to load active list
            try {
                const listResponse = await shoppingAPI.getActiveList();
                setActiveList(listResponse);
                // Map items from API format to local format
                const mappedItems = listResponse.items?.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: parseFloat(item.unit_price),
                    quantity: parseFloat(item.quantity) || 1,
                    is_checked: item.is_checked,
                })) || [];
                setItems(mappedItems);
            } catch (error) {
                // No active list - that's ok
                if (error.response?.status === 404) {
                    setActiveList(null);
                    setItems([]);
                } else {
                    console.error('Error loading list:', error);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create new list if none exists
    const ensureActiveList = async () => {
        if (activeList) return activeList;

        try {
            const newList = await shoppingAPI.createList('Compras', budget);
            setActiveList(newList);
            return newList;
        } catch (error) {
            console.error('Error creating list:', error);
            throw error;
        }
    };

    const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const percentage = budget > 0 ? (total / budget) * 100 : 0;

    const alertThreshold = user?.alert_percentage || 80;

    const getStatusColor = () => {
        if (percentage >= 100) return '#FF6B6B'; // Bright Red - over budget
        if (percentage >= alertThreshold) return '#FFD93D'; // Bright Yellow - warning
        return '#FFFFFF'; // White - safe (legible on dark header)
    };

    const addItem = async (name, price, qty = 1) => {
        if (!name || isNaN(price)) return;

        setSaving(true);
        try {
            // Ensure we have an active list
            const list = await ensureActiveList();

            // Add item to backend
            const newItemData = await shoppingAPI.addItem(list.id, { name, price, quantity: qty });

            // Reload to ensure sync
            loadData();

            // Check budget alerts (logic simplified, relying on loadData triggers if needed in future)
            const newTotal = total + (price * qty);
            const newPercentage = budget > 0 ? (newTotal / budget) * 100 : 0;

            if (newPercentage >= 100 && !overBudgetAlertSent.current) {
                overBudgetAlertSent.current = true;
                const exceededAmount = newTotal - budget;
                sendOverBudgetNotification(exceededAmount);
                Alert.alert(
                    '🚫 Orçamento Ultrapassado!',
                    `Você ultrapassou em R$ ${exceededAmount.toFixed(2)}.\n\n💡 Dica: Adicione fundos em Pagamentos.`,
                    [
                        { text: 'Continuar', style: 'cancel' },
                        { text: 'Ir para Pagamentos', onPress: () => navigation.navigate('Payments') }
                    ]
                );
            } else if (newPercentage >= alertThreshold && !warningAlertSent.current) {
                warningAlertSent.current = true;
                sendBudgetWarningNotification(newPercentage, alertThreshold);
            }
        } catch (error) {
            console.error('Error adding item:', error);
            Alert.alert('Erro', 'Não foi possível adicionar o item');
        } finally {
            setSaving(false);
        }
    };

    const handleAddManual = () => {
        if (!newItem || !newPrice) {
            Alert.alert('Erro', 'Preencha o nome e preço do item');
            return;
        }

        const price = parseFloat(newPrice.replace(',', '.'));
        const qty = parseFloat(newQty) || 1;

        if (isNaN(price)) {
            Alert.alert('Erro', 'Preço inválido');
            return;
        }

        addItem(newItem, price, qty);
        setNewItem('');
        setNewPrice('');
        setNewQty('1');
        Keyboard.dismiss();
    };

    const removeItem = async (id) => {
        if (!activeList) return;

        try {
            await shoppingAPI.deleteItem(activeList.id, id);
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error removing item:', error);
            Alert.alert('Erro', 'Não foi possível remover o item');
        }
    };

    const toggleItemCheck = async (item) => {
        if (!activeList) return;

        // Optimistic update
        const updatedItems = items.map(i =>
            i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
        );
        setItems(updatedItems);

        try {
            await shoppingAPI.updateItem(activeList.id, item.id, {
                is_checked: !item.is_checked
            });
        } catch (error) {
            console.error('Error toggling check:', error);
            // Revert on error
            setItems(items);
            Alert.alert('Erro', 'Falha ao atualizar status');
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setEditName(item.name);
        setEditPrice(item.price.toFixed(2).replace('.', ','));
        setEditQty(item.quantity.toString());
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editName || !editPrice) {
            Alert.alert('Erro', 'Preencha os campos');
            return;
        }

        const price = parseFloat(editPrice.replace(',', '.'));
        const qty = parseFloat(editQty.replace(',', '.')) || 1;

        try {
            await shoppingAPI.updateItem(activeList.id, editingItem.id, {
                name: editName,
                unit_price: price,
                quantity: qty,
            });
            setShowEditModal(false);
            setEditingItem(null);
            loadData(); // Refresh list to get accurate totals
        } catch (error) {
            console.error('Error updating item:', error);
            Alert.alert('Erro', 'Não foi possível salvar alterações');
        }
    };

    const handleCompleteList = () => {
        if (!activeList || items.length === 0) {
            Alert.alert('Aviso', 'Adicione itens antes de finalizar');
            return;
        }
        setShowCheckoutModal(true);
    };

    const confirmCheckout = async () => {
        if (!selectedPayment) {
            Alert.alert('Erro', 'Selecione um método de pagamento');
            return;
        }

        try {
            await shoppingAPI.completeList(activeList.id, selectedPayment);
            setShowCheckoutModal(false);

            Alert.alert(
                'Sucesso',
                'Compra finalizada! Deseja gerar a Nota Fiscal?',
                [
                    {
                        text: 'Não',
                        onPress: () => {
                            setActiveList(null);
                            setItems([]);
                        }
                    },
                    {
                        text: 'Sim, Gerar PDF',
                        onPress: async () => {
                            const paymentName = paymentMethods.find(p => p.id === selectedPayment)?.name;
                            const uri = await printReceipt(activeList, items, paymentName);
                            if (uri) {
                                try {
                                    await shoppingAPI.uploadReceipt(activeList.id, uri);
                                    console.log('Receipt uploaded successfully');
                                } catch (err) {
                                    console.error('Failed to upload receipt:', err);
                                }
                            }
                            setActiveList(null);
                            setItems([]);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error completing list:', error);
            Alert.alert('Erro', 'Não foi possível finalizar');
        }
    };

    const openScanner = () => {
        navigation.navigate('Scan', {
            onAddItem: (item) => addItem(item.name, item.price, 1)
        });
    };

    // Calculate remaining balance
    const remaining = budget - total;

    // Format currency with proper sign
    const formatRemaining = () => {
        if (remaining < 0) {
            return `-R$ ${Math.abs(remaining).toFixed(2)}`;
        }
        return `R$ ${remaining.toFixed(2)}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#1A237E" />
                <Text style={styles.loadingText}>Carregando lista...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Lista de Compras</Text>
                    <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
                        <Text style={styles.scanButtonText}>📷 Scan</Text>
                    </TouchableOpacity>
                </View>

                {/* Budget Summary */}
                <View style={styles.budgetSummary}>
                    <View style={styles.budgetColumn}>
                        <Text style={styles.budgetLabel}>Orçamento</Text>
                        <Text style={styles.budgetValue}>R$ {budget.toFixed(2)}</Text>
                    </View>
                    <View style={styles.budgetColumn}>
                        <Text style={styles.budgetLabel}>Gasto</Text>
                        <Text style={styles.budgetValue}>R$ {total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.budgetColumn}>
                        <Text style={styles.budgetLabel}>Restante</Text>
                        <Text style={[
                            styles.budgetValue,
                            styles.remainingValue,
                            { color: getStatusColor() }
                        ]}>
                            {formatRemaining()}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: getStatusColor()
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressPercent, { color: getStatusColor() }]}>
                        {percentage.toFixed(0)}%
                    </Text>
                </View>

                {/* Warning messages */}
                {percentage >= alertThreshold && percentage < 100 && (
                    <View style={styles.warningBanner}>
                        <Text style={styles.warningText}>
                            ⚠️ Atenção! Você atingiu {alertThreshold}% do orçamento
                        </Text>
                    </View>
                )}
                {percentage >= 100 && (
                    <View style={[styles.warningBanner, { backgroundColor: 'rgba(211,47,47,0.2)' }]}>
                        <Text style={[styles.warningText, { color: '#D32F2F' }]}>
                            🚫 Orçamento ultrapassado!
                        </Text>
                    </View>
                )}
            </View>

            {/* Add Item Form */}
            <View style={styles.addForm}>
                <TextInput
                    style={styles.inputName}
                    placeholder="Nome do item"
                    placeholderTextColor="#999"
                    value={newItem}
                    onChangeText={setNewItem}
                    returnKeyType="next"
                />
                <TextInput
                    style={styles.inputQty}
                    placeholder="Qtd"
                    placeholderTextColor="#999"
                    value={newQty}
                    onChangeText={setNewQty}
                    keyboardType="number-pad"
                    returnKeyType="next"
                />
                <TextInput
                    style={styles.inputPrice}
                    placeholder="R$"
                    placeholderTextColor="#999"
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleAddManual}
                />
                <TouchableOpacity
                    style={[styles.addButton, saving && styles.addButtonDisabled]}
                    onPress={handleAddManual}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.addButtonText}>+</Text>
                    )}
                </TouchableOpacity>
            </View>

            {priceHistory && (
                <View style={styles.priceHistoryContainer}>
                    <Text style={styles.priceHistoryText}>
                        💡 Última vez: R$ {parseFloat(priceHistory.price).toFixed(2)}
                        <Text style={{ fontSize: 10, color: '#666' }}>
                            ({new Date(priceHistory.date).toLocaleDateString('pt-BR')})
                        </Text>
                    </Text>
                </View>
            )}

            {/* Items List */}
            <FlatList
                style={styles.list}
                data={items}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🛒</Text>
                        <Text style={styles.emptyText}>Nenhum item adicionado</Text>
                        <Text style={styles.emptySubtext}>Use o Scan ou adicione manualmente</Text>
                    </View>
                }
                ListFooterComponent={
                    items.length > 0 ? (
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={handleCompleteList}
                        >
                            <Text style={styles.completeButtonText}>✅ Finalizar Compra</Text>
                            <Text style={styles.completeButtonTotal}>Total: R$ {total.toFixed(2)}</Text>
                        </TouchableOpacity>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.itemCard, item.is_checked && styles.itemCardChecked]}
                        activeOpacity={0.9}
                        onPress={() => toggleItemCheck(item)}
                        onLongPress={() => openEditModal(item)}
                    >
                        {/* Checkbox */}
                        <View style={[styles.checkbox, item.is_checked && styles.checkboxChecked]}>
                            {item.is_checked && <Text style={styles.checkmark}>✓</Text>}
                        </View>

                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, item.is_checked && styles.itemTextChecked]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.itemPrice, item.is_checked && styles.itemTextChecked]}>
                                {item.quantity > 1 ? `${item.quantity}x ` : ''}R$ {item.price.toFixed(2)}
                                {item.quantity > 1 ? ` (= R$ ${(item.price * item.quantity).toFixed(2)})` : ''}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.editButtonIcon}
                            onPress={() => openEditModal(item)}
                        >
                            <Text style={styles.editIconText}>✎</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeItem(item.id)}
                        >
                            <Text style={styles.removeButtonText}>X</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            {/* Edit Item Modal */}
            <Modal visible={showEditModal} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Item</Text>

                        <Text style={styles.inputLabel}>Nome</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                        />

                        <View style={styles.rowInputs}>
                            <View style={styles.flexHalf}>
                                <Text style={styles.inputLabel}>Quantidade</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editQty}
                                    onChangeText={setEditQty}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={styles.flexHalf}>
                                <Text style={styles.inputLabel}>Preço (R$)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editPrice}
                                    onChangeText={setEditPrice}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

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

            {/* Checkout Modal */}
            <Modal visible={showCheckoutModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Finalizar Compra</Text>

                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#2E7D32' }}>
                                R$ {total.toFixed(2)}
                            </Text>
                            <Text style={styles.subText}>Total a pagar</Text>
                        </View>

                        <Text style={styles.inputLabel}>Forma de Pagamento</Text>
                        <ScrollView style={{ maxHeight: 150, marginBottom: 20 }}>
                            {paymentMethods.map(pm => (
                                <TouchableOpacity
                                    key={pm.id}
                                    style={[
                                        styles.paymentOption,
                                        selectedPayment === pm.id && styles.paymentOptionSelected
                                    ]}
                                    onPress={() => setSelectedPayment(pm.id)}
                                >
                                    <Text style={[
                                        styles.paymentOptionText,
                                        selectedPayment === pm.id && styles.paymentOptionTextSelected
                                    ]}>{pm.name}</Text>
                                    <Text style={{ color: '#666' }}>
                                        R$ {parseFloat(pm.available_amount).toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {paymentMethods.length === 0 && (
                                <Text style={{ color: '#999', textAlign: 'center', padding: 10 }}>
                                    Nenhum método cadastrado. Vá em Pagamentos.
                                </Text>
                            )}
                        </ScrollView>

                        <Button
                            title="Confirmar Compra"
                            onPress={confirmCheckout}
                            style={styles.modalButton}
                        />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowCheckoutModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    scanButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    scanButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    budgetSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    budgetColumn: {
        alignItems: 'center',
        flex: 1,
    },
    budgetLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        marginBottom: 4,
    },
    budgetValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    remainingValue: {
        fontSize: 18,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBar: {
        flex: 1,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 5,
        marginRight: 10,
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    progressPercent: {
        fontWeight: 'bold',
        fontSize: 14,
        minWidth: 45,
        textAlign: 'right',
    },
    warningBanner: {
        backgroundColor: 'rgba(255,152,0,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 4,
    },
    warningText: {
        color: '#FF9800',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    list: {
        flex: 1,
        padding: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 5,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemCardChecked: {
        backgroundColor: '#f8f8f8',
        opacity: 0.8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        borderColor: '#4CAF50',
        backgroundColor: '#4CAF50',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    itemPrice: {
        fontSize: 14,
        color: '#1A237E',
        marginTop: 4,
    },
    editButtonIcon: {
        padding: 8,
        marginRight: 4,
    },
    editIconText: {
        fontSize: 20,
        color: '#1A237E',
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#f44336',
        fontWeight: 'bold',
    },
    addForm: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    inputName: {
        flex: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 12,
        marginRight: 8,
    },
    inputQty: {
        width: 60,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 12,
        marginRight: 8,
        textAlign: 'center',
    },
    inputPrice: {
        flex: 1.5,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        marginRight: 10,
        fontSize: 16,
    },
    priceHistoryContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: '#E3F2FD',
    },
    priceHistoryText: {
        fontSize: 12,
        color: '#1565C0',
        fontWeight: 'bold',
    },
    addButton: {
        width: 50,
        height: 50, backgroundColor: '#1A237E',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.7,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 10,
    },
    completeButton: {
        backgroundColor: '#1A237E',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    completeButtonTotal: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 16,
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    flexHalf: {
        width: '48%',
    },
    paymentOption: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentOptionSelected: {
        backgroundColor: '#E8EAF6',
        borderWidth: 1,
        borderColor: '#1A237E',
    },
    paymentOptionText: {
        fontSize: 16,
        color: '#333',
    },
    paymentOptionTextSelected: {
        color: '#1A237E',
        fontWeight: 'bold',
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
        color: '#999',
        fontSize: 14,
    },
});
