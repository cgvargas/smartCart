/**
 * Alert Settings Screen
 * Configure budget alert threshold percentage and notifications
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import {
    areNotificationsEnabled,
    setNotificationsEnabled,
    sendTestNotification,
    requestNotificationPermissions,
} from '../../services/notifications';

export default function AlertSettingsScreen({ navigation }) {
    const { user, refreshUser } = useAuth();
    const [alertPercentage, setAlertPercentage] = useState(user?.alert_percentage || 80);
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [loading, setLoading] = useState(false);

    // Load notification preference on mount
    useEffect(() => {
        loadNotificationPreference();
    }, []);

    const loadNotificationPreference = async () => {
        const enabled = await areNotificationsEnabled();
        setNotificationsOn(enabled);
    };

    const toggleNotifications = async (value) => {
        if (value) {
            const granted = await requestNotificationPermissions();
            if (!granted) {
                Alert.alert(
                    'Permissão Necessária',
                    'Para receber alertas de orçamento, permita as notificações nas configurações do celular.'
                );
                return;
            }
        }
        setNotificationsOn(value);
        await setNotificationsEnabled(value);
    };

    const handleTestNotification = async () => {
        const granted = await requestNotificationPermissions();
        if (!granted) {
            Alert.alert('Erro', 'Permissão de notificação não concedida');
            return;
        }

        const sent = await sendTestNotification();
        if (!sent) {
            Alert.alert('Erro', 'Não foi possível enviar a notificação de teste');
        }
    };

    // Get color based on percentage
    const getPreviewColor = () => {
        if (alertPercentage >= 90) return colors.error;
        if (alertPercentage >= 75) return '#FF9800';
        return colors.primary;
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.patch('/accounts/profile/', {
                alert_percentage: alertPercentage,
            });

            if (refreshUser) {
                await refreshUser();
            }

            Alert.alert(
                'Sucesso',
                `Alerta configurado para ${alertPercentage}% do orçamento!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error saving alert settings:', error);
            Alert.alert('Erro', 'Não foi possível salvar as configurações.');
        } finally {
            setLoading(false);
        }
    };

    const percentageOptions = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Notifications Toggle */}
                <View style={styles.notificationCard}>
                    <View style={styles.notificationRow}>
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>🔔 Push Notifications</Text>
                            <Text style={styles.notificationDesc}>
                                Receba alertas durante as compras
                            </Text>
                        </View>
                        <Switch
                            value={notificationsOn}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#ddd', true: colors.primaryLight }}
                            thumbColor={notificationsOn ? colors.primary : '#999'}
                        />
                    </View>

                    {notificationsOn && (
                        <TouchableOpacity
                            style={styles.testButton}
                            onPress={handleTestNotification}
                        >
                            <Text style={styles.testButtonText}>📲 Testar Notificação</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>⚠️</Text>
                    <Text style={styles.infoTitle}>Alerta de Orçamento</Text>
                    <Text style={styles.infoText}>
                        Configure o percentual do orçamento em que você deseja
                        receber um alerta durante suas compras.
                    </Text>
                </View>

                {/* Current Value Display */}
                <View style={[styles.valueCard, { borderColor: getPreviewColor() }]}>
                    <Text style={styles.valueLabel}>Alertar quando atingir</Text>
                    <Text style={[styles.valueNumber, { color: getPreviewColor() }]}>
                        {alertPercentage}%
                    </Text>
                    <Text style={styles.valueSublabel}>do orçamento</Text>
                </View>

                {/* Percentage Options Grid */}
                <Text style={styles.optionsLabel}>Selecione o percentual</Text>
                <View style={styles.optionsGrid}>
                    {percentageOptions.map((value) => (
                        <TouchableOpacity
                            key={value}
                            style={[
                                styles.optionButton,
                                alertPercentage === value && styles.optionButtonActive,
                                alertPercentage === value && { borderColor: getPreviewColor(), backgroundColor: getPreviewColor() + '20' },
                            ]}
                            onPress={() => setAlertPercentage(value)}
                        >
                            <Text style={[
                                styles.optionText,
                                alertPercentage === value && styles.optionTextActive,
                                alertPercentage === value && { color: getPreviewColor() },
                            ]}>
                                {value}%
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Preview */}
                <View style={styles.preview}>
                    <Text style={styles.previewTitle}>📊 Exemplo</Text>
                    <Text style={styles.previewText}>
                        Se seu orçamento é <Text style={styles.previewBold}>R$ 500,00</Text>,
                        {'\n'}você será alertado ao gastar{' '}
                        <Text style={[styles.previewBold, { color: getPreviewColor() }]}>
                            R$ {(500 * alertPercentage / 100).toFixed(2)}
                        </Text>
                    </Text>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <Button
                    title="Salvar Configuração"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    notificationCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificationInfo: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    notificationDesc: {
        fontSize: 13,
        color: colors.textLight,
        marginTop: 2,
    },
    testButton: {
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        alignItems: 'center',
    },
    testButtonText: {
        color: colors.primary,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#FFF3E0',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    infoIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    valueCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 3,
    },
    valueLabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    valueNumber: {
        fontSize: 56,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    valueSublabel: {
        fontSize: 14,
        color: colors.textLight,
    },
    optionsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMedium,
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    optionButton: {
        width: '18%',
        paddingVertical: 14,
        backgroundColor: colors.white,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    optionButtonActive: {
        borderWidth: 2,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    optionTextActive: {
        fontWeight: 'bold',
    },
    preview: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMedium,
        marginBottom: 8,
    },
    previewText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    previewBold: {
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
    },
});
