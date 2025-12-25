# SmartCart - Data Models

## Database Schema

### User (accounts.User)
Custom user model extending Django's AbstractUser.

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| email | EmailField | **Unique**, used for login |
| username | CharField | Auto-generated from email |
| first_name | CharField | User's first name |
| last_name | CharField | User's last name |
| phone | CharField | Phone number (optional) |
| alert_percentage | IntegerField | Budget alert threshold (50-100) |
| created_at | DateTimeField | Auto-set on creation |
| updated_at | DateTimeField | Auto-set on update |

---

### PaymentMethod (payments.PaymentMethod)
User's payment methods for shopping.

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| user | ForeignKey | → User |
| payment_type | CharField | cash, debit, credit, pix |
| name | CharField | Description (e.g., "Cartão Nubank") |
| available_amount | DecimalField | Available budget |
| is_active | BooleanField | Soft delete flag |
| created_at | DateTimeField | |
| updated_at | DateTimeField | |

---

### ShoppingList (shopping.ShoppingList)
A shopping session/list.

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| user | ForeignKey | → User |
| name | CharField | List name (optional) |
| planned_budget | DecimalField | Target budget |
| total_spent | DecimalField | Auto-calculated |
| status | CharField | active, completed, cancelled |
| payment_methods | ManyToMany | → PaymentMethod |
| notes | TextField | Additional notes |
| created_at | DateTimeField | |
| updated_at | DateTimeField | |
| completed_at | DateTimeField | Set when completed |

**Computed properties:**
- `remaining_budget`: planned - spent
- `budget_percentage`: (spent / planned) * 100
- `items_count`: Number of items

---

### ShoppingItem (shopping.ShoppingItem)
An item in a shopping list.

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| shopping_list | ForeignKey | → ShoppingList |
| name | CharField | Product name |
| unit_price | DecimalField | Price per unit |
| quantity | DecimalField | Quantity (supports decimals for kg) |
| image | ImageField | Photo (optional) |
| notes | CharField | Observations |
| is_checked | BooleanField | Added to cart flag |
| created_at | DateTimeField | |
| updated_at | DateTimeField | |

**Computed properties:**
- `subtotal`: unit_price * quantity

---

### Product (products.Product)
User's product catalog for auto-complete.

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| user | ForeignKey | → User |
| name | CharField | Product name |
| barcode | CharField | Barcode (optional) |
| last_price | DecimalField | Last recorded price |
| category | CharField | Category name |
| image | ImageField | Product photo |
| times_purchased | IntegerField | Purchase counter |
| is_favorite | BooleanField | Favorite flag |
| created_at | DateTimeField | |
| updated_at | DateTimeField | |

---

### PriceHistory (products.PriceHistory)
Historical prices for products.

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| product | ForeignKey | → Product |
| price | DecimalField | Recorded price |
| store_name | CharField | Store name (optional) |
| recorded_at | DateTimeField | Auto-set |

---

## Entity Relationship Diagram

```
User
 ├── PaymentMethod (1:N)
 ├── ShoppingList (1:N)
 │    ├── ShoppingItem (1:N)
 │    └── PaymentMethod (M:N)
 └── Product (1:N)
      └── PriceHistory (1:N)
```
