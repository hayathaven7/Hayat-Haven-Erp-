# 04. Business Workflows & Operations

## 🔄 Core Business Life-Cycles

Hayat Haven ERP automates the end-to-end lifecycle of custom gift crafting, retail POS sales, wholesale distribution, and inventory accounting.

---

### 1. Sales & Custom Order Lifecycle

```
[Customer Order] ➔ [Stock & Price Validation] ➔ [Sales Order Invoice Created]
                                                        │
         ┌──────────────────────────────────────────────┴──────────────────────────────┐
         ▼                                                                             ▼
[Stock Deducted Automatically]                                           [Customer Ledger Debit Recorded]
[Stock Movement Logged]                                                  [Advance Payment Credited]
                                                                                       │
                                                                                       ▼
                                                                         [Due Balance Tracked]
```

1. **Order Capture**: Sales Executive opens POS / New Order Modal (`SO-XXXX`).
2. **Custom Name Engraving & Photo Instructions**: Added directly to invoice item notes.
3. **Advance Deposit Handling**: Partial advance payments (e.g. 50% via bKash/Cash) automatically calculate remaining `dueAmount`.
4. **Stock Auto-Deduction**: System verifies `currentStock >= requestedQuantity`, deducts inventory upon invoice save, and records a `Stock OUT` movement entry.
5. **Customer Ledger Entry**: Posts debit entry for total invoice bill and credit entry for advance payment.

---

### 2. Procurement & Supplier Replenishment Lifecycle

1. **Purchase Order Creation (`PO-XXXX`)**: Inventory Manager records incoming stock from supplier with unit cost prices.
2. **Stock Addition**: Stock quantities increase in real time (`currentStock += quantity`), logging `Stock IN` audit trails.
3. **Supplier Ledger Credit**: Outstanding supplier payables increase by invoice `grandTotal`.
4. **Disbursements (`SP-XXXX`)**: Payments made to suppliers debit the supplier ledger and update remaining due balances.

---

### 3. Financial Income & Expense Statements

- **Sales Revenue**: Total value of non-voided sales invoices.
- **Cost of Goods Sold (COGS)**: Sum of `unitBuyingPrice * itemQuantity` for all sold items.
- **Gross Margin**: `Sales Revenue - COGS`.
- **Operating Expenses**: Total rent, salaries, marketing ads, utilities, and workshop maintenance logged in `expenses`.
- **Net Profit**: `Gross Margin - Operating Expenses`.
