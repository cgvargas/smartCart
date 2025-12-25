/**
 * Profile Screen
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';

export default function ProfileScreen() {
    const { user, updateProfile, logout, loading } = useAuth();

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        alert_percentage: user?.alert_percentage || 80,
    });
    const [saving, setSaving] = useState(false);

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateProfile(formData);
        setSaving(false);

        if (result.success) {
            Alert.alert('Sucesso', 'Perfil atualizado!');
        } else {
            Alert.alert('Erro', result.error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* User Info */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                {/* Form */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Input
                                label="Nome"
                                value={formData.first_name}
                                onChangeText={(v) => updateField('first_name', v)}
                                placeholder="Seu nome"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Input
                                label="Sobrenome"
                                value={formData.last_name}
                                onChangeText={(v) => updateField('last_name', v)}
                                placeholder="Seu sobrenome"
                            />
                        </View>
                    </View>

                    <Input
                        label="Telefone"
                        value={formData.phone}
                        onChangeText={(v) => updateField('phone', v)}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Alert Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configurações de Alerta</Text>

                    <View style={styles.alertSetting}>
                        <Text style={styles.alertLabel}>
                            Alertar quando atingir do orçamento:
                        </Text>
                        <Text style={styles.alertValue}>{formData.alert_percentage}%</Text>
                    </View>

                    <View style={styles.sliderContainer}>
                        <Text style={styles.sliderLabel}>50%</Text>
                        <View style={styles.slider}>
                            {/* Note: @react-native-community/slider needs to be installed */}
                            {/* Using a simple view as placeholder */}
                            <View style={styles.sliderPlaceholder}>
                                <View
                                    style={[
                                        styles.sliderFill,
                                        { width: `${(formData.alert_percentage - 50) * 2}%` }
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={styles.sliderLabel}>100%</Text>
                    </View>

                    <Text style={styles.alertHint}>
                        Você receberá um alerta quando seus gastos atingirem {formData.alert_percentage}% do orçamento planejado.
                    </Text>
                </View>

                <Button
                    title="Salvar Alterações"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                />

                <Button
                    title="Sair da Conta"
                    variant="danger"
                    onPress={handleLogout}
                    loading={loading}
                    style={styles.logoutButton}
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
    header: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    email: {
        fontSize: 16,
        color: colors.textMedium,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -6,
    },
    halfInput: {
        flex: 1,
        paddingHorizontal: 6,
    },
    alertSetting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    alertLabel: {
        fontSize: 14,
        color: colors.textMedium,
    },
    alertValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    slider: {
        flex: 1,
        marginHorizontal: 12,
    },
    sliderLabel: {
        fontSize: 12,
        color: colors.textLight,
    },
    sliderPlaceholder: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    alertHint: {
        fontSize: 12,
        color: colors.textLight,
        fontStyle: 'italic',
    },
    saveButton: {
        marginTop: 16,
    },
    logoutButton: {
        marginTop: 12,
    },
});
