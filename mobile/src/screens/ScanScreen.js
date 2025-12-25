import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { extractTextFromImage } from '../services/ocr';
import { shoppingAPI } from '../services/api';

export default function ScanScreen({ navigation, route }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [priceType, setPriceType] = useState('varejo'); // 'varejo' or 'atacado'
    const [quantity, setQuantity] = useState('1');

    // Store detected prices from OCR
    const [detectedVarejoPrice, setDetectedVarejoPrice] = useState(null);
    const [detectedAtacadoPrice, setDetectedAtacadoPrice] = useState(null);
    const [detectedAtacadoQty, setDetectedAtacadoQty] = useState('1');

    // Price Intelligence
    const [priceComparison, setPriceComparison] = useState(null);
    const comparisonTimeout = useRef(null);

    const cameraRef = useRef(null);

    const { onAddItem } = route.params || {};

    // Auto-update price AND quantity when toggle changes
    useEffect(() => {
        if (priceType === 'varejo') {
            if (detectedVarejoPrice) {
                setProductPrice(detectedVarejoPrice.toString().replace('.', ','));
            }
            // Varejo default is usually 1, but user can change. 
            // We reset to 1 only if we are switching FROM atacado
            setQuantity('1');
        } else if (priceType === 'atacado') {
            if (detectedAtacadoPrice) {
                setProductPrice(detectedAtacadoPrice.toString().replace('.', ','));
            }
            // Atacado uses the detected pack quantity
            if (detectedAtacadoQty) {
                setQuantity(detectedAtacadoQty);
            }
        }
    }, [priceType, detectedVarejoPrice, detectedAtacadoPrice, detectedAtacadoQty]);

    // Price Intelligence Effect
    useEffect(() => {
        if (comparisonTimeout.current) clearTimeout(comparisonTimeout.current);
        setPriceComparison(null);

        if (productName && productName.length > 2) {
            comparisonTimeout.current = setTimeout(async () => {
                try {
                    const history = await shoppingAPI.getProductHistory(productName);
                    if (history && history.length > 0) {
                        setPriceComparison(history[0]);
                    }
                } catch (error) {
                    console.error('Error comparing prices:', error);
                }
            }, 500);
        }
    }, [productName]);

    const getComparisonBadge = () => {
        if (!priceComparison || !productPrice) return null;

        const currentPrice = parseFloat(productPrice.replace(',', '.') || 0);
        const lastPrice = parseFloat(priceComparison.price);

        if (currentPrice === 0) return null;

        const diffPercent = ((currentPrice - lastPrice) / lastPrice) * 100;

        let color = '#666';
        let text = `Último: R$ ${lastPrice.toFixed(2)}`;
        let icon = '📊';

        if (diffPercent < -5) {
            color = '#2E7D32'; // Green
            text = `Ótimo! R$ ${Math.abs(diffPercent).toFixed(0)}% mais barato que a última vez (R$ ${lastPrice.toFixed(2)})`;
            icon = '📉';
        } else if (diffPercent > 5) {
            color = '#C62828'; // Red
            text = `Caro! R$ ${diffPercent.toFixed(0)}% acima da última vez (R$ ${lastPrice.toFixed(2)})`;
            icon = '📈';
        } else {
            text = `Na média. Última vez pagou R$ ${lastPrice.toFixed(2)}`;
        }

        return (
            <View style={[styles.comparisonBadge, { backgroundColor: color + '20', borderColor: color }]}>
                <Text style={[styles.comparisonText, { color }]}>{icon} {text}</Text>
            </View>
        );
    };

    // Request permission
    if (!permission) {
        return <View style={styles.container}><Text style={styles.permissionText}>Carregando...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionBox}>
                    <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
                    <Text style={styles.permissionText}>
                        Precisamos de permissão para usar a câmera e escanear preços.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const cropImageToGuideBox = async (imageUri) => {
        try {
            // Get image dimensions first
            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [],
                { format: ImageManipulator.SaveFormat.JPEG }
            );

            const { width, height } = manipResult;

            // Crop to central 50% (guide box area)
            // This focuses on where user aimed the camera
            const cropWidth = width * 0.5;
            const cropHeight = height * 0.4;
            const originX = (width - cropWidth) / 2;
            const originY = (height - cropHeight) / 2;

            const croppedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [
                    {
                        crop: {
                            originX,
                            originY,
                            width: cropWidth,
                            height: cropHeight,
                        },
                    },
                ],
                { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG }
            );

            console.log('[CROP] Original:', width, 'x', height);
            console.log('[CROP] Cropped to central area:', cropWidth, 'x', cropHeight);
            return croppedImage.uri;
        } catch (error) {
            console.error('[CROP] Error cropping image:', error);
            return imageUri; // Return original if crop fails
        }
    };

    const processImage = async (photoUri) => {
        setProcessing(true);
        setShowModal(true);

        try {
            // Crop image to guide box area first
            console.log('[SCAN] Cropping image to guide box area...');
            const croppedUri = await cropImageToGuideBox(photoUri);

            // Extract text using OCR
            console.log('[SCAN] Sending to OCR...');
            const result = await extractTextFromImage(croppedUri);
            console.log('OCR Result:', result);

            // Auto-fill product name
            if (result.productName) {
                setProductName(result.productName);
            }

            // Auto-fill prices based on what was detected
            if (result.atacadoQty) {
                setDetectedAtacadoQty(result.atacadoQty.toString());
            }

            if (result.varejoPrice && result.atacadoPrice) {
                // Both prices detected - store both
                setDetectedVarejoPrice(result.varejoPrice);
                setDetectedAtacadoPrice(result.atacadoPrice);

                // Use varejo by default
                setPriceType('varejo');
                setProductPrice(result.varejoPrice.toString().replace('.', ','));
                setQuantity('1'); // Default Varejo is 1

                Alert.alert(
                    'Preços Detectados!',
                    `Varejo: R$ ${result.varejoPrice.toFixed(2)}\nAtacado: R$ ${result.atacadoPrice.toFixed(2)}\n\nVocê pode alternar entre varejo e atacado.`,
                    [{ text: 'OK' }]
                );
            } else if (result.varejoPrice) {
                setDetectedVarejoPrice(result.varejoPrice);
                setPriceType('varejo');
                setProductPrice(result.varejoPrice.toString().replace('.', ','));
                setQuantity('1'); // Default Varejo is 1
                Alert.alert('OCR', 'Preço varejo detectado!', [{ text: 'OK' }]);
            } else if (result.atacadoPrice) {
                setDetectedAtacadoPrice(result.atacadoPrice);
                setPriceType('atacado');
                setProductPrice(result.atacadoPrice.toString().replace('.', ','));
                if (result.atacadoQty) {
                    setQuantity(result.atacadoQty.toString());
                }
                Alert.alert('OCR', 'Preço atacado detectado!', [{ text: 'OK' }]);
            } else {
                Alert.alert(
                    'OCR',
                    'Não foi possível detectar preços. Insira manualmente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('OCR processing error:', error);
            Alert.alert(
                'Erro',
                'Erro ao processar imagem. Insira os dados manualmente.'
            );
        } finally {
            setProcessing(false);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            const photoResult = await cameraRef.current.takePictureAsync({
                quality: 0.3,  // Low quality for smaller file size (OCR needs <1MB)
                skipProcessing: false,
            });
            setPhoto(photoResult);
            await processImage(photoResult.uri);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.3,  // Low quality for smaller file size (OCR needs <1MB)
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
            await processImage(result.assets[0].uri);
        }
    };

    const addToList = () => {
        const unitPrice = parseFloat(productPrice.replace(',', '.'));
        const qty = parseInt(quantity) || 1;

        if (!productName || isNaN(unitPrice)) {
            Alert.alert('Erro', 'Preencha o nome e preço do produto');
            return;
        }

        // Calculate final price (always multiply by quantity)
        const finalPrice = unitPrice * qty;

        if (onAddItem) {
            onAddItem({
                name: `${productName}${qty > 1 ? ` (${qty}x)` : ''}`,
                price: finalPrice
            });
        }

        setShowModal(false);
        setProductName('');
        setProductPrice('');
        setPriceType('varejo');
        setQuantity('1');
        setPhoto(null);

        Alert.alert('Sucesso', 'Produto adicionado!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing="back"
            >
                {/* Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.closeButton}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Escanear Preço</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Guide Box */}
                    <View style={styles.guideContainer}>
                        <View style={styles.guideBox}>
                            <Text style={styles.guideText}>Posicione o preço aqui</Text>
                        </View>
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                            <Text style={styles.galleryButtonText}>Galeria</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        <View style={{ width: 70 }} />
                    </View>
                </View>
            </CameraView>

            {/* Add Product Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Produto</Text>

                        {processing && (
                            <View style={styles.processingContainer}>
                                <ActivityIndicator size="large" color="#1A237E" />
                                <Text style={styles.processingText}>Processando imagem...</Text>
                            </View>
                        )}

                        {!processing && (
                            <>
                                <Text style={styles.inputLabel}>Nome do Produto</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Arroz 5kg"
                                    value={productName}
                                    onChangeText={setProductName}
                                />
                                {getComparisonBadge()}

                                {/* Price Type Toggle */}
                                <Text style={styles.inputLabel}>Tipo de Preço</Text>
                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            priceType === 'varejo' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => setPriceType('varejo')}
                                    >
                                        <Text style={[
                                            styles.toggleButtonText,
                                            priceType === 'varejo' && styles.toggleButtonTextActive
                                        ]}>Varejo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            priceType === 'atacado' && styles.toggleButtonActive
                                        ]}
                                        onPress={() => setPriceType('atacado')}
                                    >
                                        <Text style={[
                                            styles.toggleButtonText,
                                            priceType === 'atacado' && styles.toggleButtonTextActive
                                        ]}>Atacado</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Price Input */}
                                <Text style={styles.inputLabel}>
                                    {priceType === 'atacado' ? 'Preço Unitário (R$)' : 'Preço (R$)'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 29,90"
                                    value={productPrice}
                                    onChangeText={setProductPrice}
                                    keyboardType="decimal-pad"
                                />

                                {/* Quantity - Always show */}
                                <Text style={styles.inputLabel}>
                                    {priceType === 'atacado' ? 'Quantidade (múltiplas unidades)' : 'Quantidade'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 1"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="number-pad"
                                />
                                <Text style={styles.totalText}>
                                    Total: R$ {(parseFloat(productPrice.replace(',', '.') || 0) * parseInt(quantity || 1)).toFixed(2)}
                                </Text>

                                <TouchableOpacity style={styles.addButton} onPress={addToList}>
                                    <Text style={styles.addButtonText}>Adicionar à Lista</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowModal(false);
                                        setPhoto(null);
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    closeButton: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    guideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideBox: {
        width: 280,
        height: 100,
        borderWidth: 2,
        borderColor: '#1A237E',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideText: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 40,
    },
    galleryButton: {
        width: 70,
        alignItems: 'center',
    },
    galleryButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 65,
        height: 65,
        borderRadius: 33,
        backgroundColor: '#fff',
    },
    permissionBox: {
        padding: 30,
        alignItems: 'center',
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    permissionText: {
        color: '#ccc',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
    },
    permissionButton: {
        backgroundColor: '#1A237E',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 15,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        paddingVertical: 10,
    },
    backButtonText: {
        color: '#999',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 15,
    },
    comparisonBadge: {
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 15,
        marginTop: -5,
    },
    comparisonText: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#1A237E',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        padding: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#999',
        fontSize: 14,
    },
    processingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    processingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    toggleButtonActive: {
        borderColor: '#1A237E',
        backgroundColor: '#E8F5E9',
    },
    toggleButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    toggleButtonTextActive: {
        color: '#1A237E',
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A237E',
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 10,
    },
});
