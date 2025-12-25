/**
 * Login Screen
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import { SCREENS } from '../../utils/constants';
import { isValidEmail } from '../../utils/validators';

export default function LoginScreen({ navigation }) {
    const { login, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Email inválido';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        const result = await login(email, password);

        if (!result.success) {
            setErrors({ general: result.error });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo/Title */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🛒</Text>
                    <Text style={styles.title}>SmartCart</Text>
                    <Text style={styles.subtitle}>Controle suas compras de forma inteligente</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {errors.general && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorBoxText}>{errors.general}</Text>
                        </View>
                    )}

                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="seu@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Sua senha"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Button
                        title="Entrar"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate(SCREENS.REGISTER)}
                    >
                        <Text style={styles.registerText}>
                            Não tem conta? <Text style={styles.registerTextBold}>Cadastre-se</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    errorBox: {
        backgroundColor: colors.error + '20',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorBoxText: {
        color: colors.error,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 8,
    },
    registerLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    registerText: {
        color: colors.textMedium,
        fontSize: 15,
    },
    registerTextBold: {
        color: colors.primary,
        fontWeight: '600',
    },
});
