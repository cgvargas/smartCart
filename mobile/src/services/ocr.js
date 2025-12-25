/**
 * OCR Service - Text recognition from images
 * Uses OCR.space free API
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// Free API key from OCR.space
const OCR_API_KEY = 'K85803127688957';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Extract text from image using OCR
 * Specifically designed for Brazilian price labels
 */
export async function extractTextFromImage(imageUri) {
    try {
        console.log('[OCR] Starting OCR for:', imageUri);

        // Read image as base64
        console.log('[OCR] Reading image file...');
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });
        console.log('[OCR] Image read successfully, size:', base64.length, 'chars');

        // Call OCR API
        const formData = new FormData();
        formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
        formData.append('language', 'por');
        formData.append('isOverlayRequired', 'false');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');
        formData.append('detectOrientation', 'true');

        console.log('[OCR] Calling OCR API...');

        const ocrResponse = await fetch(OCR_API_URL, {
            method: 'POST',
            headers: {
                'apikey': OCR_API_KEY,
            },
            body: formData,
        });

        console.log('[OCR] API response status:', ocrResponse.status);
        const result = await ocrResponse.json();
        console.log('[OCR] API Response:', JSON.stringify(result, null, 2));

        // Check for API errors
        if (result.IsErroredOnProcessing) {
            console.error('[OCR] API Error:', result.ErrorMessage);
            Alert.alert('Erro OCR', `API Error: ${result.ErrorMessage.join(', ')}`);
            return {
                text: '',
                productName: null,
                varejoPrice: null,
                atacadoPrice: null,
                atacadoQty: null
            };
        }

        if (result.ParsedResults && result.ParsedResults.length > 0) {
            const text = result.ParsedResults[0].ParsedText || '';
            console.log('[OCR] Extracted Text:', text);
            console.log('[OCR] Text length:', text.length);

            if (!text || text.trim().length === 0) {
                console.log('[OCR] Empty text detected');
                Alert.alert('OCR', 'Nenhum texto detectado na imagem. Tente tirar outra foto com melhor iluminação.');
                return {
                    text: '',
                    productName: null,
                    varejoPrice: null,
                    atacadoPrice: null,
                    atacadoQty: null
                };
            }

            // Extract data for Brazilian labels
            const extracted = extractBrazilianLabelData(text);
            console.log('[OCR] Extracted Data:', JSON.stringify(extracted));

            return {
                text: text,
                ...extracted
            };
        }

        console.log('[OCR] No OCR results found in response');
        Alert.alert('OCR', 'Não foi possível processar a imagem. Tente novamente.');
        return {
            text: '',
            productName: null,
            varejoPrice: null,
            atacadoPrice: null,
            atacadoQty: null
        };
    } catch (error) {
        console.error('[OCR] Error:', error);
        console.error('[OCR] Error stack:', error.stack);
        Alert.alert('Erro', `Erro ao processar OCR: ${error.message}`);
        return {
            text: '',
            productName: null,
            varejoPrice: null,
            atacadoPrice: null,
            atacadoQty: null
        };
    }
}

/**
 * Extract data specifically for Brazilian supermarket labels
 * Format: ARROZ TIPO1 CAMIL 5KG
 *         Varejo R$ 12,49
 *         Atacado R$ 9,99 UN | R$ 59,94
 */
