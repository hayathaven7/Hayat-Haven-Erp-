import {
  Brand,
  Category,
  CompanySettings,
  Customer,
  CustomerLedgerEntry,
  CustomerPayment,
  Expense,
  ModuleType,
  PendingOrder,
  Product,
  Purchase,
  PurchaseItem,
  Quotation,
  SalesOrder,
  SalesOrderItem,
  StockMovement,
  Supplier,
  SupplierLedgerEntry,
  SupplierPayment,
  UserAccount,
} from '../types/erp';

export const ALL_ERP_MODULES: ModuleType[] = [
  'company_settings',
  'dashboard',
  'customers',
  'suppliers',
  'categories',
  'brands',
  'products',
  'sales_orders',
  'sales_order_items',
  'purchases',
  'purchase_items',
  'customer_payments',
  'supplier_payments',
  'expenses',
  'stock_movement',
  'customer_ledger',
  'supplier_ledger',
  'profit_report',
  'sales_report',
  'purchase_report',
  'stock_report',
  'due_report',
  'invoice_print',
  'quotations',
  'app_settings',
  'user_roles',
  'user_reports',
  'ai_bot',
  'pending_orders',
  'printer_settings',
  'ecommerce_store',
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-1001',
    username: 'admin',
    name: 'Senior Admin (Owner)',
    email: 'admin@hayathaven.com',
    phone: '+880 1711-889900',
    password: '402290',
    role: 'Admin',
    allowedModules: ALL_ERP_MODULES,
    canDelete: true,
    status: 'Active',
    designation: 'Managing Director / Shop Owner',
    joiningDate: '2022-01-01',
    nidNumber: '1990269283710293',
    documentType: 'NID',
  },
  {
    id: 'USR-1002',
    username: 'rafiq',
    name: 'Md. Rafiq (Sales Executive)',
    email: 'rafiq.sales@hayathaven.com',
    phone: '+880 1819-334455',
    password: '123456',
    role: 'Executive',
    allowedModules: [
      'dashboard',
      'customers',
      'products',
      'sales_orders',
      'sales_order_items',
      'customer_payments',
      'user_reports',
      'invoice_print',
      'due_report',
      'ai_bot',
      'pending_orders',
    ],
    canDelete: false,
    status: 'Active',
    designation: 'Custom Gift Consultant',
    joiningDate: '2023-03-15',
    nidNumber: '1995261928471029',
    documentType: 'NID',
  },
  {
    id: 'USR-1003',
    username: 'tanvir',
    name: 'Tanvir Hossain (Inventory Exec)',
    email: 'tanvir.inv@hayathaven.com',
    phone: '+880 1912-556677',
    password: '123456',
    role: 'Executive',
    allowedModules: [
      'dashboard',
      'products',
      'categories',
      'brands',
      'purchases',
      'purchase_items',
      'supplier_payments',
      'stock_movement',
      'stock_report',
    ],
    canDelete: false,
    status: 'Active',
    designation: 'Inventory & Workshop Manager',
    joiningDate: '2023-06-01',
    nidNumber: '1998263849102938',
    documentType: 'NID',
  },
  {
    id: 'USR-1004',
    username: 'nasrin',
    name: 'Nasrin Akter (Accounts Manager)',
    email: 'nasrin.accounts@hayathaven.com',
    phone: '+880 1618-889900',
    password: '123456',
    role: 'Manager',
    allowedModules: [
      'dashboard',
      'customers',
      'suppliers',
      'customer_payments',
      'supplier_payments',
      'expenses',
      'customer_ledger',
      'supplier_ledger',
      'profit_report',
      'sales_report',
      'user_reports',
      'purchase_report',
      'due_report',
      'invoice_print',
    ],
    canDelete: true,
    status: 'Active',
    designation: 'Accounts Manager',
    joiningDate: '2022-10-10',
    nidNumber: '1992264829103948',
    documentType: 'NID',
  },
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Hayat Haven (হায়াত হেভেন)',
  businessType: 'Customized Gift Items & Lifestyle Accessories',
  currency: 'BDT',
  country: 'Bangladesh',
  logoUrl: '/logo.jpg',
  address: 'House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh',
  phone: '+880 1711-889900',
  email: 'hayathaven7@gmail.com',
  taxId: '',
  bankDetails: 'Dutch-Bangla Bank PLC, Uttara Branch, Account: Hayat Haven, A/C: 110-120-998877 | bKash/Nagad Merchant: +8801711889900',
  termsAndConditions: '1. Advance 50% deposit required for custom name engraving or photo printing.\n2. Non-refundable once engraving or photo printing has commenced.\n3. Delivery time: 24-48 hours in Dhaka, 3-4 days nationwide via courier.',
  facebookPageUrl: 'https://www.facebook.com/hayathaven7',
  enableAutoSms: true,
  smsSenderId: 'HayatHaven',
  smsApiKey: 'HH-SMS-GATEWAY-KEY-9988',
  smsTemplate: 'প্রিয় {customer_name}, Hayat Haven-এ কেনাকাটার জন্য ধন্যবাদ! আপনার মেমো নং: {memo_id}, মোট বিল: ৳{grand_total}। পেজ লিঙ্ক: fb.com/hayathaven7',
  enableAutoPrintOnSave: true,
  defaultPaperSize: 'pos3in',
  defaultPrinterMode: 'standard',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'CAT-100', name: 'Customized Leather & Combos (কাস্টমাইজড ওয়ালেট ও কম্বো)', description: 'Name Engraved Leather Wallets, Keychains, Belts & Executive Combo Boxes', status: 'Active' },
  { id: 'CAT-101', name: 'Customized Photo Frames & Wooden Plaques (উডেন প্লাক ও ফটো ফ্রেম)', description: 'Laser Engraved Wooden Plaques, Photo Frames & Memories Plaques', status: 'Active' },
  { id: 'CAT-102', name: 'Customized 3D Acrylic & Night Lamps (এক্রিলিক ৩ডি লাইট ল্যাম্প)', description: 'Acrylic Photo Night Light Lamps, LED Name Displays & Couple Lamps', status: 'Active' },
  { id: 'CAT-103', name: 'Customized Drinkware & Magic Mugs (কাস্টমাইজড মগ ও ভ্যাকুয়াম ফ্লাস্ক)', description: 'Color Changing Photo Magic Mugs, Stainless Vacuum Bottles & Tumblers', status: 'Active' },
  { id: 'CAT-104', name: 'Customized Pens, Notebooks & Corporate Sets (মেটাল কলম ও ডায়েরি)', description: 'Engraved Metal Fountain Pens, Leatherette Diaries & Executive Gift Sets', status: 'Active' },
  { id: 'CAT-105', name: 'Customized Cushions & Apparel (কাস্টমাইজড কুশন ও কাপল ড্রেস)', description: 'Custom Picture Cushion Pillows, Couple T-Shirts & Custom Accessories', status: 'Active' },
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'BRD-101', name: 'Hayat Haven Crafts', countryOfOrigin: 'Bangladesh', status: 'Active' },
  { id: 'BRD-102', name: 'Haven Engraved Collection', countryOfOrigin: 'Bangladesh', status: 'Active' },
  { id: 'BRD-103', name: 'Luxe Custom Gifts', countryOfOrigin: 'Bangladesh', status: 'Active' },
  { id: 'BRD-104', name: 'Artisan Laser Studio', countryOfOrigin: 'Bangladesh', status: 'Active' },
];

