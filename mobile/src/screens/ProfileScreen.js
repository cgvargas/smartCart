import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/formatters';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: logout, style: 'destructive' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <View style={styles.avatar}>
                    {user?.avatar ? (
                        <Image source={{ uri: resolveImageUrl(user.avatar) }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>
                            {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
                        </Text>
                    )}
                </View>
                <Text style={styles.name}>
                    {user?.first_name} {user?.last_name}
                </Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configurações</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={styles.menuText}>Editar Perfil</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Payments')}
                    >
                        <Text style={styles.menuText}>Formas de Pagamento</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('AlertSettings')}
                    >
                        <View style={styles.menuItemContent}>
                            <Text style={styles.menuText}>Alertas de Orçamento</Text>
                            <Text style={styles.menuSubtext}>
                                Aviso em {user?.alert_percentage || 80}%
                            </Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Terms')}
                    >
                        <Text style={styles.menuText}>Termos de Uso</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Privacy')}
                    >
                        <Text style={styles.menuText}>Política de Privacidade</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>

                <Text style={styles.version}>SmartCart v1.0.0</Text>
            </View>
        </View >
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
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    menuItemContent: {
        flex: 1,
    },
    menuSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    menuArrow: {
        fontSize: 20,
        color: '#ccc',
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutText: {
        color: '#f44336',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 20,
    },
});
