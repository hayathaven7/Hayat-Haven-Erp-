export interface CompanySettings {
  companyName: string;
  businessType: string;
  currency: string;
  country: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  bankDetails: string;
  termsAndConditions: string;
  facebookPageUrl?: string;
  enableAutoSms?: boolean;
  smsSenderId?: string;
  smsApiKey?: string;
  smsTemplate?: string;
  enableAutoPrintOnSave?: boolean;
  defaultPaperSize?: 'a4' | 'a5' | 'pos3in' | 'pos2in';
  defaultPrinterMode?: 'standard' | 'bluetooth' | 'rawbt';
  defaultPrinterName?: string;
  customWebsiteDomain?: string;
}

export interface Customer {
  id: string; // CUST-1001
  name: string;
  phone: string;
  email: string;
  address: string;
  type: 'Retail' | 'Wholesale';
  creditLimit: number;
  openingBalance: number;
  currentBalance: number;
  rewardPoints?: number;
  status: 'Active' | 'Inactive';
}

export interface Supplier {
  id: string; // SUP-1001
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
}

export interface Category {
  id: string; // CAT-101
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Brand {
  id: string; // BRD-101
  name: string;
  countryOfOrigin: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string; // PRD-1001
  barcode: string;
  imageUrl: string;
  name: string;
  categoryId: string;
  brandId: string;
  unit: string; // Pcs, Kg, Box, Ctn, Mtr
  size: string;
  buyingPrice: number;
  sellingPrice: number;
  minSellingPrice: number;
  openingStock: number;
  currentStock: number;
  lowStockAlert: number;
  status: 'Active' | 'Discontinued';
}

export interface SalesOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  profitAmount: number;
}

export interface SalesOrder {
  id: string; // SO-10001
  orderDate: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryAddress?: string;
  orderType: 'Retail' | 'Wholesale' | 'Online' | 'AI Bot';
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  advancePaid: number;
  dueAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Voided';
  paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card' | 'Due / Credit' | string;
  deliveryStatus: 'Pending' | 'Accepted' | 'Processing' | 'Send to Courier' | 'Delivered' | 'Cancelled' | 'Voided';
  courierService?: string;
  notes: string;
  voidReason?: string;
  createdBy: string;
  totalProfit?: number;
  syncedToServer?: boolean;
  offlineCreated?: boolean;
  items: SalesOrderItem[];
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string; // QT-1001
  quotationDate: string;
  validUntil: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  courierService?: string;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted' | 'Expired';
  notes: string;
  termsConditions?: string;
  createdBy: string;
  convertedOrderId?: string;
  items: QuotationItem[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string; // PO-10001
  purchaseDate: string;
  supplierId: string;
  supplierName?: string;
  invoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  transportCost: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Voided';
  status: 'Received' | 'Pending' | 'Cancelled' | 'Voided';
  notes: string;
  voidReason?: string;
  items: PurchaseItem[];
}

export interface CustomerPayment {
  id: string; // CP-10001
  paymentDate: string;
  customerId: string;
  customerName?: string;
  orderId?: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card';
  amount: number;
  referenceNo: string;
  notes: string;
}

export interface SupplierPayment {
  id: string; // SP-10001
  paymentDate: string;
  supplierId: string;
  supplierName?: string;
  purchaseId?: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card';
  amount: number;
  referenceNo: string;
  notes: string;
}

export interface Expense {
  id: string; // EXP-10001
  expenseDate: string;
  category: 'Rent' | 'Utilities' | 'Salary' | 'Transport' | 'Marketing' | 'Maintenance' | 'Misc';
  amount: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card';
  description: string;
  referenceNo: string;
}

export interface StockMovement {
  id: string; // STK-10001
  movementDate: string;
  movementType?: string;
  productId: string;
  productName?: string;
  type: 'Stock IN' | 'Stock OUT' | 'Adjustment' | 'Return';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: 'Sales Order' | 'Purchase' | 'Manual Adjustment';
  referenceId: string;
  remarks: string;
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  entryDate?: string;
  customerId: string;
  customerName?: string;
  transactionType: 'Sales Invoice' | 'Payment Received' | 'Opening Balance' | 'Adjustment';
  referenceId: string;
  particulars?: string;
  debit: number; // Invoiced (+)
  credit: number; // Paid (-)
  balance: number;
  runningBalance?: number;
}

export interface SupplierLedgerEntry {
  id: string;
  date: string;
  entryDate?: string;
  supplierId: string;
  supplierName?: string;
  transactionType: 'Purchase Invoice' | 'Payment Made' | 'Opening Balance' | 'Adjustment';
  referenceId: string;
  particulars?: string;
  debit: number; // Paid (-)
  credit: number; // Invoiced (+)
  balance: number;
  runningBalance?: number;
}

// AppSheet / Excel Schema Specification interface
export interface TableColumnSpec {
  sheetName: string;
  columnName: string;
  dataType: string; // Text, Number, Decimal, Ref, Price, Image, Date, Enum, Formula
  isPrimaryKey: boolean;
  foreignKeys?: string;
  refRelationship?: string;
  isPartOfRelationship?: boolean;
  required: boolean;
  initialValue: string;
  validIf: string;
  suggestedFormula: string;
  appSheetType: string;
}

export interface TableSchemaSpec {
  sheetName: string;
  description: string;
  columns: TableColumnSpec[];
}

export type UserRole = 'Admin' | 'Manager' | 'Executive';

export interface UserAccount {
  id: string; // USR-1001
  username?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  allowedModules: ModuleType[];
  canDelete: boolean;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  nidNumber?: string;
  documentType?: 'NID' | 'BirthCertificate' | 'Passport';
  documentUrl?: string; // photo/file base64 or URL
  designation?: string;
  joiningDate?: string;
}

export interface PendingOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'bot';
  text: string;
  time: string;
}

export interface PendingOrder {
  id: string; // PEND-1001
  channel: 'WhatsApp' | 'Facebook Messenger' | 'Website Chat';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: PendingOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  aiNotes?: string;
  chatHistory: ChatMessage[];
}

export type ModuleType =
  | 'company_settings'
  | 'dashboard'
  | 'customers'
  | 'suppliers'
  | 'categories'
  | 'brands'
  | 'products'
  | 'sales_orders'
  | 'sales_order_items'
  | 'purchases'
  | 'purchase_items'
  | 'customer_payments'
  | 'supplier_payments'
  | 'expenses'
  | 'stock_movement'
  | 'customer_ledger'
  | 'supplier_ledger'
  | 'profit_report'
  | 'sales_report'
  | 'purchase_report'
  | 'stock_report'
  | 'due_report'
  | 'invoice_print'
  | 'quotations'
  | 'app_settings'
  | 'user_roles'
  | 'user_reports'
  | 'ai_bot'
  | 'pending_orders'
  | 'printer_settings'
  | 'ecommerce_store';