// Helper data arrays for generation
const FIRST_NAMES = ['Shakil', 'Tanvir', 'Farhan', 'Nusrat', 'Tahmina', 'Kamal', 'Rafiq', 'Sharmin', 'Arafat', 'Anika', 'Mehedi', 'Sabbir', 'Nayeem', 'Rina', 'Mahfuz', 'Tariq', 'Sadia', 'Sultana', 'Jashim', 'Kabir'];
const LAST_NAMES = ['Ahmed', 'Hossain', 'Rahman', 'Sultana', 'Akter', 'Islam', 'Chowdhury', 'Khan', 'Miah', 'Jahan'];
const AREAS = ['Uttara, Dhaka', 'Gulshan 2, Dhaka', 'Dhanmondi, Dhaka', 'Mirpur 10, Dhaka', 'Banani, Dhaka', 'Zindabazar, Sylhet', 'Agrabad, Chittagong', 'Mymensingh Sadar', 'Rajshahi City', 'Khulna Sadar'];

// 1. Generate 20 Suppliers
export const INITIAL_SUPPLIERS: Supplier[] = Array.from({ length: 20 }, (_, i) => {
  const num = 1001 + i;
  return {
    id: `SUP-${num}`,
    name: `Supplier ${i + 1} - ${['Leather Raw BD', 'Laser Acrylic Studio', 'Woodcraft Blank Supplies', 'Packaging & Boxes Hub', 'Engraving Metal Co.'][i % 5]}`,
    contactPerson: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
    phone: `+880 1713-${(100000 + i * 11111).toString().substring(0, 6)}`,
    email: `supplier${i + 1}@bdcrafts.com`,
    address: AREAS[i % AREAS.length],
    openingBalance: 0,
    currentBalance: 0,
    status: 'Active',
  };
});

