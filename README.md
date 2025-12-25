# 🛒 SmartCart

**SmartCart** é um aplicativo inteligente de lista de compras e gestão financeira pessoal, projetado para ajudar você a economizar tempo e dinheiro no supermercado.

Ele não apenas substitui o papel e caneta, mas traz **Inteligência de Preços**: o app lembra quanto você pagou nos produtos e avisa se o preço atual está caro ou barato.

![SmartCart Banner](https://via.placeholder.com/1200x500?text=SmartCart+App)

## ✨ Funcionalidades Principais

### 🧠 Inteligência de Preços
*   **Histórico de Compras:** Ao adicionar um item, o app mostra "Última vez: R$ X,XX (há Y dias)".
*   **Scanner Inteligente:** Aponte a câmera para uma etiqueta de preço. O app lê o produto e o preço (Varejo ou Atacado) e compara com seu histórico.
*   **Indicadores de Oferta:** Etiquetas visuais (🟢 Ótimo, 🔴 Caro, 📊 Média) baseadas nos seus dados.

### 📝 Listas de Compras
*   **Orçamento em Tempo Real:** Defina quanto quer gastar e acompanhe o progresso enquanto compra.
*   **Check-in Rápido:** Marque itens conforme coloca no carrinho.
*   **Edição Flexível:** Altere quantidades e preços facilmente.

### 📸 Digitalização e Notas Fiscais
*   **Exportação de Cupom:** Gere um PDF estilo "Cupom Fiscal" das suas compras finalizadas.
*   **Upload Automático:** O cupom é salvo na nuvem e vinculado ao histórico da compra.

### 📊 Dashboard Financeiro
*   **Gastos por Categoria:** Gráficos visuais (Pizza/Barras) para entender para onde vai seu dinheiro.
*   **Evolução Mensal:** Acompanhe seus gastos ao longo dos meses.

## 🛠️ Tecnologias Utilizadas

### Mobile (Frontend)
*   **React Native (Expo):** Framework principal.
*   **Axios:** Comunicação com API.
*   **Expo Camera & Image Manipulator:** Para o scanner OCR.
*   **Expo Print & Sharing:** Para geração de PDFs.

### Backend (API)
*   **Python & Django REST Framework:** API robusta e segura.
*   **PostgreSQL (Supabase):** Banco de dados relacional.
*   **Django AllAuth & SimpleJWT:** Autenticação segura.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
*   Node.js & npm
*   Python 3.9+
*   Expo Go (no celular)

### 1. Backend (Django)

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start --clear
```

## ☁️ Implantação (Deployment)

O projeto está configurado para deploy em arquitetura híbrida:
*   **Banco de Dados:** Supabase
*   **Aplicação:** Render (gunicorn)

Consulte o arquivo `deployment_guide.md` (se disponível) para instruções detalhadas de produção.

---
Desenvolvido com ❤️ e IA.
