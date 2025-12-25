/**
 * Camera Screen
 * Capture product labels for OCR
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import colors from '../../styles/colors';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { SCREENS } from '../../utils/constants';

export default function CameraScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [capturing, setCapturing] = useState(false);
    const cameraRef = useRef(null);

    if (!permission) {
        return <Loading message="Verificando permissões..." />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionIcon}>📷</Text>
                <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
                <Text style={styles.permissionText}>
                    SmartCart precisa de acesso à câmera para escanear produtos.
                </Text>
                <Button
                    title="Permitir Acesso"
                    onPress={requestPermission}
                    style={styles.permissionButton}
                />
                <Button
                    title="Voltar"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                />
            </View>
        );
    }

    const takePicture = async () => {
        if (!cameraRef.current || capturing) return;

        setCapturing(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });

            // Navigate to product detail with image
            navigation.navigate(SCREENS.PRODUCT_DETAIL, {
                image: photo.uri,
                fromCamera: true,
            });
        } catch (error) {
            console.error('Error taking picture:', error);
            Alert.alert('Erro', 'Não foi possível capturar a imagem');
        } finally {
            setCapturing(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
            >
                {/* Guide overlay */}
                <View style={styles.overlay}>
                    <View style={styles.overlayTop} />
                    <View style={styles.overlayMiddle}>
                        <View style={styles.overlaySide} />
                        <View style={styles.scanArea}>
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                        <View style={styles.overlaySide} />
                    </View>
                    <View style={styles.overlayBottom}>
                        <Text style={styles.hint}>
                            Posicione a etiqueta de preço dentro da área
                        </Text>
                    </View>
                </View>
            </CameraView>

            {/* Capture button */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                    disabled={capturing}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>
            </View>

            {/* Loading overlay */}
            {capturing && (
                <View style={styles.loadingOverlay}>
                    <Loading message="Capturando..." />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: colors.background,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    permissionText: {
        fontSize: 16,
        color: colors.textLight,
        textAlign: 'center',
        marginBottom: 32,
    },
    permissionButton: {
        width: '100%',
        marginBottom: 12,
    },
    backButton: {
        width: '100%',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanArea: {
        width: 280,
        height: 180,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.white,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-start',
        paddingTop: 20,
        alignItems: 'center',
    },
    hint: {
        color: colors.white,
        fontSize: 14,
        textAlign: 'center',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.white,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
