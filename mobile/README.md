# SmartCart Mobile

Aplicativo mobile React Native/Expo para controle de compras.

## 🛠️ Stack

- React Native 0.74+
- Expo SDK 51
- React Navigation 6
- Expo Camera
- Tesseract.js (OCR)
- AsyncStorage
- Axios

## 🚀 Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar API URL
Editar `src/utils/constants.js`:
```javascript
export const API_URL = __DEV__
  ? 'http://SEU_IP_LOCAL:8000/api'
  : 'https://sua-api.render.com/api';
```

### 3. Rodar app
```bash
npx expo start
```

### 4. Testar
- Instalar **Expo Go** no celular
- Escanear QR Code
- Ou pressionar `a` para emulador Android

## 📱 Telas

- **Auth**: Login, Registro
- **Home**: Dashboard e status
- **Shopping**: Lista de compras ativa
- **Camera**: Escanear produtos (OCR)
- **History**: Histórico de compras
- **Profile**: Perfil e configurações
- **Payments**: Formas de pagamento

## 📂 Estrutura

```
src/
├── components/    # Componentes reutilizáveis
├── context/       # Context API (Auth, Shopping)
├── navigation/    # React Navigation
├── screens/       # Telas do app
├── services/      # API, Auth, OCR, Storage
├── styles/        # Cores e estilos globais
└── utils/         # Constantes, formatters, validators
```

## 📝 License

MIT
