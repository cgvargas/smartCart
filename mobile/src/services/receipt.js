import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

const generateHTML = (list, items, paymentMethodName = 'Não informado') => {
  const total = parseFloat(list.total_spent || 0);
  const date = new Date().toLocaleString('pt-BR');

  // Generate Items Rows
  const itemsRows = items.map(item => {
    const unitPrice = parseFloat(item.unit_price || item.price || 0);
    const quantity = parseFloat(item.quantity || 1);
    const total = unitPrice * quantity;

    return `
        <div class="item-row">
            <span class="item-name">${item.name}</span>
            <span class="item-price">R$ ${total.toFixed(2)}</span>
        </div>
        <div class="item-detail">
            ${quantity} x R$ ${unitPrice.toFixed(2)}
        </div>
    `}).join('');

  return `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
      body {
        font-family: 'Courier New', Courier, monospace;
        text-align: center;
        max-width: 380px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
      }
      .header {
        margin-bottom: 20px;
        border-bottom: 1px dashed #000;
        padding-bottom: 15px;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .subtitle {
        font-size: 14px;
        color: #333;
      }
      .separator {
        border-bottom: 1px dashed #000;
        margin: 15px 0;
      }
      .item-row {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-weight: bold;
        font-size: 14px;
      }
      .item-detail {
        text-align: left;
        font-size: 12px;
        color: #555;
        margin-bottom: 5px;
      }
      .total-section {
        margin-top: 20px;
        border-top: 1px dashed #000;
        padding-top: 15px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 18px;
        font-weight: bold;
        margin-top: 5px;
      }
      .payment-info {
        margin-top: 15px;
        font-size: 12px;
        text-align: left;
      }
      .footer {
        margin-top: 30px;
        font-size: 10px;
        color: #888;
        border-top: 1px dashed #000;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">SmartCart</div>
      <div class="subtitle">Extrato de Compras</div>
      <div class="subtitle">${date}</div>
    </div>

    <div class="items-container">
      ${itemsRows}
    </div>

    <div class="total-section">
      <div class="total-row">
        <span>TOTAL</span>
        <span>R$ ${total.toFixed(2)}</span>
      </div>
    </div>

    <div class="payment-info">
      <div>Forma de Pagamento: <strong>${paymentMethodName}</strong></div>
      <div>Itens: ${items.length}</div>
      <div>Lista: ${list.name}</div>
    </div>

    <div class="footer">
      <p>Gerado via SmartCart App</p>
      <p>Controle Inteligente de Gastos</p>
    </div>
  </body>
</html>
`;
};

export const generatePDF = async (list, items, paymentMethodName) => {
  try {
    const html = generateHTML(list, items, paymentMethodName);
    const { uri } = await Print.printToFileAsync({ html });
    console.log('PDF generated at:', uri);
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const printReceipt = async (list, items, paymentMethodName) => {
  try {
    const uri = await generatePDF(list, items, paymentMethodName);

    if (Platform.OS === "ios") {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartilhar Nota Fiscal' });
    }
    return uri;

  } catch (error) {
    console.error('Error printing receipt:', error);
    Alert.alert('Erro', 'Não foi possível gerar a nota fiscal.');
    return null;
  }
};
