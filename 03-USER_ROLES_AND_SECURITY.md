# 01. System Architecture & Folder Structure

## 🌐 System Architecture Overview

**Hayat Haven ERP** is built as a single-page application (SPA) with real-time cloud synchronization capabilities, offline-first resilience, and mobile-responsive PWA capabilities.

### Tech Stack Breakdown
- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Lucide React Icons
- **State Management**: React Context API (`ERPContext`) with Dual Storage (Local Storage + Cloud Firestore)
- **Database**: Google Firebase Firestore (NoSQL Document Store)
- **Authentication**: Firebase Auth & Custom Role-based Credentials Engine
- **Icons & UI**: Lucide React, Custom Canvas Charts

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                            │
│  [Desktop Browser / POS Thermal Screen / Mobile PWA Tablet Interface]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       React Context State Engine                       │
│  [ERPContext - Dual Sync, Validation Rules, Financial Calculators]     │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│  Offline Indexed / Local     │          │    Cloud Firestore Engine    │
│  Storage Sync Queue          │          │    (Google Cloud Platform)   │
└──────────────────────────────┘          └──────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```
hayat-haven-erp/
├── docs/                                  # Full system documentation suite
│   ├── README.md                          # Master Index
│   ├── 01-SYSTEM_ARCHITECTURE_AND_FOLDER_STRUCTURE.md
│   ├── 02-DATABASE_SCHEMA_AND_FIRESTORE_COLLECTIONS.md
│   ├── 03-USER_ROLES_AND_SECURITY.md
│   ├── 04-BUSINESS_WORKFLOWS_AND_OPERATIONS.md
│   ├── 05-API_AND_INTEGRATION_DOCS.md
│   ├── 06-ENVIRONMENT_VARS_AND_DEPLOYMENT.md
│   ├── 07-BACKUP_RESTORE_AND_DISASTER_RECOVERY.md
│   ├── 08-USER_AND_ADMIN_MANUAL.md
│   └── 09-FUTURE_MAINTENANCE_GUIDE.md
├── firebase-applet-config.json            # Firebase client credentials
├── firebase-blueprint.json                # Firestore entity blueprint
├── firestore.rules                        # Database security rules
├── index.html                             # Single Page Application HTML shell
├── package.json                           # Dependencies and scripts
├── postcss.config.js                      # Tailwind CSS PostCSS config
├── tailwind.config.js                     # Tailwind styling configuration
├── tsconfig.json                          # TypeScript compiler configuration
├── vite.config.ts                         # Vite build configuration
└── src/
    ├── App.tsx                            # Root application routing & authentication wrapper
    ├── main.tsx                           # Application entry point
    ├── index.css                          # Global styles & print stylesheets
    ├── lib/
    │   └── firebase.ts                    # Firebase SDK initialization
    ├── types/
    │   └── erp.ts                         # Universal TypeScript interfaces & enums
    ├── data/
    │   └── initialData.ts                 # Default seed data (Products, Users, Settings)
    ├── context/
    │   └── ERPContext.tsx                 # Core business logic, ledger sync, calculation engine
    ├── components/
    │   ├── LoginScreen.tsx                # Secure user login screen
    │   ├── MainLayout.tsx                 # Responsive sidebar & header navigation
    │   ├── ModuleView.tsx                 # Module router & permission validator
    │   ├── Navigation.tsx                 # Desktop sidebar navigation
    │   ├── Header.tsx                     # Topbar with user profile, status & quick actions
    │   ├── NewOrderModal.tsx              # Universal POS & Sales Order Creation modal
    │   ├── ThermalReceiptModal.tsx        # 80mm / 3-inch POS Thermal Memo Printer modal
    │   └── modules/                       # Specialized functional ERP modules
    │       ├── DashboardModule.tsx        # Executive KPIs, charts & stock alert panel
    │       ├── ProductsModule.tsx         # Product catalog, stock levels & barcode generator
    │       ├── CategoriesModule.tsx       # Product categories manager
    │       ├── BrandsModule.tsx           # Brand registry manager
    │       ├── CustomersModule.tsx        # Customer database & ledger history
    │       ├── SuppliersModule.tsx        # Supplier directory & debt ledger
    │       ├── SalesOrdersModule.tsx      # Sales invoices & order fulfillment
    │       ├── PurchasesModule.tsx        # Purchase orders & stock replenishment
    │       ├── CustomerPaymentsModule.tsx # Customer payment collections
    │       ├── SupplierPaymentsModule.tsx # Supplier payment disbursements
    │       ├── ExpensesModule.tsx         # Operating expense voucher logging
    │       ├── StockMovementModule.tsx    # Inventory audit & manual adjustments
    │       ├── CustomerLedgerModule.tsx   # Detailed customer account ledger
    │       ├── SupplierLedgerModule.tsx   # Detailed supplier account ledger
    │       ├── ReportsModule.tsx          # Income statement & financial analytics
    │       ├── QuotationsModule.tsx       # Price quotations & proforma invoices
    │       ├── UserRolesModule.tsx        # User accounts & permission matrix
    │       ├── CompanySettingsModule.tsx  # Company header, currency & SMS settings
    │       ├── PendingOrdersModule.tsx    # WhatsApp & social media order parser
    │       ├── EcommerceStoreModule.tsx   # Public online storefront preview
    │       └── AIBotModule.tsx            # AI Business Assistant & inventory search
```
