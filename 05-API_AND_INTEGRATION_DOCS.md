# 02. Database Schema & Firestore Collections

## 🗄️ Firestore Database Design

The Hayat Haven ERP utilizes Google Firestore for real-time document storage. Below is the detailed schema specification for all 17 primary collections.

---

### 1. `companySettings`
- **Document ID**: `default`
- **Fields**:
  - `companyName` (*string*): Legal business name.
  - `companyAddress` (*string*): Physical store address.
  - `companyPhone` (*string*): Primary hotline.
  - `companyEmail` (*string*): Store contact email.
  - `currencySymbol` (*string*): e.g. `৳` (BDT).
  - `vatTaxNumber` (*string*): BIN / VAT registration number.
  - `bankDetails` (*string*): Bank account & mobile banking numbers for invoice footer.
  - `termsAndConditions` (*string*): Standard invoice policies.

---

### 2. `products`
- **Document ID**: `PRD-XXXX`
- **Fields**:
  - `id` (*string*): Unique Product SKU ID.
  - `barcode` (*string, unique*): Barcode scanner value.
  - `name` (*string*): Item title (e.g., "Customized Engraved Leather Wallet").
  - `categoryId` (*string*): Foreign key to `categories`.
  - `brandId` (*string*): Foreign key to `brands`.
  - `buyingPrice` (*number*): Purchase cost price (COGS basis).
  - `sellingPrice` (*number*): Standard retail selling price.
  - `minSellingPrice` (*number*): Minimum allowed discount price floor.
  - `openingStock` (*number*): Initial stock quantity upon creation.
  - `currentStock` (*number*): Real-time remaining stock (auto-updated by Sales & Purchases).
  - `lowStockAlert` (*number*): Threshold for low stock warning.
  - `unit` (*string*): Unit of measure (`Pcs`, `Set`, `Box`).

---

### 3. `customers`
- **Document ID**: `CUST-XXXX`
- **Fields**:
  - `id` (*string*): Customer ID.
  - `name` (*string*): Full name or company title.
  - `phone` (*string*): Phone number.
  - `email` (*string*): Email address.
  - `address` (*string*): Shipping / Billing address.
  - `type` (*string*): `Retail` or `Wholesale`.
  - `openingBalance` (*number*): Initial debt (+ for receivable, - for advance).
  - `currentBalance` (*number*): Current outstanding balance.

---

### 4. `suppliers`
- **Document ID**: `SUP-XXXX`
- **Fields**:
  - `id` (*string*): Supplier ID.
  - `name` (*string*): Business name.
  - `contactPerson` (*string*): Representative name.
  - `phone` (*string*): Phone number.
  - `address` (*string*): Office/Workshop location.
  - `openingBalance` (*number*): Initial payable amount.
  - `currentBalance` (*number*): Real-time outstanding payable amount.

---

### 5. `salesOrders`
- **Document ID**: `SO-XXXX`
- **Fields**:
  - `id` (*string*): Sales Order ID.
  - `orderDate` (*string*): ISO YYYY-MM-DD.
  - `customerId` (*string*): Customer reference.
  - `customerName` (*string*): Denormalized name for fast reports.
  - `orderType` (*string*): `Retail` | `Wholesale`.
  - `items` (*array of objects*):
    - `productId` (*string*)
    - `productName` (*string*)
    - `quantity` (*number*)
    - `unitPrice` (*number*)
    - `totalPrice` (*number*)
    - `profitAmount` (*number*)
  - `subtotal` (*number*)
  - `discountAmount` (*number*)
  - `deliveryCharge` (*number*)
  - `grandTotal` (*number*)
  - `advancePaid` (*number*)
  - `dueAmount` (*number*)
  - `paymentStatus` (*string*): `Paid` | `Partial` | `Unpaid`
  - `deliveryStatus` (*string*): `Delivered` | `Pending` | `Voided`

---

### 6. `purchases`
- **Document ID**: `PO-XXXX`
- **Fields**:
  - `id` (*string*): Purchase Order ID.
  - `purchaseDate` (*string*): ISO YYYY-MM-DD.
  - `supplierId` (*string*)
  - `supplierName` (*string*)
  - `invoiceNumber` (*string*): Supplier's physical bill number.
  - `items` (*array of objects*):
    - `productId` (*string*)
    - `productName` (*string*)
    - `quantity` (*number*)
    - `unitCost` (*number*)
    - `totalCost` (*number*)
  - `subtotal` (*number*)
  - `discountAmount` (*number*)
  - `transportCost` (*number*)
  - `grandTotal` (*number*)
  - `paidAmount` (*number*)
  - `dueAmount` (*number*)
  - `paymentStatus` (*string*): `Paid` | `Partial` | `Unpaid`
  - `status` (*string*): `Received` | `Ordered` | `Voided`

---

### 7. `expenses`
- **Document ID**: `EXP-XXXX`
- **Fields**:
  - `id` (*string*)
  - `expenseDate` (*string*)
  - `category` (*string*): `Rent`, `Salary`, `Utilities`, `Marketing`, `Maintenance`, `Transport`, `Misc`.
  - `amount` (*number*)
  - `paymentMethod` (*string*)
  - `description` (*string*)
  - `referenceNo` (*string*)

---

### 8. `customerPayments` & `supplierPayments`
- **Fields**: Payment transactions linked to customer or supplier ledgers with receipt numbers, dates, payment channels, and amounts.

---

### 9. `stockMovements`
- **Fields**: Audit log records created automatically on every sale, purchase, or manual stock adjustment tracking `previousStock`, `quantity`, `newStock`, and `referenceType`.
