# 03. User Roles & Security Model

## 🛡️ User Role Hierarchy

Hayat Haven ERP enforces granular Role-Based Access Control (RBAC). Three pre-configured user roles exist, each tailored to specific operational responsibilities.

```
                  ┌─────────────────────────────────┐
                  │          Admin (Owner)          │
                  │   All Modules & Systems Access   │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│        Manager / Accounts       │                 │       Executive (Sales/Inv)     │
│ Financials, Expenses, Reports   │                 │ POS, Orders, Products, Stock    │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

---

## 🔒 Module Access Matrix

| Module | Admin | Manager | Executive (Sales) | Executive (Inv) |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Products & Inventory** | ✅ | ✅ | ✅ | ✅ |
| **Sales Orders & POS** | ✅ | ✅ | ✅ | ❌ |
| **Purchases & Receiving** | ✅ | ✅ | ❌ | ✅ |
| **Customers** | ✅ | ✅ | ✅ | ❌ |
| **Suppliers** | ✅ | ✅ | ❌ | ✅ |
| **Customer Payments** | ✅ | ✅ | ✅ | ❌ |
| **Supplier Payments** | ✅ | ✅ | ❌ | ✅ |
| **Operating Expenses** | ✅ | ✅ | ❌ | ❌ |
| **Profit & Financial Reports** | ✅ | ✅ | ❌ | ❌ |
| **User Roles & Security** | ✅ | ❌ | ❌ | ❌ |
| **Company Settings** | ✅ | ❌ | ❌ | ❌ |
| **Delete Records Permission** | ✅ | ✅ (Configurable) | ❌ | ❌ |

---

## 🔑 Security Protections & Data Integrity Rules

1. **Authentication Guard**: Unauthenticated requests are immediately bounced back to the `/login` screen.
2. **Deletion Locks on Financial Ledger Dependencies**:
   - Customers or Suppliers with non-zero account balances or active sales/purchases **cannot be deleted**.
   - Attempting deletion displays an error alert protecting historical ledger consistency.
3. **Negative Stock Guard**:
   - Sales Orders, POS checkouts, and Stock-OUT adjustments enforce real-time quantity validation against `currentStock`.
   - Orders exceeding available stock are rejected to prevent phantom inventory.
4. **Unique Barcode Lock**:
   - Product barcode inputs are validated globally across the system to prevent duplicate barcode collision.
5. **Firestore Security Rules**:
   - Access to Firestore documents is bounded by strict match rules preventing unauthenticated read/writes.
