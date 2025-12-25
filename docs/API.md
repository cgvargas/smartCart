# SmartCart - API Documentation

## Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://smartcart-api.render.com/api`

## Authentication

All endpoints require JWT authentication except registration and login.

### Headers
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### Login
`POST /api/token/`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "access": "eyJ0...",
  "refresh": "eyJ0..."
}
```

### Refresh Token
`POST /api/token/refresh/`
```json
{
  "refresh": "eyJ0..."
}
```

### Register
`POST /api/accounts/register/`
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "João",
  "last_name": "Silva"
}
```

---

## Accounts Endpoints

### Get Profile
`GET /api/accounts/profile/`

### Update Profile
`PUT /api/accounts/profile/`
```json
{
  "first_name": "João",
  "last_name": "Silva",
  "phone": "11999999999",
  "alert_percentage": 80
}
```

### Change Password
`POST /api/accounts/change-password/`
```json
{
  "old_password": "oldpass",
  "new_password": "newpass",
  "new_password_confirm": "newpass"
}
```

---

## Payments Endpoints

### List Payments
`GET /api/payments/`

### Create Payment
`POST /api/payments/`
```json
{
  "payment_type": "cash|debit|credit|pix",
  "name": "Cartão Nubank",
  "available_amount": 500.00
}
```

### Total Available
`GET /api/payments/total_available/`

### Add Funds
`POST /api/payments/{id}/add_funds/`
```json
{
  "amount": 100.00
}
```

---

## Shopping Endpoints

### List Shopping Lists
`GET /api/shopping/`

### Create Shopping List
`POST /api/shopping/`
```json
{
  "name": "Compras da Semana",
  "planned_budget": 500.00,
  "payment_methods_ids": [1, 2]
}
```

### Get Active List
`GET /api/shopping/active/`

### Get History
`GET /api/shopping/history/`

### Complete List
`POST /api/shopping/{id}/complete/`

### Duplicate List
`POST /api/shopping/{id}/duplicate/`

### Budget Status
`GET /api/shopping/{id}/budget_status/`

---

## Shopping Items Endpoints

### List Items
`GET /api/shopping/{list_id}/items/`

### Add Item
`POST /api/shopping/{list_id}/items/`
```json
{
  "name": "Arroz 5kg",
  "unit_price": 25.99,
  "quantity": 2,
  "notes": "Marca X"
}
```

### Toggle Check
`POST /api/shopping/{list_id}/items/{item_id}/toggle_check/`

---

## Products Endpoints

### List Products
`GET /api/products/`

### Favorites
`GET /api/products/favorites/`

### Frequent
`GET /api/products/frequent/`

### Toggle Favorite
`POST /api/products/{id}/toggle_favorite/`

### Add Price
`POST /api/products/{id}/add_price/`
```json
{
  "price": 12.99,
  "store_name": "Supermercado X"
}
```
