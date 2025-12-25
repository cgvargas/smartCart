/**
 * Add Payment Screen
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import { PAYMENT_TYPES } from '../../utils/constants';
import api from '../../services/api';

export default function AddPaymentScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [paymentType, setPaymentType] = useState(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!paymentType) {
            newErrors.paymentType = 'Selecione um tipo';
        }

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = 'Informe um valor válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post('/payments/', {
                payment_type: paymentType,
                name: name || PAYMENT_TYPES[paymentType]?.label,
                available_amount: parseFloat(amount.replace(',', '.')),
            });

            navigation.goBack();
        } catch (error) {
            console.error('Error saving payment:', error);
            Alert.alert('Erro', 'Não foi possível salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nova Forma de Pagamento</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Payment Type Selection */}
                <Text style={styles.label}>Tipo de Pagamento *</Text>
                <View style={styles.typeGrid}>
                    {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.typeCard,
                                paymentType === key && styles.typeCardSelected,
                            ]}
                            onPress={() => {
                                setPaymentType(key);
                                setErrors((prev) => ({ ...prev, paymentType: null }));
                            }}
                        >
                            <Text style={styles.typeIcon}>
                                {key === 'cash' ? '💵' :
                                    key === 'pix' ? '📱' :
                                        key === 'ticket' ? '🎫' :
                                            key === 'paypal' ? '🅿️' : '💳'}
                            </Text>
                            <Text style={[
                                styles.typeLabel,
                                paymentType === key && styles.typeLabelSelected,
                            ]}>
                                {value.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors.paymentType && (
                    <Text style={styles.errorText}>{errors.paymentType}</Text>
                )}

                <Input
                    label="Nome/Descrição (opcional)"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Cartão Nubank"
                />

                <Input
                    label="Valor Disponível *"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    error={errors.amount}
                />

                <Button
                    title="Salvar"
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                />

                <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: '#1A237E',
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textMedium,
        marginBottom: 12,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
        marginBottom: 16,
    },
    typeCard: {
        width: '48%',
        marginHorizontal: '1%',
        marginBottom: 8,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.transparent,
    },
    typeCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    typeIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 14,
        color: colors.textMedium,
        textAlign: 'center',
    },
    typeLabelSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: -12,
        marginBottom: 16,
    },
    input: {
        marginTop: 8,
    },
    saveButton: {
        marginTop: 24,
        marginBottom: 12,
    },
});
