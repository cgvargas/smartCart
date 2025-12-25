/**
 * New List Screen
 * Create a new shopping list
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useShopping } from '../../context/ShoppingContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import { SCREENS, PAYMENT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

export default function NewListScreen({ navigation }) {
    const { createList } = useShopping();

    const [name, setName] = useState('');
    const [plannedBudget, setPlannedBudget] = useState('');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get('/payments/');
            setPaymentMethods(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const togglePayment = (paymentId) => {
        setSelectedPayments((prev) =>
            prev.includes(paymentId)
                ? prev.filter((id) => id !== paymentId)
                : [...prev, paymentId]
        );
    };

    const calculateTotal = () => {
        return paymentMethods
            .filter((pm) => selectedPayments.includes(pm.id))
            .reduce((sum, pm) => sum + parseFloat(pm.available_amount), 0);
    };

    const handleCreate = async () => {
        if (!plannedBudget || parseFloat(plannedBudget) <= 0) {
            Alert.alert('Erro', 'Informe um orçamento válido');
            return;
        }

        setLoading(true);
        const result = await createList({
            name: name || `Compras ${new Date().toLocaleDateString('pt-BR')}`,
            planned_budget: parseFloat(plannedBudget.replace(',', '.')),
            payment_methods_ids: selectedPayments,
        });
        setLoading(false);

        if (result.success) {
            navigation.replace(SCREENS.SHOPPING);
        } else {
            Alert.alert('Erro', result.error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Input
                    label="Nome da lista (opcional)"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Compras da semana"
                />

                <Input
                    label="Orçamento planejado *"
                    value={plannedBudget}
                    onChangeText={setPlannedBudget}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                />

                {/* Payment Methods Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Formas de Pagamento</Text>

                    {paymentMethods.length === 0 ? (
                        <View style={styles.noPayments}>
                            <Text style={styles.noPaymentsText}>
                                Nenhuma forma de pagamento cadastrada
                            </Text>
                            <Button
                                title="+ Adicionar"
                                variant="outline"
                                onPress={() => navigation.navigate(SCREENS.ADD_PAYMENT)}
                                style={styles.addPaymentButton}
                            />
                        </View>
                    ) : (
                        paymentMethods.map((payment) => (
                            <TouchableOpacity
                                key={payment.id}
                                style={[
                                    styles.paymentCard,
                                    selectedPayments.includes(payment.id) && styles.paymentCardSelected,
                                ]}
                                onPress={() => togglePayment(payment.id)}
                            >
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentType}>
                                        {PAYMENT_TYPES[payment.payment_type]?.label || payment.payment_type}
                                    </Text>
                                    <Text style={styles.paymentName}>{payment.name}</Text>
                                </View>
                                <Text style={styles.paymentAmount}>
                                    {formatCurrency(payment.available_amount)}
                                </Text>
                                {selectedPayments.includes(payment.id) && (
                                    <View style={styles.checkmark}>
                                        <Text style={styles.checkmarkText}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}

                    {selectedPayments.length > 0 && (
                        <View style={styles.totalSelected}>
                            <Text style={styles.totalLabel}>Total selecionado:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                        </View>
                    )}
                </View>

                <Button
                    title="Iniciar Compras"
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.createButton}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    noPayments: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    noPaymentsText: {
        color: colors.textLight,
        marginBottom: 16,
    },
    addPaymentButton: {
        paddingHorizontal: 24,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: colors.transparent,
    },
    paymentCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentType: {
        fontSize: 14,
        color: colors.textLight,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginRight: 12,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    totalSelected: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    totalLabel: {
        color: colors.textMedium,
    },
    totalValue: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    createButton: {
        marginTop: 32,
    },
});
