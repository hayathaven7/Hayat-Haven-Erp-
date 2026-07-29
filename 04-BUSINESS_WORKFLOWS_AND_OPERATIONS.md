# 05. API & Integration Documentation

## 🔌 Integrations & Automated Parsers

### 1. Social Media & WhatsApp Order Parser (`PendingOrdersModule`)
Hayat Haven receives custom order inquiries via Facebook Messenger and WhatsApp. The AI Order Parser automatically converts raw text chat logs into structured pending orders.

#### Data Parsing Payload Structure
```json
{
  "channel": "WhatsApp",
  "customerName": "MD. Tanvir Hasan",
  "customerPhone": "+8801711223344",
  "customerAddress": "House 42, Road 7, Sector 4, Uttara, Dhaka",
  "items": [
    {
      "productId": "PRD-1001",
      "productName": "Customized Engraved Leather Wallet",
      "quantity": 1,
      "unitPrice": 1450,
      "totalPrice": 1450
    }
  ],
  "subtotal": 1450,
  "deliveryCharge": 100,
  "grandTotal": 1550,
  "status": "Pending",
  "aiNotes": "Engrave Name: 'Tanvir Hasan'"
}
```

---

### 2. SMS Gateway API Integration

Hayat Haven ERP interfaces with SMS service providers (e.g., Greenweb, Teletalk, Banglalink Bulk SMS) to send automated order confirmations and payment receipts.

#### HTTP POST Request Specifications
- **Endpoint**: Configured in `CompanySettingsModule`
- **Headers**: `Content-Type: application/json`
- **Body Payload**:
```json
{
  "api_key": "HH-SMS-GATEWAY-KEY-9988",
  "type": "unicode",
  "contacts": "+8801819334455",
  "senderid": "HayatHaven",
  "msg": "প্রিয় MD. Tanvir Hasan, Hayat Haven-এ কেনাকাটার জন্য ধন্যবাদ! মেমো নং: SO-10001, মোট বিল: ৳1550।"
}
```

---

### 3. POS Thermal Printer Specification

- **Paper Size**: 80mm / 3-inch POS Thermal Roll (or 58mm 2-inch)
- **Formatting**: Monochrome high-contrast styling with standard `@media print` rules ignoring page headers and margins.
- **ESC/POS Command Support**: Native browser print dialog triggers direct thermal line feed cut commands.
