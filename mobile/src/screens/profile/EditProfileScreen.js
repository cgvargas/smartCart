import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActionSheetIOS,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import { resolveImageUrl } from '../../utils/formatters';

export default function EditProfileScreen({ navigation }) {
    const { user, updateUser } = useAuth(); // Assuming updateUser exists in context, if not I'll just reload
    const insets = useSafeAreaInsets();

    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [image, setImage] = useState(null); // { uri: string }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
                }
                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus.status !== 'granted') {
                    Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua câmera.');
                }
            }
        })();
    }, []);

    const pickImage = async (useCamera = false) => {
        let result;
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        };

        try {
            if (useCamera) {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled) {
                setImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const handleSelectImage = () => {
        Alert.alert(
            'Alterar Foto',
            'Escolha uma opção',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Tirar Foto', onPress: () => pickImage(true) },
                { text: 'Escolher da Galeria', onPress: () => pickImage(false) },
            ]
        );
    };

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Erro', 'Nome e Sobrenome são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const data = {
                first_name: firstName,
                last_name: lastName,
                // email is usually read-only or requires re-auth, keeping it here just in case backend allows
            };

            const updatedUser = await authAPI.updateProfile(data, image);

            // Refresh user data in context
            if (updateUser) {
                await updateUser();
            }

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil');
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
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={handleSelectImage} style={styles.avatarButton}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.avatar} />
                        ) : user?.avatar ? (
                            <Image source={{ uri: resolveImageUrl(user.avatar) }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.placeholderText}>
                                    {firstName?.[0] || 'U'}{lastName?.[0] || ''}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraIconContainer}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Toque para alterar</Text>
                </View>

                <Input
                    label="Nome"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Seu nome"
                />

                <Input
                    label="Sobrenome"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Seu sobrenome"
                />

                <Input
                    label="Email"
                    value={email}
                    editable={false}
                    style={{ opacity: 0.6 }}
                />

                <Button
                    title="Salvar Alterações"
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
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
        padding: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarButton: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E8EAF6',
    },
    placeholderText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#1A237E',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1A237E',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    cameraIcon: {
        fontSize: 16,
        color: '#fff',
    },
    changePhotoText: {
        marginTop: 10,
        color: '#1A237E',
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#1A237E',
    },
});
