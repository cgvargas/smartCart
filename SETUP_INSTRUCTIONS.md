# 🛒 SmartCart - Setup Instructions

**Versão:** 1.0  
**Data:** 23/12/2025  
**Desenvolvedor:** CGVargas  

---

## 📋 Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Configuração Inicial - Backend](#configuração-inicial---backend)
6. [Configuração Inicial - Mobile](#configuração-inicial---mobile)
7. [Planejamento de Desenvolvimento](#planejamento-de-desenvolvimento)
8. [Fluxo de Uso](#fluxo-de-uso)
9. [Comandos Úteis](#comandos-úteis)
10. [Próximas Ações](#próximas-ações)

---

## 🎯 Visão Geral do Projeto

**SmartCart** é um aplicativo mobile para auxiliar compras de mercado com:

- ✅ Controle de orçamento em tempo real
- ✅ Captura de produtos via câmera (OCR)
- ✅ Histórico de compras reutilizável
- ✅ Alertas inteligentes de gastos
- ✅ Múltiplas formas de pagamento
- ✅ 100% tecnologias gratuitas

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│  React Native   │  ← Expo (Android/iOS)
│   (Frontend)    │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│ Django REST API │  ← Backend
│  (PostgreSQL)   │
└─────────────────┘
         │
         ↓
┌─────────────────┐
│    Supabase     │  ← Database (PostgreSQL)
│   (Free Tier)   │
└─────────────────┘
```

---

## 🛠️ Stack Tecnológica

### **Backend**
| Tecnologia | Versão | Função |
|------------|--------|--------|
| Django | 5.1.1 | Framework web |
| Django REST Framework | 3.14+ | API REST |
| PostgreSQL | 15+ | Banco de dados |
| Supabase | - | Hosting database |
| Django Allauth | 65+ | Autenticação |
| Pillow | 11+ | Processamento imagens |
| Django CORS Headers | 4+ | Cross-origin |
| python-decouple | 3.8 | Variáveis ambiente |

### **Frontend Mobile**
| Tecnologia | Versão | Função |
|------------|--------|--------|
| React Native | 0.74+ | Framework mobile |
| Expo | SDK 51 | Ambiente desenvolvimento |
| Expo Camera | - | Captura fotos |
| Tesseract.js | 5+ | OCR (reconhecimento texto) |
| React Navigation | 6+ | Navegação |
| AsyncStorage | - | Armazenamento local |
| Axios | 1+ | Requisições HTTP |
| Context API | - | Estado global |

### **DevOps**
- **Git/GitHub** → Versionamento
- **Render** → Deploy backend (free tier)
- **Expo Go** → Testes em dispositivo real
- **VS Code** → IDE

---

## 📂 Estrutura de Pastas

```
smartcart/
│
├── backend/                          # Django REST API
│   ├── config/                       # Configurações do projeto
│   │   ├── __init__.py
│   │   ├── settings.py              # Configurações Django
│   │   ├── urls.py                  # URLs principais
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/                         # Apps Django
│   │   │
│   │   ├── accounts/                 # Usuários e autenticação
│   │   │   ├── migrations/
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # User, Configurações
│   │   │   ├── serializers.py       # DRF Serializers
│   │   │   ├── views.py             # ViewSets
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── tests.py
│   │   │
│   │   ├── payments/                 # Formas de pagamento
│   │   │   ├── migrations/
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # FormaPagamento
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── tests.py
│   │   │
│   │   ├── shopping/                 # Listas de compras
│   │   │   ├── migrations/
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # ListaCompras, ItemLista
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── admin.py
│   │   │   └── tests.py
│   │   │
│   │   └── products/                 # Produtos e histórico
│   │       ├── migrations/
│   │       ├── __init__.py
│   │       ├── models.py            # Produto, Historico
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       ├── admin.py
│   │       └── tests.py
│   │
│   ├── static/                       # Arquivos estáticos
│   ├── media/                        # Uploads (imagens)
│   │   └── product_images/
│   │
│   ├── .env                          # Variáveis ambiente (NÃO commitar)
│   ├── .env.example                 # Template .env
│   ├── .gitignore
│   ├── requirements.txt              # Dependências Python
│   ├── manage.py
│   └── README.md
│
├── mobile/                           # React Native App
│   ├── src/
│   │   ├── screens/                  # Telas do app
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.js
│   │   │   │   └── RegisterScreen.js
│   │   │   ├── home/
│   │   │   │   └── HomeScreen.js
│   │   │   ├── payment/
│   │   │   │   ├── PaymentScreen.js
│   │   │   │   └── AddPaymentScreen.js
│   │   │   ├── shopping/
│   │   │   │   ├── ShoppingListScreen.js
│   │   │   │   ├── CameraScreen.js
│   │   │   │   └── ProductDetailScreen.js
│   │   │   └── history/
│   │   │       ├── HistoryScreen.js
│   │   │       └── HistoryDetailScreen.js
│   │   │
│   │   ├── components/               # Componentes reutilizáveis
│   │   │   ├── common/
│   │   │   │   ├── Button.js
│   │   │   │   ├── Input.js
│   │   │   │   ├── Loading.js
│   │   │   │   └── Header.js
│   │   │   ├── shopping/
│   │   │   │   ├── ProductCard.js
│   │   │   │   ├── BudgetBar.js
│   │   │   │   └── ProductList.js
│   │   │   └── payment/
│   │   │       └── PaymentCard.js
│   │   │
│   │   ├── navigation/               # Navegação
│   │   │   ├── AppNavigator.js
│   │   │   └── AuthNavigator.js
│   │   │
│   │   ├── services/                 # Integrações
│   │   │   ├── api.js               # Axios config
│   │   │   ├── auth.js              # Autenticação
│   │   │   ├── ocr.js               # Tesseract.js
│   │   │   └── storage.js           # AsyncStorage
│   │   │
│   │   ├── context/                  # Estado global
│   │   │   ├── AuthContext.js
│   │   │   └── ShoppingContext.js
│   │   │
│   │   ├── utils/                    # Funções auxiliares
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   │
│   │   └── styles/                   # Estilos globais
│   │       ├── colors.js
│   │       ├── fonts.js
│   │       └── globalStyles.js
│   │
│   ├── assets/                       # Imagens, ícones, fontes
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── .gitignore
│   ├── app.json                      # Config Expo
│   ├── package.json
│   ├── babel.config.js
│   ├── App.js                        # Entrada do app
│   └── README.md
│
└── docs/                             # Documentação
    ├── API.md                        # Documentação endpoints
    ├── MODELS.md                     # Documentação models
    ├── FLOWS.md                      # Fluxos de uso
    ├── SETUP_BACKEND.md              # Setup backend detalhado
    ├── SETUP_MOBILE.md               # Setup mobile detalhado
    └── CHANGELOG.md                  # Histórico de mudanças
```

---

## 🔧 Configuração Inicial - Backend

### **1. Criar ambiente virtual**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### **2. Instalar dependências**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### **3. Configurar `.env`**

Copiar `.env.example` para `.env` e preencher:

```env
# Django
SECRET_KEY=sua-secret-key-aqui-gerar-nova
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:port/database

# CORS (para mobile)
CORS_ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.1.x:19000

# JWT
JWT_SECRET_KEY=outra-secret-key-diferente
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

### **4. Rodar migrations**

```bash
python manage.py makemigrations
python manage.py migrate
```

### **5. Criar superusuário**

```bash
python manage.py createsuperuser
```

### **6. Rodar servidor**

```bash
python manage.py runserver
```

Acesse: `http://localhost:8000/admin`

---

## 📱 Configuração Inicial - Mobile

### **1. Instalar dependências**

```bash
cd mobile
npm install
```

### **2. Configurar variáveis de ambiente**

Criar arquivo `src/utils/constants.js`:

```javascript
export const API_URL = __DEV__ 
  ? 'http://192.168.1.x:8000/api'  // IP do seu computador na rede local
  : 'https://smartcart-api.render.com/api';
```

### **3. Rodar app**

```bash
npx expo start
```

### **4. Testar no dispositivo**

- Instalar **Expo Go** no celular
- Escanear QR Code que aparece no terminal
- **OU** pressionar `a` para Android emulator

---

## 📅 Planejamento de Desenvolvimento

### **FASE 1: Setup Inicial** ⏱️ 2-3 horas

**Backend:**
- [x] Criar projeto Django
- [x] Configurar DRF
- [x] Setup PostgreSQL (Supabase)
- [x] Configurar JWT
- [x] Configurar CORS
- [ ] Criar app `accounts`
- [ ] Model `User` customizado

**Mobile:**
- [ ] Inicializar Expo
- [ ] Configurar navegação (React Navigation)
- [ ] Criar telas base (Login, Home)
- [ ] Setup AsyncStorage
- [ ] Configurar Context API

---

### **FASE 2: Autenticação** ⏱️ 3-4 horas

**Backend:**
- [ ] Serializers de User
- [ ] Endpoints: `/api/register/`, `/api/login/`, `/api/token/refresh/`
- [ ] Validações de email/senha
- [ ] Testes unitários

**Mobile:**
- [ ] Tela de Login (UI)
- [ ] Tela de Registro (UI)
- [ ] Integração com API
- [ ] Armazenamento de token JWT
- [ ] Context de autenticação
- [ ] Navegação condicional (autenticado/não autenticado)

---

### **FASE 3: Formas de Pagamento** ⏱️ 4-5 horas

**Backend:**
- [ ] Model `FormaPagamento`
  - `usuario` (FK para User)
  - `tipo` (dinheiro, cartão débito, cartão crédito, pix)
  - `valor_disponivel` (Decimal)
  - `ativo` (Boolean)
- [ ] Serializer
- [ ] ViewSet com CRUD
- [ ] Endpoints REST
- [ ] Validação: valor > 0
- [ ] Testes

**Mobile:**
- [ ] Tela "Adicionar Pagamento"
- [ ] Seletor de tipo de pagamento
- [ ] Input de valor
- [ ] Tela "Minhas Formas de Pagamento"
- [ ] Card de pagamento (exibir tipo, valor)
- [ ] Editar/Excluir pagamento
- [ ] Integração com API

---

### **FASE 4: Lista de Compras** ⏱️ 5-6 horas

**Backend:**
- [ ] Model `ListaCompras`
  - `usuario` (FK)
  - `data_criacao`
  - `valor_planejado`
  - `valor_gasto`
  - `status` (em_andamento, finalizada, cancelada)
  - `formas_pagamento` (M2M)
- [ ] Model `ItemLista`
  - `lista` (FK ListaCompras)
  - `nome_produto`
  - `preco_unitario`
  - `quantidade`
  - `subtotal` (calculado)
  - `imagem` (ImageField, opcional)
- [ ] Serializers
- [ ] ViewSets
- [ ] Lógica de cálculo de totais
- [ ] Endpoints REST
- [ ] Testes

**Mobile:**
- [ ] Tela "Nova Lista"
- [ ] Seleção de formas de pagamento
- [ ] Input de valor planejado
- [ ] Tela "Lista de Compras"
- [ ] Barra de orçamento (progressbar)
- [ ] Lista de itens (FlatList)
- [ ] Card de produto (nome, preço, qtd, subtotal)
- [ ] Botão "Adicionar Item Manual"
- [ ] Botão "Escanear Produto"
- [ ] Atualização de totais em tempo real

---

### **FASE 5: Câmera + OCR** ⏱️ 6-8 horas

**Backend:**
- [ ] Endpoint para upload de imagem
- [ ] Armazenamento em Supabase Storage
- [ ] (Opcional) Pré-processamento de imagem com Pillow

**Mobile:**
- [ ] Tela "Câmera"
- [ ] Integração Expo Camera
- [ ] Captura de foto
- [ ] Exibição de preview
- [ ] Integração Tesseract.js
- [ ] Extração de texto da imagem
- [ ] Parsing de nome do produto
- [ ] Parsing de preço (regex para R$ x,xx)
- [ ] Tela "Confirmar Produto"
  - Mostrar imagem capturada
  - Editar nome (auto-preenchido)
  - Editar preço (auto-preenchido)
  - Input quantidade
  - Botão "Adicionar"
- [ ] Loading durante OCR
- [ ] Tratamento de erros (OCR falhou, etc)

---

### **FASE 6: Sistema de Alertas** ⏱️ 3-4 horas

**Backend:**
- [ ] Adicionar campo `percentual_alerta` ao User (padrão: 80%)
- [ ] Endpoint para configurar alerta
- [ ] Lógica de cálculo: `(valor_gasto / valor_planejado) * 100`
- [ ] Endpoint que retorna status do orçamento

**Mobile:**
- [ ] Tela "Configurações"
- [ ] Slider para escolher % de alerta (50-100%)
- [ ] Monitoramento contínuo do orçamento
- [ ] Modal/Alert quando atingir %
  - "Atenção! Você já gastou X% do orçamento"
  - Opções: "Continuar", "Ver Lista", "Adicionar Valor"
- [ ] Notificação visual na barra de orçamento (cor vermelha/laranja)

---

### **FASE 7: Histórico e Reutilização** ⏱️ 4-5 horas

**Backend:**
- [ ] Model `HistoricoCompras` (ou usar ListaCompras com status "finalizada")
- [ ] Endpoint para buscar compras anteriores
- [ ] Endpoint "Duplicar Lista" (POST com lista_id)
  - Cria nova lista
  - Copia todos os itens
  - Retorna nova lista

**Mobile:**
- [ ] Tela "Histórico de Compras"
- [ ] Lista de compras anteriores (ordenadas por data)
- [ ] Card de histórico (data, valor total, qtd itens)
- [ ] Tela "Detalhes do Histórico"
  - Lista completa de produtos
  - Valores
- [ ] Botão "Usar como Base"
  - Carrega lista anterior
  - Permite edições antes de iniciar
- [ ] Botão "Nova Compra Vazia"

---

### **FASE 8: Ajustes Finais + Deploy** ⏱️ 4-6 horas

**Backend:**
- [ ] Adicionar item à lista em andamento
- [ ] Remover item da lista
- [ ] Editar quantidade de item
- [ ] Adicionar nova forma de pagamento durante compra
- [ ] Finalizar lista
- [ ] Cancelar lista
- [ ] Rate limiting (django-ratelimit)
- [ ] Logs de auditoria
- [ ] Testes de integração
- [ ] Deploy no Render
- [ ] Configurar variáveis de ambiente
- [ ] Testar API em produção

**Mobile:**
- [ ] Swipe para remover item (react-native-swipeable)
- [ ] Modal "Adicionar Valor"
  - Escolher nova forma pagamento
  - Atualizar valor total planejado
- [ ] Modal "Remover Produto"
  - Confirmar remoção
  - Atualizar totais
- [ ] Feedback visual (loading, success, error)
- [ ] Splash screen
- [ ] Ícone do app
- [ ] Build APK (Android)
- [ ] Testes em dispositivo real
- [ ] Documentação de uso

---

## 🔄 Fluxo de Uso

### **Fluxo 1: Primeira Compra**

```
[Abrir App]
    ↓
[Fazer Login/Cadastro]
    ↓
[Tela Home] → Botão "Nova Compra"
    ↓
[Adicionar Forma de Pagamento]
    - Escolher tipo (dinheiro, cartão, pix)
    - Digitar valor disponível
    ↓
[Escolher Modo]
    ├── [A] Criar Lista Manual
    │       ↓
    │   [Adicionar produtos manualmente]
    │       - Nome
    │       - Preço
    │       - Quantidade
    │
    └── [B] Ir às Compras
            ↓
        [No mercado: Escanear Produto]
            ↓
        [Câmera captura foto da etiqueta]
            ↓
        [OCR extrai nome + preço]
            ↓
        [Tela Confirmar Produto]
            - Editar nome (se necessário)
            - Editar preço (se necessário)
            - Digitar quantidade
            - Botão "Adicionar"
            ↓
        [Produto adicionado à lista]
            ↓
        [Orçamento atualizado]
            - Barra de progresso
            - Valor restante
            ↓
        [Continuar escaneando produtos]
            ↓
        [Quando atingir % configurado (ex: 80%)]
            ↓
        [ALERTA: "Você já gastou 80% do orçamento!"]
            - Opções:
              • Continuar comprando
              • Adicionar mais valor
              • Remover produtos
            ↓
        [Finalizar Compra]
            - Resumo final
            - Total gasto
            - Confirmar
            ↓
        [Compra salva no histórico]
```

---

### **Fluxo 2: Compras Seguintes**

```
[Abrir App]
    ↓
[Fazer Login]
    ↓
[Tela Home] → Botão "Nova Compra"
    ↓
[Adicionar Valor + Forma Pagamento]
    ↓
[Tela: "Deseja usar uma lista anterior?"]
    ├── [Sim]
    │   ↓
    │   [Escolher lista do histórico]
    │   ↓
    │   [Lista carregada (editável)]
    │   - Adicionar produtos
    │   - Remover produtos
    │   - Ajustar quantidades
    │   ↓
    │   [Iniciar Compra]
    │
    └── [Não]
        ↓
        [Seguir Fluxo 1 - Criar Nova Lista]
```

---

### **Fluxo 3: Ajustes Durante Compra**

```
[Durante a compra]
    ↓
[Verificar que vai ultrapassar orçamento]
    ↓
[Opções]
    ├── [Adicionar Valor]
    │   ↓
    │   [Escolher nova forma pagamento]
    │   ↓
    │   [Digitar valor adicional]
    │   ↓
    │   [Orçamento atualizado]
    │
    └── [Remover Produtos]
        ↓
        [Swipe no produto]
        ↓
        [Confirmar remoção]
        ↓
        [Produto removido]
        ↓
        [Orçamento atualizado]
```

---

## 🔨 Comandos Úteis

### **Backend**

```bash
# Ativar ambiente virtual
venv\Scripts\activate

# Rodar servidor
python manage.py runserver

# Criar migrations
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Criar superuser
python manage.py createsuperuser

# Shell interativo
python manage.py shell

# Rodar testes
python manage.py test

# Coletar arquivos estáticos
python manage.py collectstatic

# Verificar problemas
python manage.py check
```

### **Mobile**

```bash
# Instalar dependências
npm install

# Rodar app
npx expo start

# Rodar no Android
npx expo start --android

# Rodar no iOS
npx expo start --ios

# Limpar cache
npx expo start -c

# Build APK (Android)
eas build --platform android --profile preview

# Instalar biblioteca
npm install nome-da-biblioteca
```

### **Git**

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "mensagem"

# Push
git push origin main

# Criar branch
git checkout -b feature/nome-feature

# Merge
git checkout main
git merge feature/nome-feature
```

---

## ✅ Próximas Ações

### **Agora você deve:**

1. ✅ Criar pasta `smartcart` no local desejado
2. ✅ Adicionar este arquivo (`SETUP_INSTRUCTIONS.md`) na pasta
3. ✅ Abrir pasta no VS Code
4. ✅ Confirmar para eu iniciar a criação da estrutura

### **Eu vou criar:**

1. ✅ Estrutura completa de pastas (backend + mobile + docs)
2. ✅ `requirements.txt` (backend)
3. ✅ `package.json` (mobile)
4. ✅ `.env.example` (backend)
5. ✅ `.gitignore` (ambos)
6. ✅ `README.md` (ambos)
7. ✅ Arquivos de configuração base

### **Após confirmação, vamos começar pela FASE 1:**

- Setup do Django
- Configuração do DRF
- Setup do PostgreSQL
- Criação do app `accounts`

---

## 📞 Suporte

**Dúvidas ou problemas?**
- Consulte a documentação em `/docs`
- Verifique os logs de erro
- Use o comando `check` do Django
- Teste endpoints via Postman/Insomnia

---

**Desenvolvido com ❤️ por CGVargas**  
**Data:** 23/12/2025
