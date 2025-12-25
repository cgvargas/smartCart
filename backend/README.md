# SmartCart Backend

API REST para o aplicativo SmartCart - controle de compras de mercado.

## 🛠️ Stack

- Django 5.1+
- Django REST Framework
- PostgreSQL (Supabase)
- JWT Authentication

## 📦 Apps

- **accounts**: Usuários e autenticação
- **payments**: Formas de pagamento
- **shopping**: Listas de compras e itens
- **products**: Catálogo de produtos

## 🚀 Configuração

### 1. Ambiente virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 2. Dependências
```bash
pip install -r requirements.txt
```

### 3. Variáveis de ambiente
```bash
copy .env.example .env
# Editar .env com suas configurações
```

### 4. Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Superusuário
```bash
python manage.py createsuperuser
```

### 6. Servidor
```bash
python manage.py runserver
```

## 📍 Endpoints

### Auth
- `POST /api/token/` - Login (JWT)
- `POST /api/token/refresh/` - Refresh token
- `POST /api/accounts/register/` - Registro

### Accounts
- `GET /api/accounts/profile/` - Perfil
- `PUT /api/accounts/profile/` - Atualizar perfil
- `POST /api/accounts/change-password/` - Alterar senha

### Payments
- `GET /api/payments/` - Listar formas de pagamento
- `POST /api/payments/` - Criar
- `GET /api/payments/total_available/` - Total disponível

### Shopping
- `GET /api/shopping/` - Listar listas
- `POST /api/shopping/` - Criar lista
- `GET /api/shopping/active/` - Lista ativa
- `GET /api/shopping/history/` - Histórico
- `POST /api/shopping/{id}/complete/` - Finalizar
- `POST /api/shopping/{id}/duplicate/` - Duplicar

### Products
- `GET /api/products/` - Listar produtos
- `GET /api/products/favorites/` - Favoritos
- `GET /api/products/frequent/` - Mais comprados

## 📝 License

MIT
