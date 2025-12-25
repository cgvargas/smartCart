import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

export default function PrivacyScreen({ navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Política de Privacidade</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>1. Coleta de Dados</Text>
                <Text style={styles.text}>
                    O SmartCart coleta apenas os dados necessários para o funcionamento do aplicativo, como seu nome,
                    email e listas de compras. As imagens de perfil são armazenadas com segurança.
                </Text>

                <Text style={styles.sectionTitle}>2. Uso das Informações</Text>
                <Text style={styles.text}>
                    Utilizamos suas informações para personalizar sua experiência, gerenciar suas compras e
                    enviar alertas de orçamento. Não compartilhamos seus dados com terceiros.
                </Text>

                <Text style={styles.sectionTitle}>3. Permissões do Dispositivo</Text>
                <Text style={styles.text}>
                    O aplicativo pode solicitar acesso à câmera e galeria para upload de foto de perfil e
                    scanner de código de barras. O acesso é estritamente para estas finalidades.
                </Text>

                <Text style={styles.sectionTitle}>4. Segurança</Text>
                <Text style={styles.text}>
                    Adotamos medidas de segurança para proteger seus dados contra acesso não autorizado.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.copyrightText}>
                        Idealizado e criado pela
                    </Text>
                    <Text style={styles.companyName}>
                        CGVargas Informática
                    </Text>
                    <Text style={styles.year}>© 2025</Text>
                </View>
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
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
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        textAlign: 'justify',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    copyrightText: {
        fontSize: 14,
        color: '#666',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        marginTop: 4,
    },
    year: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
});
