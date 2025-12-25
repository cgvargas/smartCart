import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../styles/colors';

export default function TermsScreen({ navigation }) {
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
                <Text style={styles.headerTitle}>Termos de Uso</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
                <Text style={styles.text}>
                    Ao acessar e usar o aplicativo SmartCart, você concorda em cumprir estes termos de uso.
                    Se você não concordar com algum destes termos, por favor, não use o aplicativo.
                </Text>

                <Text style={styles.sectionTitle}>2. Uso do Aplicativo</Text>
                <Text style={styles.text}>
                    O SmartCart é uma ferramenta para gerenciamento de listas de compras e controle de orçamento.
                    Você é responsável por manter a confidencialidade de sua conta e senha.
                </Text>

                <Text style={styles.sectionTitle}>3. Propriedade Intelectual</Text>
                <Text style={styles.text}>
                    Todo o conteúdo, design e funcionalidade deste aplicativo são de propriedade exclusiva da CGVargas Informática.
                    A reprodução não autorizada é proibida.
                </Text>

                <Text style={styles.sectionTitle}>4. Limitação de Responsabilidade</Text>
                <Text style={styles.text}>
                    O SmartCart é fornecido "como está". Não garantimos que o aplicativo estará livre de erros
                    ou que funcionará ininterruptamente.
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
