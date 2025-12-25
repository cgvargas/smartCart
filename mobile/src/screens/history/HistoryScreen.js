/**
 * History Screen
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shoppingAPI } from '../../services/api';
import colors from '../../styles/colors';

export default function HistoryScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        try {
            const data = await shoppingAPI.getHistory();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const handleDuplicate = async (item) => {
        Alert.alert(
            'Duplicar Lista',
            `Criar nova lista baseada em "${item.name || 'Compras'}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Duplicar',
                    onPress: async () => {
                        try {
                            await shoppingAPI.duplicateList(item.id);
                            Alert.alert('Sucesso', 'Lista duplicada!');
                            navigation.navigate('Shopping');
                        } catch (error) {
                            console.error('Error duplicating:', error);
                            Alert.alert('Erro', 'Não foi possível duplicar');
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async (item) => {
        Alert.alert(
            'Excluir Lista',
            `Tem certeza que deseja apagar "${item.name || 'Compras'}"? Isso não pode ser desfeito.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await shoppingAPI.deleteList(item.id);
                            // Optimistic update or reload
                            setHistory(prev => prev.filter(i => i.id !== item.id));
                            Alert.alert('Sucesso', 'Lista excluída!');
                        } catch (error) {
                            console.error('Error deleting:', error);
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatCurrency = (value) => {
        return `R$ ${parseFloat(value).toFixed(2)}`;
    };

    // Rename State
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renamingItem, setRenamingItem] = useState(null);
    const [newName, setNewName] = useState('');

    const handleRename = (item) => {
        setRenamingItem(item);
        setNewName(item.name);
        setShowRenameModal(true);
    };

    const confirmRename = async () => {
        if (!newName.trim()) {
            Alert.alert('Erro', 'O nome não pode ser vazio');
            return;
        }

        try {
            await shoppingAPI.updateList(renamingItem.id, { name: newName });

            // Local update
            setHistory(prev => prev.map(i =>
                i.id === renamingItem.id ? { ...i, name: newName } : i
            ));

            setShowRenameModal(false);
            setRenamingItem(null);
        } catch (error) {
            console.error('Error renaming:', error);
            Alert.alert('Erro', 'Não foi possível alterar o nome');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>
                    {item.completed_at ? formatDate(item.completed_at) : formatDate(item.created_at)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={() => handleRename(item)} hitSlop={10}>
                        <Text style={{ fontSize: 18 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10}>
                        <Text style={{ fontSize: 18, color: colors.error }}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.cardName}>{item.name || 'Compras'}</Text>

            <View style={styles.cardInfo}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Total:</Text>
                    <Text style={styles.infoValue}>{formatCurrency(item.total_spent)}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Itens:</Text>
                    <Text style={styles.infoValue}>{item.items_count || 0}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>% Usado:</Text>
                    <Text style={styles.infoValue}>{item.budget_percentage?.toFixed(1) || '0'}%</Text>
                </View>
            </View>

            {item.receipt_pdf && (
                <TouchableOpacity
                    style={[styles.duplicateButton, { backgroundColor: colors.secondary, marginBottom: 8 }]}
                    onPress={() => {
                        // Open PDF in browser/native viewer
                        const url = item.receipt_pdf.startsWith('http') ? item.receipt_pdf : `http://192.168.1.3:8000${item.receipt_pdf}`;
                        import('react-native').then(({ Linking }) => Linking.openURL(url));
                    }}
                >
                    <Text style={[styles.duplicateText, { color: '#fff' }]}>📄 Ver Nota Fiscal</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.duplicateButton}
                onPress={() => handleDuplicate(item)}
            >
                <Text style={styles.duplicateText}>📋 Usar como base</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Histórico</Text>
                        <Text style={styles.headerSubtitle}>Suas compras finalizadas</Text>
                    </View>
                    <View style={styles.headerSpacer} />
                </View>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>Nenhum histórico</Text>
                        <Text style={styles.emptyText}>
                            Suas compras finalizadas aparecerão aqui
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            <Modal
                visible={showRenameModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRenameModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Renomear Lista</Text>

                        <TextInput
                            style={styles.input}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Nome da lista"
                            autoFocus={true}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowRenameModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmRename}
                            >
                                <Text style={styles.confirmButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#1A237E',
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 16,
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
    headerContent: {
        flex: 1,
    },
    headerSpacer: {
        width: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardDate: {
        fontSize: 14,
        color: colors.textLight,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        color: colors.white,
        fontWeight: '600',
    },
    cardName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoItem: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 11,
        color: colors.textLight,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    duplicateButton: {
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    duplicateText: {
        color: colors.primary,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