// 2. Generate 50 Customers
export const INITIAL_CUSTOMERS: Customer[] = Array.from({ length: 50 }, (_, i) => {
  const num = 1001 + i;
  const isCorporate = i % 5 === 0;
  return {
    id: `CUST-${num}`,
    name: isCorporate
      ? `Corporate Client ${i + 1} (${FIRST_NAMES[i % FIRST_NAMES.length]})`
      : `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
    phone: `+880 1819-${(200000 + i * 22222).toString().substring(0, 6)}`,
    email: `customer${i + 1}@gmail.com`,
    address: `House ${(i % 30) + 1}, Road ${(i % 15) + 1}, ${AREAS[i % AREAS.length]}`,
    type: isCorporate ? 'Wholesale' : 'Retail',
    creditLimit: isCorporate ? 100000 : 20000,
    openingBalance: 0,
    currentBalance: 0,
    status: 'Active',
  };
});

// 3. Generate 100 Products
const PRODUCT_NAMES_BASE = [
  'Customized Engraved Leather Wallet',
  'Customized Leather Keychain Combo Box',
  'Customized Wooden Engraved Photo Frame',
  'Customized 3D Acrylic Photo LED Lamp',
  'Customized Photo Print Magic Color Mug',
  'Customized Name Stainless Vacuum Flask',
  'Customized Metal Pen & Notebook Box',
  'Customized Picture Cushion Pillow',
  'Customized Engraved Metal Wallet Card',
  'Exclusive Luxury Couple Gift Box Set',
  'Customized Wooden Wall Clock with Photo',
  'Engraved Leather Passport Cover Holder',
  'Laser Cut Wooden Memory Box',
  'Acrylic Desktop LED Name Plate',
  'Custom Photo Engraved Crystal Block',
  'Custom Couple Name T-Shirt Pair',
  'Custom Engraved Metallic Flask & Pen Combo',
  'Customized Leather Belt & Wallet Box',
  'Photo Print Ceramic Mug with Gift Box',
  'Customized Leatherette Diary 2026',
];

export const INITIAL_PRODUCTS: Product[] = Array.from({ length: 100 }, (_, i) => {
  const num = 1001 + i;
  const baseName = PRODUCT_NAMES_BASE[i % PRODUCT_NAMES_BASE.length];
  const variant = `Variant ${(Math.floor(i / PRODUCT_NAMES_BASE.length) + 1)}`;
  const buyingPrice = 200 + (i % 15) * 80;
  const sellingPrice = buyingPrice + 350 + (i % 10) * 100;
  return {
    id: `PRD-${num}`,
    barcode: `8901000${num}`,
    imageUrl: `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80`,
    name: `${baseName} (${variant})`,
    categoryId: `CAT-${100 + (i % 6)}`,
    brandId: `BRD-${101 + (i % 4)}`,
    unit: ['Pcs', 'Set', 'Box'][i % 3],
    size: ['Standard', 'Medium', 'Large', 'Executive'][i % 4],
    buyingPrice,
    sellingPrice,
    minSellingPrice: sellingPrice - 50,
    openingStock: 80,
    currentStock: 80, // Will be updated as POs and SOs are processed below
    lowStockAlert: 10,
    status: 'Active',
  };
});

// Arrays to accumulate transactions and ledgers
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [];
export const INITIAL_SUPPLIER_LEDGERS: SupplierLedgerEntry[] = [];

export const INITIAL_SALES_ORDERS: SalesOrder[] = [];
export const INITIAL_CUSTOMER_PAYMENTS: CustomerPayment[] = [];
export const INITIAL_CUSTOMER_LEDGERS: CustomerLedgerEntry[] = [];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

// Track stock and balances in local structures during initial generation
const productStockMap = new Map<string, number>();
INITIAL_PRODUCTS.forEach((p) => productStockMap.set(p.id, p.openingStock));

const customerBalanceMap = new Map<string, number>();
INITIAL_CUSTOMERS.forEach((c) => customerBalanceMap.set(c.id, 0));

const supplierBalanceMap = new Map<string, number>();
INITIAL_SUPPLIERS.forEach((s) => supplierBalanceMap.set(s.id, 0));

// 4. Generate 100 Purchases
for (let i = 0; i < 100; i++) {
  const poNum = 10001 + i;
  const poId = `PO-${poNum}`;
  const supplier = INITIAL_SUPPLIERS[i % INITIAL_SUPPLIERS.length];
  const prod = INITIAL_PRODUCTS[(i * 3) % INITIAL_PRODUCTS.length];
  const qty = 30 + (i % 20);
  const unitCost = prod.buyingPrice;
  const subtotal = qty * unitCost;
  const discountAmount = i % 4 === 0 ? 500 : 0;
  const transportCost = 300;
  const grandTotal = subtotal - discountAmount + transportCost;
  const paidAmount = i % 3 === 0 ? grandTotal : grandTotal - 2000;
  const dueAmount = grandTotal - paidAmount;
  const pDate = `2026-06-${(1 + (i % 28)).toString().padStart(2, '0')}`;

  const items: PurchaseItem[] = [
    {
      id: `POI-${poNum}`,
      purchaseId: poId,
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      unitCost,
      totalCost: subtotal,
    },
  ];

  const purchase: Purchase = {
    id: poId,
    purchaseDate: pDate,
    supplierId: supplier.id,
    supplierName: supplier.name,
    invoiceNumber: `INV-SUP-${8000 + i}`,
    subtotal,
    discountAmount,
    transportCost,
    grandTotal,
    paidAmount,
    dueAmount,
    paymentStatus: dueAmount === 0 ? 'Paid' : dueAmount === grandTotal ? 'Unpaid' : 'Partial',
    status: 'Received',
    notes: `Raw inventory procurement PO-${poNum}`,
    items,
  };

  INITIAL_PURCHASES.push(purchase);

  // Update Stock
  const prevStock = productStockMap.get(prod.id) || 0;
  const newStock = prevStock + qty;
  productStockMap.set(prod.id, newStock);

  INITIAL_STOCK_MOVEMENTS.push({
    id: `STK-${1000 + INITIAL_STOCK_MOVEMENTS.length + 1}`,
    movementDate: `${pDate} 10:00:00`,
    productId: prod.id,
    productName: prod.name,
    type: 'Stock IN',
    quantity: qty,
    previousStock: prevStock,
    newStock,
    referenceType: 'Purchase',
    referenceId: poId,
    remarks: `Received stock from PO ${poId}`,
  });

  // Supplier Ledger Entry for PO
  const currentSupBal = supplierBalanceMap.get(supplier.id) || 0;
  const newSupBalAfterPO = currentSupBal + grandTotal;
  supplierBalanceMap.set(supplier.id, newSupBalAfterPO);

  INITIAL_SUPPLIER_LEDGERS.push({
    id: `SLG-${1000 + INITIAL_SUPPLIER_LEDGERS.length + 1}`,
    date: pDate,
    supplierId: supplier.id,
    supplierName: supplier.name,
    transactionType: 'Purchase Invoice',
    referenceId: poId,
    debit: 0,
    credit: grandTotal,
    balance: newSupBalAfterPO,
  });

  // Supplier Payment Record if paid > 0
  if (paidAmount > 0) {
    const spId = `SP-${10000 + INITIAL_SUPPLIER_PAYMENTS.length + 1}`;
    INITIAL_SUPPLIER_PAYMENTS.push({
      id: spId,
      paymentDate: pDate,
      supplierId: supplier.id,
      supplierName: supplier.name,
      purchaseId: poId,
      paymentMethod: 'Bank Transfer',
      amount: paidAmount,
      referenceNo: `TRX-SUP-${9000 + i}`,
      notes: `Payment for Purchase Invoice ${poId}`,
    });

    const finalSupBal = newSupBalAfterPO - paidAmount;
    supplierBalanceMap.set(supplier.id, finalSupBal);

    INITIAL_SUPPLIER_LEDGERS.push({
      id: `SLG-${1000 + INITIAL_SUPPLIER_LEDGERS.length + 1}`,
      date: pDate,
      supplierId: supplier.id,
      supplierName: supplier.name,
      transactionType: 'Payment Made',
      referenceId: spId,
      debit: paidAmount,
      credit: 0,
      balance: finalSupBal,
    });
  }
}

// 5. Generate 200 Sales Orders
for (let i = 0; i < 200; i++) {
  const soNum = 10001 + i;
  const soId = `SO-${soNum}`;
  const customer = INITIAL_CUSTOMERS[i % INITIAL_CUSTOMERS.length];
  const prod = INITIAL_PRODUCTS[(i * 2) % INITIAL_PRODUCTS.length];
  const qty = 2 + (i % 5);
  const unitPrice = prod.sellingPrice;
  const subtotal = qty * unitPrice;
  const discountAmount = i % 5 === 0 ? 100 : 0;
  const deliveryCharge = 100;
  const grandTotal = subtotal - discountAmount + deliveryCharge;
  const advancePaid = i % 4 === 0 ? grandTotal : grandTotal - 500;
  const dueAmount = grandTotal - advancePaid;
  const sDate = `2026-07-${(1 + (i % 28)).toString().padStart(2, '0')}`;
  const profitAmount = (unitPrice - prod.buyingPrice) * qty;

  const items: SalesOrderItem[] = [
    {
      id: `SOI-${soNum}`,
      orderId: soId,
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      unitPrice,
      totalPrice: subtotal,
      profitAmount,
    },
  ];

  const salesOrder: SalesOrder[] = [
    {
      id: soId,
      orderDate: sDate,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      orderType: customer.type === 'Wholesale' ? 'Wholesale' : 'Retail',
      subtotal,
      discountAmount,
      deliveryCharge,
      grandTotal,
      advancePaid,
      dueAmount,
      paymentStatus: dueAmount === 0 ? 'Paid' : dueAmount === grandTotal ? 'Unpaid' : 'Partial',
      deliveryStatus: 'Delivered',
      notes: `Customer Order SO-${soNum}`,
      createdBy: 'admin@hayathaven.com',
      totalProfit: profitAmount,
      items,
    },
  ];

  INITIAL_SALES_ORDERS.push(salesOrder[0]);

  // Update Stock
  const prevStock = productStockMap.get(prod.id) || 0;
  const newStock = Math.max(0, prevStock - qty);
  productStockMap.set(prod.id, newStock);

  INITIAL_STOCK_MOVEMENTS.push({
    id: `STK-${1000 + INITIAL_STOCK_MOVEMENTS.length + 1}`,
    movementDate: `${sDate} 14:30:00`,
    productId: prod.id,
    productName: prod.name,
    type: 'Stock OUT',
    quantity: qty,
    previousStock: prevStock,
    newStock,
    referenceType: 'Sales Order',
    referenceId: soId,
    remarks: `Sold in Sales Order ${soId}`,
  });

  // Customer Ledger Entry for SO
  const currentCustBal = customerBalanceMap.get(customer.id) || 0;
  const newCustBalAfterSO = currentCustBal + grandTotal;
  customerBalanceMap.set(customer.id, newCustBalAfterSO);

  INITIAL_CUSTOMER_LEDGERS.push({
    id: `CLG-${1000 + INITIAL_CUSTOMER_LEDGERS.length + 1}`,
    date: sDate,
    customerId: customer.id,
    customerName: customer.name,
    transactionType: 'Sales Invoice',
    referenceId: soId,
    debit: grandTotal,
    credit: 0,
    balance: newCustBalAfterSO,
  });

  // Customer Payment Record if advancePaid > 0
  if (advancePaid > 0) {
    const cpId = `CP-${10000 + INITIAL_CUSTOMER_PAYMENTS.length + 1}`;
    INITIAL_CUSTOMER_PAYMENTS.push({
      id: cpId,
      paymentDate: sDate,
      customerId: customer.id,
      customerName: customer.name,
      orderId: soId,
      paymentMethod: i % 2 === 0 ? 'bKash' : 'Cash',
      amount: advancePaid,
      referenceNo: `BK-${7000 + i}`,
      notes: `Advance payment for order ${soId}`,
    });

    const finalCustBal = newCustBalAfterSO - advancePaid;
    customerBalanceMap.set(customer.id, finalCustBal);

    INITIAL_CUSTOMER_LEDGERS.push({
      id: `CLG-${1000 + INITIAL_CUSTOMER_LEDGERS.length + 1}`,
      date: sDate,
      customerId: customer.id,
      customerName: customer.name,
      transactionType: 'Payment Received',
      referenceId: cpId,
      debit: 0,
      credit: advancePaid,
      balance: finalCustBal,
    });
  }
}

// Synchronize currentStock to INITIAL_PRODUCTS array
INITIAL_PRODUCTS.forEach((p) => {
  p.currentStock = productStockMap.get(p.id) ?? p.openingStock;
});

// Synchronize currentBalance to INITIAL_CUSTOMERS array
INITIAL_CUSTOMERS.forEach((c) => {
  c.currentBalance = customerBalanceMap.get(c.id) ?? 0;
});

// Synchronize currentBalance to INITIAL_SUPPLIERS array
INITIAL_SUPPLIERS.forEach((s) => {
  s.currentBalance = supplierBalanceMap.get(s.id) ?? 0;
});

// 6. Generate 20 Operating Expenses
const EXPENSE_DESCS = [
  { cat: 'Rent', desc: 'Uttara Workshop & Showroom Monthly Rent', amount: 25000 },
  { cat: 'Salary', desc: 'Staff Monthly Salary Payment (July 2026)', amount: 45000 },
  { cat: 'Utilities', desc: 'Electricity & Fiber Internet Bill', amount: 4200 },
  { cat: 'Marketing', desc: 'Facebook Page Sponsored Ads & Video Boost', amount: 8500 },
  { cat: 'Maintenance', desc: 'Laser Engraving Machine Mirror Calibration', amount: 3500 },
  { cat: 'Transport', desc: 'Raw Material Local Carrying & Cartage', amount: 2200 },
  { cat: 'Misc', desc: 'Workshop Tea, Coffee & Guest Refreshments', amount: 1800 },
  { cat: 'Marketing', desc: 'Courier Packaging Tape & Customized Boxes', amount: 6500 },
];

export const INITIAL_EXPENSES: Expense[] = Array.from({ length: 20 }, (_, i) => {
  const item = EXPENSE_DESCS[i % EXPENSE_DESCS.length];
  return {
    id: `EXP-${10001 + i}`,
    expenseDate: `2026-07-${(1 + (i % 28)).toString().padStart(2, '0')}`,
    category: item.cat as Expense['category'],
    amount: item.amount + (i % 5) * 200,
    paymentMethod: 'Bank Transfer',
    description: `${item.desc} (Batch ${i + 1})`,
    referenceNo: `EXP-REF-${500 + i}`,
  };
});

// 7. Quotations & Pending Orders
export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'QT-1001',
    quotationDate: '2026-07-20',
    validUntil: '2026-08-05',
    customerId: 'CUST-1002',
    customerName: 'Corporate Client 1',
    customerPhone: '+880 1712-334455',
    customerAddress: 'Gulshan 2, Dhaka',
    subtotal: 23000,
    discountAmount: 1000,
    deliveryCharge: 500,
    grandTotal: 22500,
    status: 'Sent',
    notes: 'Quotation for 20 sets of Corporate Name Engraved Metal Pen & Notebook Sets.',
    termsConditions: '1. Quotation valid for 15 days.\n2. 50% advance upon PO approval.',
    createdBy: 'Senior Admin (Owner)',
    items: [
      {
        id: 'qti-1',
        quotationId: 'QT-1001',
        productId: 'PRD-1007',
        productName: 'Customized Metal Pen & Notebook Box',
        quantity: 20,
        unitPrice: 1150,
        totalPrice: 23000,
      },
    ],
  },
];

export const INITIAL_PENDING_ORDERS: PendingOrder[] = [
  {
    id: 'PEND-1001',
    channel: 'WhatsApp',
    customerName: 'মোঃ তানভীর হাসান (Tanvir Hasan)',
    customerPhone: '+880 1711-223344',
    customerAddress: 'বাসা ৪২, রোড ৭, সেক্টর ৪, উত্তরা, ঢাকা',
    items: [
      {
        productId: 'PRD-1001',
        productName: 'Customized Engraved Leather Wallet (Variant 1)',
        quantity: 1,
        unitPrice: 1450,
        totalPrice: 1450,
      },
    ],
    subtotal: 1450,
    deliveryCharge: 100,
    grandTotal: 1550,
    status: 'Pending',
    createdAt: '2026-07-22 14:30',
    aiNotes: 'WhatsApp Bot parsed gift order. Name to engrave: "Tanvir Hasan". Delivery to Uttara.',
    chatHistory: [
      { id: 'm1', sender: 'customer', text: 'আসসালামু আলাইকুম, ওয়ালেটে নাম খোদাই করে দেয়া যাবে?', time: '14:25' },
      { id: 'm2', sender: 'bot', text: 'ওয়ালাইকুম আসসালাম! জ্বী অবশ্যই, নাম খোদাই করে দেওয়া হয়। মূল্য ১,৪৫০ টাকা।', time: '14:25' },
    ],
  },
];
