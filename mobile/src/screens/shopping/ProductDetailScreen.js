/**
 * Product Detail Screen
 * Add/Edit product in shopping list
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { useShopping } from '../../context/ShoppingContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import ocrService from '../../services/ocr';
import { formatCurrency } from '../../utils/formatters';

export default function ProductDetailScreen({ route, navigation }) {
    const { item, image, fromCamera } = route.params || {};
    const { activeList, addItem, updateItem } = useShopping();

    const [loading, setLoading] = useState(false);
    const [processingOCR, setProcessingOCR] = useState(false);
    const [formData, setFormData] = useState({
        name: item?.name || '',
        unit_price: item?.unit_price?.toString() || '',
        quantity: item?.quantity?.toString() || '1',
        notes: item?.notes || '',
    });
    const [errors, setErrors] = useState({});

    // Process OCR if coming from camera
    useEffect(() => {
        if (fromCamera && image) {
            processImage();
        }
    }, [fromCamera, image]);

    const processImage = async () => {
        setProcessingOCR(true);
        try {
            const result = await ocrService.extractText(image);

            if (result.productName) {
                setFormData((prev) => ({
                    ...prev,
                    name: result.productName,
                }));
            }

            if (result.price) {
                setFormData((prev) => ({
                    ...prev,
                    unit_price: result.price.toString(),
                }));
            }

            if (result.confidence === 'low') {
                Alert.alert(
                    'OCR',
                    'Não foi possível identificar todos os dados. Por favor, verifique e complete as informações.'
                );
            }
        } catch (error) {
            console.error('OCR Error:', error);
            Alert.alert('Erro', 'Não foi possível processar a imagem');
        } finally {
            setProcessingOCR(false);
        }
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
            newErrors.unit_price = 'Preço deve ser maior que zero';
        }

        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            newErrors.quantity = 'Quantidade deve ser maior que zero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (!activeList) {
            Alert.alert('Erro', 'Nenhuma lista ativa');
            return;
        }

        setLoading(true);

        const data = {
            name: formData.name.trim(),
            unit_price: parseFloat(formData.unit_price.replace(',', '.')),
            quantity: parseFloat(formData.quantity.replace(',', '.')),
            notes: formData.notes,
        };

        let result;
        if (item) {
            result = await updateItem(activeList.id, item.id, data);
        } else {
            result = await addItem(activeList.id, data);
        }

        setLoading(false);

        if (result.success) {
            navigation.goBack();
        } else {
            Alert.alert('Erro', result.error);
        }
    };

    // Calculate subtotal
    const subtotal =
        (parseFloat(formData.unit_price.replace(',', '.')) || 0) *
        (parseFloat(formData.quantity.replace(',', '.')) || 0);

    if (processingOCR) {
        return <Loading message="Processando imagem..." />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Image preview */}
                {image && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.image} />
                    </View>
                )}

                {/* Form */}
                <Input
                    label="Nome do produto *"
                    value={formData.name}
                    onChangeText={(v) => updateField('name', v)}
                    placeholder="Ex: Arroz 5kg"
                    error={errors.name}
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Input
                            label="Preço unitário *"
                            value={formData.unit_price}
                            onChangeText={(v) => updateField('unit_price', v)}
                            placeholder="0,00"
                            keyboardType="decimal-pad"
                            error={errors.unit_price}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Input
                            label="Quantidade *"
                            value={formData.quantity}
                            onChangeText={(v) => updateField('quantity', v)}
                            placeholder="1"
                            keyboardType="decimal-pad"
                            error={errors.quantity}
                        />
                    </View>
                </View>

                {/* Subtotal */}
                <View style={styles.subtotalContainer}>
                    <Text style={styles.subtotalLabel}>Subtotal:</Text>
                    <Text style={styles.subtotalValue}>{formatCurrency(subtotal)}</Text>
                </View>

                <Input
                    label="Observações"
                    value={formData.notes}
                    onChangeText={(v) => updateField('notes', v)}
                    placeholder="Notas adicionais..."
                    multiline
                    numberOfLines={3}
                />

                <Button
                    title={item ? 'Salvar Alterações' : 'Adicionar à Lista'}
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                />

                <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={styles.cancelButton}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 200,
        height: 150,
        borderRadius: 12,
        backgroundColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -6,
    },
    halfInput: {
        flex: 1,
        paddingHorizontal: 6,
    },
    subtotalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    subtotalLabel: {
        fontSize: 16,
        color: colors.textMedium,
    },
    subtotalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    saveButton: {
        marginTop: 16,
    },
    cancelButton: {
        marginTop: 8,
    },
});
