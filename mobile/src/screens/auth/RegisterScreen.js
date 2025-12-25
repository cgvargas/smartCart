/**
 * Register Screen
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
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import { SCREENS } from '../../utils/constants';
import { isValidEmail, validatePassword } from '../../utils/validators';

export default function RegisterScreen({ navigation }) {
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
    });
    const [errors, setErrors] = useState({});

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Username deve ter pelo menos 3 caracteres';
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors[0];
        }

        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Senhas não conferem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        const result = await register(formData);

        if (result.success) {
            Alert.alert(
                'Sucesso!',
                'Conta criada com sucesso. Faça login para continuar.',
                [{ text: 'OK', onPress: () => navigation.navigate(SCREENS.LOGIN) }]
            );
        } else {
            setErrors(result.errors);
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
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Input
                                label="Nome"
                                value={formData.first_name}
                                onChangeText={(v) => updateField('first_name', v)}
                                placeholder="João"
                                error={errors.first_name}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Input
                                label="Sobrenome"
                                value={formData.last_name}
                                onChangeText={(v) => updateField('last_name', v)}
                                placeholder="Silva"
                                error={errors.last_name}
                            />
                        </View>
                    </View>

                    <Input
                        label="Email *"
                        value={formData.email}
                        onChangeText={(v) => updateField('email', v)}
                        placeholder="seu@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="Username *"
                        value={formData.username}
                        onChangeText={(v) => updateField('username', v)}
                        placeholder="joaosilva"
                        autoCapitalize="none"
                        error={errors.username}
                    />

                    <Input
                        label="Senha *"
                        value={formData.password}
                        onChangeText={(v) => updateField('password', v)}
                        placeholder="Mínimo 8 caracteres"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Input
                        label="Confirmar Senha *"
                        value={formData.password_confirm}
                        onChangeText={(v) => updateField('password_confirm', v)}
                        placeholder="Repita a senha"
                        secureTextEntry
                        error={errors.password_confirm}
                    />

                    <Button
                        title="Criar Conta"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                    />

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate(SCREENS.LOGIN)}
                    >
                        <Text style={styles.loginText}>
                            Já tem conta? <Text style={styles.loginTextBold}>Entrar</Text>
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
        padding: 24,
    },
    header: {
        marginTop: 40,
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -6,
    },
    halfInput: {
        flex: 1,
        paddingHorizontal: 6,
    },
    registerButton: {
        marginTop: 8,
    },
    loginLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    loginText: {
        color: colors.textMedium,
        fontSize: 15,
    },
    loginTextBold: {
        color: colors.primary,
        fontWeight: '600',
    },
});