function extractBrazilianLabelData(text) {
    console.log('[OCR] Starting Brazilian label extraction...');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log('[OCR] Lines found:', lines.length);
    lines.forEach((line, i) => console.log(`[OCR]   Line ${i}: "${line}"`));

    let productName = null;
    let varejoPrice = null;
    let atacadoPrice = null;
    let atacadoQty = null;

    // STEP 1: Find Varejo and Atacado lines FIRST
    let varejoLineIndex = -1;
    let atacadoLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        // Handle OCR typos: Varajo->Varejo, Varelo->Varejo
        if (lines[i].match(/var[ae][jl]o/i) && varejoLineIndex === -1) {
            varejoLineIndex = i;
            console.log('[OCR] Found Varejo keyword at line', i);
        }
        if (lines[i].match(/atacado/i) && atacadoLineIndex === -1) {
            atacadoLineIndex = i;
            console.log('[OCR] Found Atacado keyword at line', i);
        }
    }

    // STEP 2: Extract product name (look BEFORE varejo/atacado or find all-caps line)
    const searchUntilLine = varejoLineIndex !== -1 ? varejoLineIndex :
        atacadoLineIndex !== -1 ? atacadoLineIndex :
            lines.length;

    // Score each line for being a product name
    let bestScore = 0;
    let bestLine = null;

    for (let i = 0; i < Math.min(searchUntilLine, 15); i++) {
        const line = lines[i];

        // Skip obvious non-product lines
        if (line.match(/^\d{2}\/\d{2}\/\d{4}/)) continue;  // Date
        if (line.match(/^FD\s*C?\/?/i)) continue;           // FD codes
        if (line.match(/var[ae][jl]o|atacado/i)) continue;  // Price type (with typo tolerance)
        if (line.match(/leve.*pague/i)) continue;           // Promotions
        if (line.match(/^R?\$?\s*\d+[,\.]\d{2}$/)) continue; // Just a price
        if (line.match(/^\d{5,}$/)) continue;               // Just numbers (barcodes)
        if (line.length < 5) continue;                      // Too short

        // CRITICAL: Skip test/template labels
        if (line.match(/teste|ettoleta|etioleta|procuto|produto\s+teste/i)) {
            console.log(`[OCR] SKIPPING test label: "${line}"`);
            continue;
        }
        if (line.match(/nome\s+do\s+seu|seu\s+produto|cartaz.*splash/i)) {
            console.log(`[OCR] SKIPPING template: "${line}"`);
            continue;
        }

        // Calculate score
        let score = 0;

        // Prefer ALL CAPS lines (product names are usually all caps)
        if (line === line.toUpperCase() && line.match(/[A-Z]/)) {
            score += 50;
        }

        // Prefer longer lines (product names have brand + type + weight)
        score += line.length;

        // Penalize lines with special chars or codes
        if (line.match(/[<>{}[\]()]/)) score -= 30;
        if (line.match(/\d{6,}/)) score -= 20; // Long numbers (codes)

        // STRONG PENALTY for garbage/code-like lines
        if (line.match(/[•·=|]/)) score -= 100;  // Bullets and special symbols
        if (line.match(/^\d+\s*[•·=]/)) score -= 100; // Starts with number and special char
        if (line.match(/[A-Z]\d+[A-Z]/i)) score -= 50; // Alphanumeric codes like NTI01B
        if (line.match(/^[\d\s•·=\-_|]+$/)) score -= 100; // Just numbers and symbols
        if (line.match(/settings|shift|ctrl|fn\b/i)) score -= 200; // Keyboard/app text
        if (line.match(/antigravity|google|chrome/i)) score -= 200; // App names

        // BOOST if contains common product words
        if (line.match(/kg|kilo|g\b|ml|lt?\b/i)) score += 30;
        if (line.match(/tipo\d+|tipo\s+\d+/i)) score += 40;
        if (line.match(/fd\d+|fd\s+\d+/i)) score += 20;
        if (line.match(/unidade|un\b|pct|pct\b|pacote/i)) score += 20;

        // MEGA BOOST for real products and brands
        if (line.match(/arroz|feijao|feijão|macarrao|macarrão|leite/i)) score += 100;
        if (line.match(/camil|tio\s+joao|tio\s+joão|yoki|nestle/i)) score += 100;
        if (line.match(/sadia|perdigao|perdigão|seara|aurora/i)) score += 100;

        // MEGA BOOST for fruits/vegetables (hortifruit)
        if (line.match(/mamao|papaya|banana|laranja|maça|maca|limao|limão/i)) score += 100;
        if (line.match(/tomate|cebola|batata|cenoura|alface|repolho/i)) score += 100;
        if (line.match(/melancia|melao|melão|abacaxi|uva|manga|morango/i)) score += 100;
        if (line.match(/alho|pimentao|pimentão|pepino|abobrinha/i)) score += 100;

        console.log(`[OCR] Line ${i} "${line}" score: ${score}`);

        if (score > bestScore) {
            bestScore = score;
            bestLine = line;
        }
    }

    if (bestLine) {
        productName = bestLine
            .replace(/^\d+\s+/, '') // Remove leading numbers
            .trim();

        // Capitalize first letter of each word
        productName = productName
            .split(' ')
            .map(word => {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
        console.log('[OCR] Best product name:', productName, 'with score:', bestScore);
    }

    // STEP 3: Find Varejo price (look near "Varejo" keyword or after product name)
    // Also check for TOTAL (common in weight/scale labels)
    let totalPrice = null;

    for (const line of lines) {
        if (line.match(/total/i)) {
            console.log('[OCR] Found TOTAL line (scale label):', line);
            const priceMatch = line.match(/R?\$?\s*(\d+)[,\.](\d{2})/i);
            if (priceMatch) {
                totalPrice = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
                console.log('[OCR] Total price from scale:', totalPrice);
                break;
            }
        }
    }

    // If TOTAL was found (scale label), use it as varejo price
    if (totalPrice) {
        varejoPrice = totalPrice;
    } else if (varejoLineIndex !== -1) {
        // Search a few lines after "Varejo" keyword
        for (let i = varejoLineIndex; i < Math.min(varejoLineIndex + 3, lines.length); i++) {
            const line = lines[i];
            console.log('[OCR] Checking varejo line:', line);
            const priceMatch = line.match(/R?\$?\s*(\d+)[,\.](\d{2})/i);
            if (priceMatch) {
                varejoPrice = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
                console.log('[OCR] Varejo price found:', varejoPrice);
                break;
            }
        }
    }

    // STEP 4: Find Atacado price and quantity
    if (atacadoLineIndex !== -1) {
        const atacadoCandidates = [];

        // Search around "Atacado" keyword
        for (let i = atacadoLineIndex; i < Math.min(atacadoLineIndex + 4, lines.length); i++) {
            const line = lines[i];
            console.log('[OCR] Checking atacado line:', line);

            // Strategy A: Look for explicit price
            const priceMatch = line.match(/R?\$?\s*(\d+)[,\.](\d{2})/i);

            if (priceMatch) {
                const price = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
                // Sanity check: Price should be somewhat reasonable (e.g. > 0.05)
                if (price > 0.05) {
                    atacadoCandidates.push(price);
                }
            }
        }

        if (atacadoCandidates.length > 0) {
            // Pick the LOWEST price found in the Atacado section
            // This avoids picking the "Total Pack Price" (e.g. R$ 59,94) instead of Unit Price (R$ 9,99)
            atacadoPrice = Math.min(...atacadoCandidates);
            console.log('[OCR] Atacado candidates:', atacadoCandidates);
            console.log('[OCR] Selected lowest as Atacado Price:', atacadoPrice);
        }
    }

    // Secondary Search: Look for "A partir de" or "Leve X"
    if (!atacadoPrice) {
        for (const line of lines) {
            if (line.match(/a\s+partir|levena|leve\s+\d+|atc|atac/i)) {
                const priceMatch = line.match(/R?\$?\s*(\d+)[,\.](\d{2})/i);
                if (priceMatch) {
                    atacadoPrice = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
                    console.log('[OCR] Atacado price found (Strategy B):', atacadoPrice);
                    break;
                }
            }
        }
    }

    // Quantity Extraction (Refined)
    for (const line of lines) {
        // "A partir de 3 un" or "Leve 3" or "3 un"
        const qtyMatch = line.match(/(?:partir\s+de|leve|c\/|cx|fd)\s*(\d+)|(\d+)\s*(?:un|cx|fd)/i);
        if (qtyMatch) {
            const qty = parseInt(qtyMatch[1] || qtyMatch[2]);
            if (qty > 1 && qty < 100) { // Reasonable limits
                atacadoQty = qty;
                console.log('[OCR] Atacado quantity found:', atacadoQty);
                break;
            }
        }
    }

    // STEP 5: Fallback - if no varejo/atacado found, find closest prices to product name
    if (!varejoPrice && !atacadoPrice && bestLine) {
        console.log('[OCR] No varejo/atacado keywords, looking for prices near product...');
        const allPrices = [];
        for (const line of lines) {
            const matches = line.matchAll(/R?\$?\s*(\d+)[,\.](\d{2})/gi);
            for (const match of matches) {
                const price = parseFloat(`${match[1]}.${match[2]}`);
                if (price > 0 && price < 10000) {
                    allPrices.push(price);
                }
            }
        }

        if (allPrices.length > 0) {
            varejoPrice = allPrices[0];
            console.log('[OCR] Using first price as varejo:', varejoPrice);
        }
        if (allPrices.length > 1) {
            atacadoPrice = allPrices[1];
            console.log('[OCR] Using second price as atacado:', atacadoPrice);
        }
    }

    const result = {
        productName,
        varejoPrice,
        atacadoPrice,
        atacadoQty
    };

    console.log('[OCR] Final extraction result:', JSON.stringify(result));
    return result;
}

export default {
    extractTextFromImage,
};
