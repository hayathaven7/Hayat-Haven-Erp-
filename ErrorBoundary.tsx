import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
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
  StockMovement,
  Supplier,
  SupplierLedgerEntry,
  SupplierPayment,
  UserAccount,
} from '../types/erp';
import {
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_CUSTOMER_LEDGERS,
  INITIAL_CUSTOMER_PAYMENTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_PENDING_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASES,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SUPPLIER_LEDGERS,
  INITIAL_SUPPLIER_PAYMENTS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
} from '../data/initialData';
import { generateERPWorkbook } from '../utils/excelGenerator';

interface ERPContextType {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  companySettings: CompanySettings;
  updateCompanySettings: (settings: CompanySettings | Partial<CompanySettings>) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'currentBalance'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'currentBalance'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  brands: Brand[];
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  deleteBrand: (id: string) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'currentStock'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id'>) => void;
  updateUser: (user: UserAccount) => void;
  deleteUser: (id: string) => void;
  updateUserPassword: (userId: string, currentPass: string, newPass: string) => { success: boolean; message: string };
  activeUser: UserAccount;
  switchUser: (id: string) => void;
  switchUserWithPassword: (userId: string, passwordInput: string) => { success: boolean; message: string };
  isAuthenticated: boolean;
  login: (userIdOrUsernameOrEmail: string, password: string) => boolean;
  logout: () => void;
  salesOrders: SalesOrder[];
  createSalesOrder: (
    order: Omit<
      SalesOrder,
      'id' | 'orderDate' | 'dueAmount' | 'paymentStatus' | 'items' | 'subtotal' | 'grandTotal' | 'deliveryStatus'
    > & {
      items: { productId: string; quantity: number; unitPrice: number }[];
      subtotal?: number;
      grandTotal?: number;
      deliveryStatus?: SalesOrder['deliveryStatus'];
    }
  ) => SalesOrder;
  deleteSalesOrder: (id: string) => void;
  voidSalesOrder: (id: string, reason: string) => void;
  purchases: Purchase[];
  createPurchase: (
    purchase: Omit<
      Purchase,
      'id' | 'purchaseDate' | 'dueAmount' | 'paymentStatus' | 'items' | 'subtotal' | 'grandTotal'
    > & {
      items: { productId: string; quantity: number; unitCost: number }[];
      subtotal?: number;
      grandTotal?: number;
    }
  ) => Purchase;
  deletePurchase: (id: string) => void;
  voidPurchase: (id: string, reason: string) => void;
  customerPayments: CustomerPayment[];
  recordCustomerPayment: (payment: Omit<CustomerPayment, 'id' | 'paymentDate'>) => void;
  deleteCustomerPayment: (id: string) => void;
  supplierPayments: SupplierPayment[];
  recordSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'paymentDate'>) => void;
  deleteSupplierPayment: (id: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'expenseDate'>) => void;
  deleteExpense: (id: string) => void;
  stockMovements: StockMovement[];
  addStockAdjustment: (adj: { productId: string; type: 'Stock IN' | 'Stock OUT' | 'Adjustment'; quantity: number; remarks: string }) => void;
  addStockMovement: (data: { productId: string; movementType: string; quantity: number; referenceId: string; remarks: string }) => void;
  deleteStockMovement: (id: string) => void;
  customerLedgers: CustomerLedgerEntry[];
  supplierLedgers: SupplierLedgerEntry[];
  deleteCustomerLedgerEntry: (id: string) => void;
  deleteSupplierLedgerEntry: (id: string) => void;
  selectedCustomerIdForLedger: string;
  setSelectedCustomerIdForLedger: (id: string) => void;
  selectedSupplierIdForLedger: string;
  setSelectedSupplierIdForLedger: (id: string) => void;
  downloadExcel: () => Promise<void>;
  selectedPrintOrder: SalesOrder | null;
  setSelectedPrintOrder: (order: SalesOrder | null) => void;
  quotations: Quotation[];
  addQuotation: (q: Omit<Quotation, 'id' | 'quotationDate'>) => Quotation;
  updateQuotation: (q: Quotation) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToOrder: (id: string) => SalesOrder | null;
  selectedPrintQuotation: Quotation | null;
  setSelectedPrintQuotation: (q: Quotation | null) => void;
  markOrderPaid: (orderId: string, customAmount?: number) => void;
  markOrderDelivered: (orderId: string) => void;
  updateSalesOrderStatus: (orderId: string, deliveryStatus: SalesOrder['deliveryStatus'], courierService?: string) => void;
  bulkUpdateSalesOrderStatus: (orderIds: string[], deliveryStatus: SalesOrder['deliveryStatus'], courierService?: string) => void;
  updateSalesOrderItems: (orderId: string, newItemsInput: { productId: string; quantity: number; unitPrice: number }[]) => void;
  pendingOrders: PendingOrder[];
  resetFullApp: () => void;
  addPendingOrder: (order: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>) => PendingOrder;
  approvePendingOrder: (id: string) => SalesOrder | null;
  rejectPendingOrder: (id: string) => void;
  deletePendingOrder: (id: string) => void;
  batchDeletePendingOrders: (ids: string[]) => void;
  batchApprovePendingOrders: (ids: string[]) => SalesOrder[];
  batchDeleteSalesOrders: (ids: string[]) => void;
  batchDeletePurchases: (ids: string[]) => void;
  batchDeleteCustomers: (ids: string[]) => void;
  batchDeleteSuppliers: (ids: string[]) => void;
  batchDeleteProducts: (ids: string[]) => void;
  batchDeleteExpenses: (ids: string[]) => void;
  batchDeleteCustomerPayments: (ids: string[]) => void;
  batchDeleteSupplierPayments: (ids: string[]) => void;
  batchDeleteCustomerLedgers: (ids: string[]) => void;
  batchDeleteSupplierLedgers: (ids: string[]) => void;
  resetFullERPData: (adminPassword: string) => { success: boolean; message: string };
  // PWA Offline & Auto Server Sync
  isOnline: boolean;
  pendingOfflineSyncCount: number;
  lastSyncedTime: string | null;
  isSyncing: boolean;
  syncOfflineDataWithServer: () => Promise<{ success: boolean; message: string; syncedCount: number }>;
  canInstallPWA: boolean;
  promptInstallPWA: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return fallback;
}

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModuleState] = useState<ModuleType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const setActiveModule = (module: ModuleType) => {
    setActiveModuleState(module);
    setMobileSidebarOpen(false); // Auto close sidebar drawer on mobile view after selecting module
  };
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => loadStorage('erp_company_settings', INITIAL_COMPANY_SETTINGS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadStorage('erp_customers', INITIAL_CUSTOMERS));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStorage('erp_suppliers', INITIAL_SUPPLIERS));
  const [categories, setCategories] = useState<Category[]>(() => loadStorage('erp_categories', INITIAL_CATEGORIES));
  const [brands, setBrands] = useState<Brand[]>(() => loadStorage('erp_brands', INITIAL_BRANDS));
  const [products, setProducts] = useState<Product[]>(() => loadStorage('erp_products', INITIAL_PRODUCTS));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => loadStorage('erp_sales_orders', INITIAL_SALES_ORDERS));
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadStorage('erp_purchases', INITIAL_PURCHASES));
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => loadStorage('erp_customer_payments', INITIAL_CUSTOMER_PAYMENTS));
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => loadStorage('erp_supplier_payments', INITIAL_SUPPLIER_PAYMENTS));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStorage('erp_expenses', INITIAL_EXPENSES));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadStorage('erp_stock_movements', INITIAL_STOCK_MOVEMENTS));
  const [customerLedgers, setCustomerLedgers] = useState<CustomerLedgerEntry[]>(() => loadStorage('erp_customer_ledgers', INITIAL_CUSTOMER_LEDGERS));
  const [supplierLedgers, setSupplierLedgers] = useState<SupplierLedgerEntry[]>(() => loadStorage('erp_supplier_ledgers', INITIAL_SUPPLIER_LEDGERS));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadStorage('erp_quotations', INITIAL_QUOTATIONS));
  const [selectedPrintQuotation, setSelectedPrintQuotation] = useState<Quotation | null>(INITIAL_QUOTATIONS[0] || null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(() => loadStorage('erp_pending_orders', INITIAL_PENDING_ORDERS));
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<SalesOrder | null>(INITIAL_SALES_ORDERS[0] || null);
  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] = useState<string>(INITIAL_CUSTOMERS[0]?.id || 'CUST-1001');
  const [selectedSupplierIdForLedger, setSelectedSupplierIdForLedger] = useState<string>(INITIAL_SUPPLIERS[0]?.id || 'SUP-2001');

  // Offline Mode & PWA Auto Sync States
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingOfflineSyncCount, setPendingOfflineSyncCount] = useState<number>(0);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    try { return localStorage.getItem('erp_last_synced_time'); } catch(e) { return null; }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState<boolean>(false);

  // Helper to refresh offline pending sync count
  const updateOfflineSyncQueueCount = () => {
    try {
      const queueStr = localStorage.getItem('erp_offline_sync_queue');
      if (queueStr) {
        const queue = JSON.parse(queueStr);
        if (Array.isArray(queue)) {
          setPendingOfflineSyncCount(queue.length);
          return;
        }
      }
    } catch (e) {}
    setPendingOfflineSyncCount(0);
  };

  // Sync offline queued sales data with backend server
  const syncOfflineDataWithServer = async (): Promise<{ success: boolean; message: string; syncedCount: number }> => {
    if (isSyncing) return { success: false, message: 'সিঙ্কিং ইতিমধ্যে চলছে...', syncedCount: 0 };
    setIsSyncing(true);

    try {
      // Collect offline queued orders
      const queueStr = localStorage.getItem('erp_offline_sync_queue');
      const queue: SalesOrder[] = queueStr ? JSON.parse(queueStr) : [];

      const allOrdersStr = localStorage.getItem('erp_sales_orders');
      const allOrders: SalesOrder[] = allOrdersStr ? JSON.parse(allOrdersStr) : salesOrders;
      const unsyncedOrders = allOrders.filter((o: any) => o.syncedToServer === false || queue.some((q) => q.id === o.id));

      const payloadOrders = unsyncedOrders.length > 0 ? unsyncedOrders : queue;

      if (payloadOrders.length === 0) {
        setIsSyncing(false);
        const now = new Date().toLocaleTimeString();
        setLastSyncedTime(now);
        try { localStorage.setItem('erp_last_synced_time', now); } catch(e){}
        return { success: true, message: 'সব ডাটা ইতিমধ্যেই ক্লাউড সার্ভারে আপ-টু-ডেট আছে!', syncedCount: 0 };
      }

      // Send POST request to backend Express sync API
      const response = await fetch('/api/sync/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: payloadOrders }),
      });

      const data = await response.json();

      if (data.success) {
        const syncedIds: string[] = data.syncedIds || [];

        // Mark orders as synced in state
        setSalesOrders((prev) =>
          prev.map((o) => {
            if (syncedIds.includes(o.id) || payloadOrders.some((p) => p.id === o.id)) {
              return { ...o, syncedToServer: true };
            }
            return o;
          })
        );

        // Clear offline sync queue
        try {
          localStorage.removeItem('erp_offline_sync_queue');
        } catch(e) {}
        setPendingOfflineSyncCount(0);

        const now = new Date().toLocaleTimeString();
        setLastSyncedTime(now);
        try { localStorage.setItem('erp_last_synced_time', now); } catch(e){}
        setIsSyncing(false);

        return {
          success: true,
          message: `${data.syncedCount || payloadOrders.length} টি অফলাইন সেলস অর্ডার সার্ভারে সিঙ্ক ও আপডেট হয়ে গেছে!`,
          syncedCount: data.syncedCount || payloadOrders.length,
        };
      } else {
        setIsSyncing(false);
        return { success: false, message: data.message || 'সার্ভার সিঙ্ক করতে সমস্যা হয়েছে।', syncedCount: 0 };
      }
    } catch (e: any) {
      setIsSyncing(false);
      console.log('Network sync failed (Offline mode active):', e);
      return { success: false, message: 'সার্ভার পাওয়া যায়নি (অফলাইন মোড)', syncedCount: 0 };
    }
  };

  const promptInstallPWA = () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setCanInstallPWA(false);
          setDeferredInstallPrompt(null);
        }
      });
    } else {
      alert('অ্যাপটি ইতিমধ্যেই আপনার পিসি বা মোবাইলে ইন্সটল করা রয়েছে, অথবা ক্রোম ব্রাউজার মেনু থেকে "Install Application" / "Add to Home Screen" সিলেক্ট করুন।');
    }
  };

  // Event Listeners for Online/Offline & PWA Install
  React.useEffect(() => {
    // Auto-populate simulation dataset if stored products are from smaller legacy set
    try {
      const storedProds = localStorage.getItem('erp_products');
      if (!storedProds || JSON.parse(storedProds).length < 50) {
        localStorage.setItem('erp_products', JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem('erp_customers', JSON.stringify(INITIAL_CUSTOMERS));
        localStorage.setItem('erp_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
        localStorage.setItem('erp_purchases', JSON.stringify(INITIAL_PURCHASES));
        localStorage.setItem('erp_sales_orders', JSON.stringify(INITIAL_SALES_ORDERS));
        localStorage.setItem('erp_customer_payments', JSON.stringify(INITIAL_CUSTOMER_PAYMENTS));
        localStorage.setItem('erp_supplier_payments', JSON.stringify(INITIAL_SUPPLIER_PAYMENTS));
        localStorage.setItem('erp_expenses', JSON.stringify(INITIAL_EXPENSES));
        localStorage.setItem('erp_stock_movements', JSON.stringify(INITIAL_STOCK_MOVEMENTS));
        localStorage.setItem('erp_customer_ledgers', JSON.stringify(INITIAL_CUSTOMER_LEDGERS));
        localStorage.setItem('erp_supplier_ledgers', JSON.stringify(INITIAL_SUPPLIER_LEDGERS));

        setProducts(INITIAL_PRODUCTS);
        setCustomers(INITIAL_CUSTOMERS);
        setSuppliers(INITIAL_SUPPLIERS);
        setPurchases(INITIAL_PURCHASES);
        setSalesOrders(INITIAL_SALES_ORDERS);
        setCustomerPayments(INITIAL_CUSTOMER_PAYMENTS);
        setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
        setExpenses(INITIAL_EXPENSES);
        setStockMovements(INITIAL_STOCK_MOVEMENTS);
        setCustomerLedgers(INITIAL_CUSTOMER_LEDGERS);
        setSupplierLedgers(INITIAL_SUPPLIER_LEDGERS);
      }
    } catch (e) {
      console.error(e);
    }

    updateOfflineSyncQueueCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger background server sync when internet returns!
      syncOfflineDataWithServer();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setCanInstallPWA(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-persist state changes to localStorage
  React.useEffect(() => { try { localStorage.setItem('erp_company_settings', JSON.stringify(companySettings)); } catch(e){} }, [companySettings]);
  React.useEffect(() => { try { localStorage.setItem('erp_customers', JSON.stringify(customers)); } catch(e){} }, [customers]);
  React.useEffect(() => { try { localStorage.setItem('erp_suppliers', JSON.stringify(suppliers)); } catch(e){} }, [suppliers]);
  React.useEffect(() => { try { localStorage.setItem('erp_categories', JSON.stringify(categories)); } catch(e){} }, [categories]);
  React.useEffect(() => { try { localStorage.setItem('erp_brands', JSON.stringify(brands)); } catch(e){} }, [brands]);
  React.useEffect(() => { try { localStorage.setItem('erp_products', JSON.stringify(products)); } catch(e){} }, [products]);
  React.useEffect(() => { try { localStorage.setItem('erp_sales_orders', JSON.stringify(salesOrders)); } catch(e){} }, [salesOrders]);
  React.useEffect(() => { try { localStorage.setItem('erp_purchases', JSON.stringify(purchases)); } catch(e){} }, [purchases]);
  React.useEffect(() => { try { localStorage.setItem('erp_customer_payments', JSON.stringify(customerPayments)); } catch(e){} }, [customerPayments]);
  React.useEffect(() => { try { localStorage.setItem('erp_supplier_payments', JSON.stringify(supplierPayments)); } catch(e){} }, [supplierPayments]);
  React.useEffect(() => { try { localStorage.setItem('erp_expenses', JSON.stringify(expenses)); } catch(e){} }, [expenses]);
  React.useEffect(() => { try { localStorage.setItem('erp_stock_movements', JSON.stringify(stockMovements)); } catch(e){} }, [stockMovements]);
  React.useEffect(() => { try { localStorage.setItem('erp_customer_ledgers', JSON.stringify(customerLedgers)); } catch(e){} }, [customerLedgers]);
  React.useEffect(() => { try { localStorage.setItem('erp_supplier_ledgers', JSON.stringify(supplierLedgers)); } catch(e){} }, [supplierLedgers]);
  React.useEffect(() => { try { localStorage.setItem('erp_quotations', JSON.stringify(quotations)); } catch(e){} }, [quotations]);
  React.useEffect(() => { try { localStorage.setItem('erp_pending_orders', JSON.stringify(pendingOrders)); } catch(e){} }, [pendingOrders]);
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const savedUsers = localStorage.getItem('erp_users_data');
      if (savedUsers !== null) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading users from localStorage:', e);
    }
    return INITIAL_USERS;
  });

  // Persist users array whenever it is updated
  React.useEffect(() => {
    try {
      localStorage.setItem('erp_users_data', JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }, [users]);

  const [activeUser, setActiveUser] = useState<UserAccount>(() => {
    try {
      const savedActiveId = localStorage.getItem('erp_active_user_id');
      if (savedActiveId) {
        const savedUsersStr = localStorage.getItem('erp_users_data');
        const userList: UserAccount[] = savedUsersStr ? JSON.parse(savedUsersStr) : INITIAL_USERS;
        const found = userList.find((u) => u.id === savedActiveId);
        if (found) return found;
      }
    } catch (e) {
      console.error('Error restoring activeUser:', e);
    }
    return INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('erp_is_authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });

  const login = (userIdOrUsernameOrEmail: string, passwordInput: string): boolean => {
    const query = (userIdOrUsernameOrEmail || '').trim().toLowerCase();
    const target = users.find(
      (u) =>
        (u.id && u.id.toLowerCase() === query) ||
        (u.username && u.username.toLowerCase() === query) ||
        (u.email && u.email.toLowerCase() === query)
    );
    if (!target) return false;

    // Password verification
    if (target.password && target.password !== passwordInput) {
      return false;
    }

    setActiveUser(target);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('erp_active_user_id', target.id);
      localStorage.setItem('erp_is_authenticated', 'true');
    } catch (e) {
      console.error('Error saving auth session:', e);
    }
    return true;
  };

  const switchUserWithPassword = (userId: string, passwordInput: string): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'ইউজার আইডি পাওয়া যায়নি!' };
    }

    if (target.password && target.password !== passwordInput) {
      return { success: false, message: 'পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন।' };
    }

    setActiveUser(target);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('erp_active_user_id', target.id);
      localStorage.setItem('erp_is_authenticated', 'true');
    } catch (e) {
      console.error('Error saving active user session:', e);
    }
    return { success: true, message: `সফলভাবে ${target.name} একাউন্টে সুইচ করা হয়েছে!` };
  };

  const updateUserPassword = (userId: string, currentPass: string, newPass: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'ব্যবহারকারী পাওয়া যায়নি!' };
    }
    if (targetUser.password && targetUser.password !== currentPass) {
      return { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়!' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'নতুন পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে!' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );

    if (activeUser.id === userId) {
      setActiveUser((prev) => ({ ...prev, password: newPass }));
    }

    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('erp_is_authenticated');
      localStorage.removeItem('erp_active_user_id');
    } catch (e) {
      console.error('Error removing auth session:', e);
    }
  };

  const updateCompanySettings = (settings: CompanySettings | Partial<CompanySettings>) =>
    setCompanySettings((prev) => ({ ...prev, ...settings }));

  const addCustomer = (c: Omit<Customer, 'id' | 'currentBalance'>): Customer => {
    const newCust: Customer = {
      ...c,
      id: `CUST-${1000 + customers.length + 1}`,
      currentBalance: c.openingBalance,
    };
    setCustomers((prev) => [...prev, newCust]);
    // Add opening balance ledger
    if (c.openingBalance > 0) {
      setCustomerLedgers((prev) => [
        ...prev,
        {
          id: `CLG-${1000 + prev.length + 1}`,
          date: new Date().toISOString().split('T')[0],
          customerId: newCust.id,
          customerName: newCust.name,
          transactionType: 'Opening Balance',
          referenceId: 'INIT-BAL',
          debit: c.openingBalance,
          credit: 0,
          balance: c.openingBalance,
        },
      ]);
    }
    return newCust;
  };

  const updateCustomer = (c: Customer) => {
    setCustomers((prev) => prev.map((item) => (item.id === c.id ? c : item)));
  };

  const deleteCustomer = (id: string) => {
    const hasSales = salesOrders.some((so) => so.customerId === id && so.deliveryStatus !== 'Voided');
    const hasPayments = customerPayments.some((cp) => cp.customerId === id);
    const hasLedgers = customerLedgers.some((cl) => cl.customerId === id && ((cl.debit || 0) > 0 || (cl.credit || 0) > 0));
    const targetCust = customers.find((c) => c.id === id);
    const hasBalance = targetCust ? targetCust.currentBalance !== 0 : false;

    if (hasSales || hasPayments || hasLedgers || hasBalance) {
      alert('এই কাস্টমারের বিক্রয়, পেমেন্ট বা লেজার ট্রানজেকশনের হিস্টোরি রয়েছে! লেনদেন থাকা কাস্টমার ডিলিট করা সম্ভব নয়।');
      return;
    }
    setCustomers((prev) => prev.filter((item) => item.id !== id));
  };

  const addSupplier = (s: Omit<Supplier, 'id' | 'currentBalance'>) => {
    const newSup: Supplier = {
      ...s,
      id: `SUP-${1000 + suppliers.length + 1}`,
      currentBalance: s.openingBalance,
    };
    setSuppliers((prev) => [...prev, newSup]);
    if (s.openingBalance > 0) {
      setSupplierLedgers((prev) => [
        ...prev,
        {
          id: `SLG-${1000 + prev.length + 1}`,
          date: new Date().toISOString().split('T')[0],
          supplierId: newSup.id,
          supplierName: newSup.name,
          transactionType: 'Opening Balance',
          referenceId: 'INIT-SUP-BAL',
          debit: 0,
          credit: s.openingBalance,
          balance: s.openingBalance,
        },
      ]);
    }
  };

  const updateSupplier = (s: Supplier) => {
    setSuppliers((prev) => prev.map((item) => (item.id === s.id ? s : item)));
  };

  const deleteSupplier = (id: string) => {
    const hasPurchases = purchases.some((p) => p.supplierId === id && p.status !== 'Voided');
    const hasPayments = supplierPayments.some((sp) => sp.supplierId === id);
    const hasLedgers = supplierLedgers.some((sl) => sl.supplierId === id && ((sl.debit || 0) > 0 || (sl.credit || 0) > 0));
    const targetSup = suppliers.find((s) => s.id === id);
    const hasBalance = targetSup ? targetSup.currentBalance !== 0 : false;

    if (hasPurchases || hasPayments || hasLedgers || hasBalance) {
      alert('এই সাপ্লায়ারের ক্রয়, পেমেন্ট বা লেজার ট্রানজেকশনের হিস্টোরি রয়েছে! লেনদেন থাকা সাপ্লায়ার ডিলিট করা সম্ভব নয়।');
      return;
    }
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    setCategories((prev) => [...prev, { ...cat, id: `CAT-${100 + prev.length + 1}` }]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
  };

  const addBrand = (b: Omit<Brand, 'id'>) => {
    setBrands((prev) => [...prev, { ...b, id: `BRD-${100 + prev.length + 1}` }]);
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((item) => item.id !== id));
  };

  const addProduct = (p: Omit<Product, 'id' | 'currentStock'>) => {
    if (p.barcode && p.barcode.trim()) {
      const trimmed = p.barcode.trim().toLowerCase();
      const duplicate = products.find((item) => item.barcode && item.barcode.trim().toLowerCase() === trimmed);
      if (duplicate) {
        alert(`বারকোড ত্রুটি: "${p.barcode}" বারকোডটি ইতোমধ্যে "${duplicate.name}" পণ্যে ব্যবহৃত হচ্ছে! ইউনিক বারকোড ব্যবহার করুন।`);
        throw new Error(`Duplicate barcode: ${p.barcode}`);
      }
    }
    const newProd: Product = {
      ...p,
      id: `PRD-${1000 + products.length + 1}`,
      currentStock: p.openingStock,
    };
    setProducts((prev) => [...prev, newProd]);
    // Record initial stock movement
    if (p.openingStock > 0) {
      setStockMovements((prev) => [
        ...prev,
        {
          id: `STK-${1000 + prev.length + 1}`,
          movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          productId: newProd.id,
          productName: newProd.name,
          type: 'Stock IN',
          quantity: p.openingStock,
          previousStock: 0,
          newStock: p.openingStock,
          referenceType: 'Manual Adjustment',
          referenceId: 'OPENING-STOCK',
          remarks: 'Initial stock entry',
        },
      ]);
    }
  };

  const updateProduct = (p: Product) => {
    if (p.barcode && p.barcode.trim()) {
      const trimmed = p.barcode.trim().toLowerCase();
      const duplicate = products.find((item) => item.id !== p.id && item.barcode && item.barcode.trim().toLowerCase() === trimmed);
      if (duplicate) {
        alert(`বারকোড ত্রুটি: "${p.barcode}" বারকোডটি ইতোমধ্যে "${duplicate.name}" পণ্যে ব্যবহৃত হচ্ছে!`);
        throw new Error(`Duplicate barcode: ${p.barcode}`);
      }
    }
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const addUser = (u: Omit<UserAccount, 'id'>) => {
    const newUser: UserAccount = {
      ...u,
      id: `USR-${1000 + users.length + 1}`,
    };
    setUsers((prev) => {
      const updated = [...prev, newUser];
      try {
        localStorage.setItem('erp_users_data', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving users to localStorage:', e);
      }
      return updated;
    });
  };

  const updateUser = (u: UserAccount) => {
    setUsers((prev) => {
      const updated = prev.map((item) => (item.id === u.id ? u : item));
      try {
        localStorage.setItem('erp_users_data', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving users to localStorage:', e);
      }
      return updated;
    });
    if (activeUser && activeUser.id === u.id) {
      setActiveUser(u);
    }
  };

  const deleteUser = (id: string) => {
    const remainingUsers = users.filter((item) => item.id !== id);
    setUsers(remainingUsers);
    try {
      localStorage.setItem('erp_users_data', JSON.stringify(remainingUsers));
    } catch (e) {
      console.error('Error saving updated users to localStorage:', e);
    }

    // If activeUser was deleted, switch active user or handle logout
    if (activeUser && activeUser.id === id) {
      if (remainingUsers.length > 0) {
        setActiveUser(remainingUsers[0]);
        try {
          localStorage.setItem('erp_active_user_id', remainingUsers[0].id);
        } catch (e) {
          console.error('Error saving active user to localStorage:', e);
        }
      } else {
        setIsAuthenticated(false);
        try {
          localStorage.removeItem('erp_is_authenticated');
          localStorage.removeItem('erp_active_user_id');
        } catch (e) {
          console.error('Error removing auth session:', e);
        }
      }
    }
  };

  const switchUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      setActiveUser(target);
      try {
        localStorage.setItem('erp_active_user_id', target.id);
      } catch (e) {
        console.error('Error saving active user to localStorage:', e);
      }
    }
  };

  // Create Sales Order (With Auto Stock Deduct, Ledger Post, Customer Due Update)
  const createSalesOrder = (orderData: Parameters<ERPContextType['createSalesOrder']>[0]): SalesOrder => {
    // Validate stock availability to prevent negative stock
    for (const item of orderData.items) {
      const prod = products.find((p) => p.id === item.productId);
      const availableStock = prod ? prod.currentStock : 0;
      if (availableStock < item.quantity) {
        const prodName = prod ? prod.name : 'পণ্য';
        alert(`অর্ডার ফিল করা সম্ভব নয়! "${prodName}" এর পর্যাপ্ত স্টক নেই (বর্তমান স্টক: ${availableStock} টি, প্রয়োজন: ${item.quantity} টি)।`);
        throw new Error(`Insufficient stock for ${prodName}`);
      }
    }

    const orderId = `SO-${10000 + salesOrders.length + 1}`;
    const orderDate = new Date().toISOString().split('T')[0];
    const cust = customers.find((c) => c.id === orderData.customerId);

    // Calculate line items
    let calculatedSubtotal = 0;
    const items = orderData.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId);
      const totalPrice = item.quantity * item.unitPrice;
      const profit = totalPrice - item.quantity * (prod ? prod.buyingPrice : 0);
      calculatedSubtotal += totalPrice;
      return {
        id: `SOI-${1000 + salesOrders.length * 10 + idx + 1}`,
        orderId,
        productId: item.productId,
        productName: prod ? prod.name : '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        profitAmount: profit,
      };
    });

    const grandTotal = calculatedSubtotal - orderData.discountAmount + orderData.deliveryCharge;
    const dueAmount = grandTotal - orderData.advancePaid;
    let paymentStatus: SalesOrder['paymentStatus'] = 'Unpaid';
    if (dueAmount <= 0) paymentStatus = 'Paid';
    else if (orderData.advancePaid > 0) paymentStatus = 'Partial';

    const totalItemsProfit = items.reduce((sum, i) => sum + i.profitAmount, 0);
    const orderNetProfit = totalItemsProfit - orderData.discountAmount;

    const newOrder: SalesOrder = {
      id: orderId,
      orderDate,
      customerId: orderData.customerId,
      customerName: orderData.customerName || (cust ? cust.name : 'Walk-in Customer'),
      customerPhone: orderData.customerPhone || (cust ? cust.phone : ''),
      customerAddress: orderData.customerAddress || (cust ? cust.address : ''),
      deliveryAddress: orderData.deliveryAddress || orderData.customerAddress || (cust ? cust.address : ''),
      courierService: orderData.courierService || '',
      orderType: orderData.orderType,
      subtotal: calculatedSubtotal,
      discountAmount: orderData.discountAmount,
      deliveryCharge: orderData.deliveryCharge,
      grandTotal,
      advancePaid: orderData.advancePaid,
      dueAmount,
      paymentStatus,
      paymentMethod: orderData.paymentMethod || (dueAmount <= 0 ? 'Cash' : 'Due / Credit'),
      deliveryStatus: orderData.deliveryStatus || 'Pending',
      notes: orderData.notes,
      createdBy: orderData.createdBy || activeUser?.name || activeUser?.username || 'Admin',
      totalProfit: orderNetProfit,
      items,
      syncedToServer: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };

    setSalesOrders((prev) => [newOrder, ...prev]);

    // Handle Offline Sync Queueing
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const queueStr = localStorage.getItem('erp_offline_sync_queue');
        const queue: SalesOrder[] = queueStr ? JSON.parse(queueStr) : [];
        queue.push(newOrder);
        localStorage.setItem('erp_offline_sync_queue', JSON.stringify(queue));
        setPendingOfflineSyncCount(queue.length);
      } catch (e) {
        console.error('Failed to write to offline queue:', e);
      }
    } else {
      // Background sync trigger when online
      setTimeout(() => {
        syncOfflineDataWithServer();
      }, 500);
    }

    // Update product stock and log stock movement OUT
    setProducts((prevProds) => {
      return prevProds.map((p) => {
        const itemInOrder = orderData.items.find((i) => i.productId === p.id);
        if (itemInOrder) {
          const newQty = Math.max(0, p.currentStock - itemInOrder.quantity);
          // Log stock movement
          setStockMovements((sm) => [
            {
              id: `STK-${1000 + sm.length + 1}`,
              movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
              productId: p.id,
              productName: p.name,
              type: 'Stock OUT',
              quantity: itemInOrder.quantity,
              previousStock: p.currentStock,
              newStock: newQty,
              referenceType: 'Sales Order',
              referenceId: orderId,
              remarks: `Sales Order ${orderId} for ${cust ? cust.name : 'Customer'}`,
            },
            ...sm,
          ]);
          return { ...p, currentStock: newQty };
        }
        return p;
      });
    });

    // Update Customer Balance and Ledger
    if (cust) {
      const newBal = cust.currentBalance + dueAmount;
      setCustomers((prev) => prev.map((c) => (c.id === cust.id ? { ...c, currentBalance: newBal } : c)));

      setCustomerLedgers((prev) => [
        {
          id: `CLG-${1000 + prev.length + 1}`,
          date: orderDate,
          customerId: cust.id,
          customerName: cust.name,
          transactionType: 'Sales Invoice',
          referenceId: orderId,
          debit: grandTotal,
          credit: orderData.advancePaid,
          balance: newBal,
        },
        ...prev,
      ]);
    }

    setSelectedPrintOrder(newOrder);
    return newOrder;
  };

  // Mark Order as Paid
  const markOrderPaid = (orderId: string, customAmount?: number) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId) {
          const newAdvancePaid = customAmount !== undefined ? customAmount : so.grandTotal;
          const newDue = Math.max(0, so.grandTotal - newAdvancePaid);
          const paymentStatus: SalesOrder['paymentStatus'] = newDue <= 0 ? 'Paid' : newAdvancePaid > 0 ? 'Partial' : 'Unpaid';
          const updated = {
            ...so,
            advancePaid: newAdvancePaid,
            dueAmount: newDue,
            paymentStatus,
          };
          if (selectedPrintOrder && selectedPrintOrder.id === orderId) {
            setSelectedPrintOrder(updated);
          }
          return updated;
        }
        return so;
      })
    );
  };

  // Mark Order as Delivered
  const markOrderDelivered = (orderId: string) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId) {
          const updated = {
            ...so,
            deliveryStatus: 'Delivered' as const,
          };
          if (selectedPrintOrder && selectedPrintOrder.id === orderId) {
            setSelectedPrintOrder(updated);
          }
          return updated;
        }
        return so;
      })
    );
  };

  // Flexible Sales Order Status Update (Pending -> Accepted -> Send to Courier -> Delivered)
  const updateSalesOrderStatus = (
    orderId: string,
    deliveryStatus: SalesOrder['deliveryStatus'],
    courierService?: string
  ) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId) {
          const updated = {
            ...so,
            deliveryStatus,
            ...(courierService !== undefined ? { courierService } : {}),
          };
          if (selectedPrintOrder && selectedPrintOrder.id === orderId) {
            setSelectedPrintOrder(updated);
          }
          return updated;
        }
        return so;
      })
    );
  };

  const bulkUpdateSalesOrderStatus = (
    orderIds: string[],
    deliveryStatus: SalesOrder['deliveryStatus'],
    courierService?: string
  ) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (orderIds.includes(so.id)) {
          const updated = {
            ...so,
            deliveryStatus,
            ...(courierService !== undefined ? { courierService } : {}),
          };
          if (selectedPrintOrder && selectedPrintOrder.id === so.id) {
            setSelectedPrintOrder(updated);
          }
          return updated;
        }
        return so;
      })
    );
  };

  // Update line items in an existing sales order (supports POS-like scanning & manual edit)
  const updateSalesOrderItems = (
    orderId: string,
    newItemsInput: { productId: string; quantity: number; unitPrice: number }[]
  ) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === orderId) {
          let calculatedSubtotal = 0;
          const items = newItemsInput.map((item, idx) => {
            const prod = products.find((p) => p.id === item.productId);
            const totalPrice = item.quantity * item.unitPrice;
            const profit = totalPrice - item.quantity * (prod ? prod.buyingPrice : 0);
            calculatedSubtotal += totalPrice;
            return {
              id: `SOI-${1000 + idx + 1}`,
              orderId,
              productId: item.productId,
              productName: prod ? prod.name : '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice,
              profitAmount: profit,
            };
          });

          const grandTotal = Math.max(0, calculatedSubtotal - (so.discountAmount || 0) + (so.deliveryCharge || 0));
          const dueAmount = Math.max(0, grandTotal - (so.advancePaid || 0));
          let paymentStatus: SalesOrder['paymentStatus'] = 'Unpaid';
          if (dueAmount <= 0) paymentStatus = 'Paid';
          else if (so.advancePaid > 0) paymentStatus = 'Partial';

          const totalItemsProfit = items.reduce((sum, i) => sum + i.profitAmount, 0);
          const orderNetProfit = totalItemsProfit - (so.discountAmount || 0);

          const updated: SalesOrder = {
            ...so,
            subtotal: calculatedSubtotal,
            grandTotal,
            dueAmount,
            paymentStatus,
            totalProfit: orderNetProfit,
            items,
          };

          if (selectedPrintOrder && selectedPrintOrder.id === orderId) {
            setSelectedPrintOrder(updated);
          }
          return updated;
        }
        return so;
      })
    );
  };

  // Quotation Management
  const addQuotation = (qData: Omit<Quotation, 'id' | 'quotationDate'>): Quotation => {
    const newId = `QT-${1000 + quotations.length + 1}`;
    const qDate = new Date().toISOString().split('T')[0];
    const newQuotation: Quotation = {
      ...qData,
      id: newId,
      quotationDate: qDate,
    };
    setQuotations((prev) => [newQuotation, ...prev]);
    setSelectedPrintQuotation(newQuotation);
    return newQuotation;
  };

  const updateQuotation = (q: Quotation) => {
    setQuotations((prev) => prev.map((item) => (item.id === q.id ? q : item)));
    if (selectedPrintQuotation && selectedPrintQuotation.id === q.id) {
      setSelectedPrintQuotation(q);
    }
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((item) => item.id !== id));
    if (selectedPrintQuotation && selectedPrintQuotation.id === id) {
      const remaining = quotations.filter((item) => item.id !== id);
      setSelectedPrintQuotation(remaining[0] || null);
    }
  };

  const convertQuotationToOrder = (quotationId: string): SalesOrder | null => {
    const q = quotations.find((item) => item.id === quotationId);
    if (!q) return null;

    const orderItems = q.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const createdOrder = createSalesOrder({
      customerId: q.customerId,
      orderType: 'Retail',
      items: orderItems,
      discountAmount: q.discountAmount,
      deliveryCharge: q.deliveryCharge,
      advancePaid: 0,
      notes: `Converted from Quotation Ref: ${q.id}. ${q.notes || ''}`,
      createdBy: activeUser?.name || activeUser?.username || 'Admin',
    });

    updateQuotation({
      ...q,
      status: 'Converted',
      convertedOrderId: createdOrder.id,
    });

    setActiveModule('sales_orders');
    return createdOrder;
  };

  const addPendingOrder = (orderData: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>): PendingOrder => {
    const newId = `PEND-${1000 + pendingOrders.length + 1}`;
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newPending: PendingOrder = {
      ...orderData,
      id: newId,
      status: 'Pending',
      createdAt,
    };

    setPendingOrders((prev) => [newPending, ...prev]);
    return newPending;
  };

  const approvePendingOrder = (id: string): SalesOrder | null => {
    const target = pendingOrders.find((p) => p.id === id);
    if (!target) return null;

    // Find or create customer
    let cust = customers.find(
      (c) =>
        (c.phone && c.phone === target.customerPhone) ||
        (c.name && target.customerName && c.name.toLowerCase() === target.customerName.toLowerCase())
    );

    let custId = cust ? cust.id : '';
    if (!cust) {
      // Auto register customer in system
      const newCustId = `CUST-${1000 + customers.length + 1}`;
      const newCust: Customer = {
        id: newCustId,
        name: target.customerName || 'Online Customer',
        phone: target.customerPhone || '',
        email: `${(target.customerName || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}@online.com`,
        address: target.customerAddress,
        type: 'Retail',
        creditLimit: 10000,
        openingBalance: 0,
        currentBalance: 0,
        status: 'Active',
      };
      setCustomers((prev) => [...prev, newCust]);
      custId = newCustId;
    }

    // Convert pending items to sales order format
    const soItems = target.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    const subtotal = soItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const grandTotal = subtotal + target.deliveryCharge;

    const createdSO = createSalesOrder({
      customerId: custId,
      orderType: 'Retail',
      subtotal,
      grandTotal,
      discountAmount: 0,
      deliveryCharge: target.deliveryCharge,
      advancePaid: 0,
      deliveryStatus: 'Pending',
      notes: `[AI Bot Order (${target.channel}) Ref: ${target.id}] ${target.aiNotes || ''}`,
      createdBy: `AI Bot (${target.channel})`,
      items: soItems,
    });

    // Mark pending order as Approved
    setPendingOrders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p))
    );

    setSelectedPrintOrder(createdSO);
    return createdSO;
  };

  const rejectPendingOrder = (id: string) => {
    setPendingOrders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p))
    );
  };

  const deletePendingOrder = (id: string) => {
    setPendingOrders((prev) => prev.filter((p) => p.id !== id));
  };

  const batchDeletePendingOrders = (ids: string[]) => {
    const setIds = new Set(ids);
    setPendingOrders((prev) => prev.filter((p) => !setIds.has(p.id)));
  };

  const batchApprovePendingOrders = (ids: string[]): SalesOrder[] => {
    const approvedList: SalesOrder[] = [];
    ids.forEach((id) => {
      const result = approvePendingOrder(id);
      if (result) approvedList.push(result);
    });
    return approvedList;
  };

  const batchDeleteSalesOrders = (ids: string[]) => {
    const setIds = new Set(ids);
    setSalesOrders((prev) => prev.filter((o) => !setIds.has(o.id)));
  };

  const batchDeletePurchases = (ids: string[]) => {
    const setIds = new Set(ids);
    setPurchases((prev) => prev.filter((p) => !setIds.has(p.id)));
  };

  const batchDeleteCustomers = (ids: string[]) => {
    const deletableIds: string[] = [];
    let skippedCount = 0;
    for (const id of ids) {
      const hasSales = salesOrders.some((so) => so.customerId === id && so.deliveryStatus !== 'Voided');
      const hasPayments = customerPayments.some((cp) => cp.customerId === id);
      const hasLedgers = customerLedgers.some((cl) => cl.customerId === id && ((cl.debit || 0) > 0 || (cl.credit || 0) > 0));
      const targetCust = customers.find((c) => c.id === id);
      const hasBalance = targetCust ? targetCust.currentBalance !== 0 : false;
      if (hasSales || hasPayments || hasLedgers || hasBalance) {
        skippedCount++;
      } else {
        deletableIds.push(id);
      }
    }
    if (skippedCount > 0) {
      alert(`${skippedCount} জন কাস্টমারের আগের বিক্রয়/লেনদেনের রেকর্ড থাকায় মুছে ফেলা সম্ভব হয়নি। বাকিদের ডিলিট করা হয়েছে।`);
    }
    const setIds = new Set(deletableIds);
    setCustomers((prev) => prev.filter((c) => !setIds.has(c.id)));
  };

  const batchDeleteSuppliers = (ids: string[]) => {
    const deletableIds: string[] = [];
    let skippedCount = 0;
    for (const id of ids) {
      const hasPurchases = purchases.some((p) => p.supplierId === id && p.status !== 'Voided');
      const hasPayments = supplierPayments.some((sp) => sp.supplierId === id);
      const hasLedgers = supplierLedgers.some((sl) => sl.supplierId === id && ((sl.debit || 0) > 0 || (sl.credit || 0) > 0));
      const targetSup = suppliers.find((s) => s.id === id);
      const hasBalance = targetSup ? targetSup.currentBalance !== 0 : false;
      if (hasPurchases || hasPayments || hasLedgers || hasBalance) {
        skippedCount++;
      } else {
        deletableIds.push(id);
      }
    }
    if (skippedCount > 0) {
      alert(`${skippedCount} জন সাপ্লায়ারের আগের ক্রয়/লেনদেনের রেকর্ড থাকায় মুছে ফেলা সম্ভব হয়নি। বাকিদের ডিলিট করা হয়েছে।`);
    }
    const setIds = new Set(deletableIds);
    setSuppliers((prev) => prev.filter((s) => !setIds.has(s.id)));
  };

  const batchDeleteProducts = (ids: string[]) => {
    const setIds = new Set(ids);
    setProducts((prev) => prev.filter((p) => !setIds.has(p.id)));
  };

  const batchDeleteExpenses = (ids: string[]) => {
    const setIds = new Set(ids);
    setExpenses((prev) => prev.filter((e) => !setIds.has(e.id)));
  };

  const batchDeleteCustomerPayments = (ids: string[]) => {
    const setIds = new Set(ids);
    setCustomerPayments((prev) => prev.filter((cp) => !setIds.has(cp.id)));
  };

  const batchDeleteSupplierPayments = (ids: string[]) => {
    const setIds = new Set(ids);
    setSupplierPayments((prev) => prev.filter((sp) => !setIds.has(sp.id)));
  };

  const batchDeleteCustomerLedgers = (ids: string[]) => {
    const setIds = new Set(ids);
    const affectedCustIds = new Set(
      customerLedgers.filter((l) => setIds.has(l.id)).map((l) => l.customerId)
    );
    setCustomerLedgers((prev) => {
      const updated = prev.filter((l) => !setIds.has(l.id));
      affectedCustIds.forEach((custId) => {
        if (!custId) return;
        const cust = customers.find((c) => c.id === custId);
        if (cust) {
          const custEntries = updated.filter((l) => l.customerId === custId);
          const totalDebit = custEntries.reduce((s, e) => s + (e.debit || 0), 0);
          const totalCredit = custEntries.reduce((s, e) => s + (e.credit || 0), 0);
          const newBal = Math.max(0, (cust.openingBalance || 0) + totalDebit - totalCredit);
          setCustomers((cPrev) => cPrev.map((c) => (c.id === custId ? { ...c, currentBalance: newBal } : c)));
        }
      });
      return updated;
    });
  };

  const batchDeleteSupplierLedgers = (ids: string[]) => {
    const setIds = new Set(ids);
    const affectedSupIds = new Set(
      supplierLedgers.filter((l) => setIds.has(l.id)).map((l) => l.supplierId)
    );
    setSupplierLedgers((prev) => {
      const updated = prev.filter((l) => !setIds.has(l.id));
      affectedSupIds.forEach((supId) => {
        if (!supId) return;
        const sup = suppliers.find((s) => s.id === supId);
        if (sup) {
          const supEntries = updated.filter((l) => l.supplierId === supId);
          const totalDebit = supEntries.reduce((s, e) => s + (e.debit || 0), 0);
          const totalCredit = supEntries.reduce((s, e) => s + (e.credit || 0), 0);
          const newBal = Math.max(0, (sup.openingBalance || 0) + totalCredit - totalDebit);
          setSuppliers((sPrev) => sPrev.map((s) => (s.id === supId ? { ...s, currentBalance: newBal } : s)));
        }
      });
      return updated;
    });
  };

  const resetFullERPData = (adminPassword: string): { success: boolean; message: string } => {
    const query = adminPassword.trim();
    const isValid =
      (activeUser && activeUser.password && query === activeUser.password) ||
      users.some((u) => u.role === 'Admin' && u.password === query);

    if (!isValid) {
      return { success: false, message: 'ভুল এডমিন পাসওয়ার্ড! ERP ডাটা রিসেট বাতিল করা হয়েছে।' };
    }

    setSalesOrders([]);
    setPurchases([]);
    setCustomerPayments([]);
    setSupplierPayments([]);
    setExpenses([]);
    setStockMovements([]);
    setCustomerLedgers([]);
    setSupplierLedgers([]);
    setPendingOrders([]);

    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        openingBalance: 0,
        currentBalance: 0,
      }))
    );

    setSuppliers((prev) =>
      prev.map((s) => ({
        ...s,
        openingBalance: 0,
        currentBalance: 0,
      }))
    );

    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        openingStock: 0,
        currentStock: 0,
      }))
    );

    return {
      success: true,
      message: '✅ ERP-এর সকল বিক্রি, ক্রয়, কাস্টমার ও সাপ্লায়ারের পাওনা/দেনা এবং স্টক সফলভাবে ০ (শূন্য) করে রিসেট করা হয়েছে!',
    };
  };

  const resetFullApp = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setBrands(INITIAL_BRANDS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setPurchases(INITIAL_PURCHASES);
    setCustomerPayments(INITIAL_CUSTOMER_PAYMENTS);
    setSupplierPayments(INITIAL_SUPPLIER_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setCustomerLedgers(INITIAL_CUSTOMER_LEDGERS);
    setSupplierLedgers(INITIAL_SUPPLIER_LEDGERS);
    setQuotations(INITIAL_QUOTATIONS);
    setPendingOrders(INITIAL_PENDING_ORDERS);
    setSelectedPrintOrder(INITIAL_SALES_ORDERS[0] || null);
    setSelectedPrintQuotation(INITIAL_QUOTATIONS[0] || null);
    setUsers(INITIAL_USERS);
    setActiveUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    setActiveModule('dashboard');
  };

  // Create Purchase Order (Auto Stock Increase, Supplier Ledger, Supplier Due Update)
  const createPurchase = (purchaseData: Parameters<ERPContextType['createPurchase']>[0]): Purchase => {
    const purchaseId = `PO-${10000 + purchases.length + 1}`;
    const purchaseDate = new Date().toISOString().split('T')[0];
    const sup = suppliers.find((s) => s.id === purchaseData.supplierId);

    let calculatedSubtotal = 0;
    const items: PurchaseItem[] = purchaseData.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId);
      const totalCost = item.quantity * item.unitCost;
      calculatedSubtotal += totalCost;
      return {
        id: `POI-${1000 + purchases.length * 10 + idx + 1}`,
        purchaseId,
        productId: item.productId,
        productName: prod ? prod.name : '',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost,
      };
    });

    const grandTotal = calculatedSubtotal - purchaseData.discountAmount + purchaseData.transportCost;
    const dueAmount = grandTotal - purchaseData.paidAmount;
    let paymentStatus: Purchase['paymentStatus'] = 'Unpaid';
    if (dueAmount <= 0) paymentStatus = 'Paid';
    else if (purchaseData.paidAmount > 0) paymentStatus = 'Partial';

    const newPurchase: Purchase = {
      id: purchaseId,
      purchaseDate,
      supplierId: purchaseData.supplierId,
      supplierName: sup ? sup.name : '',
      invoiceNumber: purchaseData.invoiceNumber,
      subtotal: calculatedSubtotal,
      discountAmount: purchaseData.discountAmount,
      transportCost: purchaseData.transportCost,
      grandTotal,
      paidAmount: purchaseData.paidAmount,
      dueAmount,
      paymentStatus,
      status: purchaseData.status || 'Received',
      notes: purchaseData.notes,
      items,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Increase product stock & log Stock Movement IN
    setProducts((prevProds) => {
      return prevProds.map((p) => {
        const itemInPur = purchaseData.items.find((i) => i.productId === p.id);
        if (itemInPur) {
          const newQty = p.currentStock + itemInPur.quantity;
          setStockMovements((sm) => [
            {
              id: `STK-${1000 + sm.length + 1}`,
              movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
              productId: p.id,
              productName: p.name,
              type: 'Stock IN',
              quantity: itemInPur.quantity,
              previousStock: p.currentStock,
              newStock: newQty,
              referenceType: 'Purchase',
              referenceId: purchaseId,
              remarks: `Purchase PO ${purchaseId} from ${sup ? sup.name : 'Supplier'}`,
            },
            ...sm,
          ]);
          return { ...p, currentStock: newQty };
        }
        return p;
      });
    });

    // Update Supplier Balance and Ledger
    if (sup) {
      const newBal = sup.currentBalance + dueAmount;
      setSuppliers((prev) => prev.map((s) => (s.id === sup.id ? { ...s, currentBalance: newBal } : s)));

      setSupplierLedgers((prev) => [
        {
          id: `SLG-${1000 + prev.length + 1}`,
          date: purchaseDate,
          supplierId: sup.id,
          supplierName: sup.name,
          transactionType: 'Purchase Invoice',
          referenceId: purchaseId,
          debit: purchaseData.paidAmount,
          credit: grandTotal,
          balance: newBal,
        },
        ...prev,
      ]);
    }

    return newPurchase;
  };

  const recordCustomerPayment = (p: Omit<CustomerPayment, 'id' | 'paymentDate'>) => {
    const paymentId = `CP-${10000 + customerPayments.length + 1}`;
    const date = new Date().toISOString().split('T')[0];
    const cust = customers.find((c) => c.id === p.customerId);

    const newPayment: CustomerPayment = {
      ...p,
      id: paymentId,
      paymentDate: date,
      customerName: cust ? cust.name : '',
    };

    setCustomerPayments((prev) => [newPayment, ...prev]);

    if (cust) {
      const newBal = Math.max(0, cust.currentBalance - p.amount);
      setCustomers((prev) => prev.map((c) => (c.id === cust.id ? { ...c, currentBalance: newBal } : c)));

      setCustomerLedgers((prev) => [
        {
          id: `CLG-${1000 + prev.length + 1}`,
          date,
          customerId: cust.id,
          customerName: cust.name,
          transactionType: 'Payment Received',
          referenceId: paymentId,
          debit: 0,
          credit: p.amount,
          balance: newBal,
        },
        ...prev,
      ]);
    }
  };

  const recordSupplierPayment = (p: Omit<SupplierPayment, 'id' | 'paymentDate'>) => {
    const paymentId = `SP-${10000 + supplierPayments.length + 1}`;
    const date = new Date().toISOString().split('T')[0];
    const sup = suppliers.find((s) => s.id === p.supplierId);

    const newPayment: SupplierPayment = {
      ...p,
      id: paymentId,
      paymentDate: date,
      supplierName: sup ? sup.name : '',
    };

    setSupplierPayments((prev) => [newPayment, ...prev]);

    if (sup) {
      const newBal = Math.max(0, sup.currentBalance - p.amount);
      setSuppliers((prev) => prev.map((s) => (s.id === sup.id ? { ...s, currentBalance: newBal } : s)));

      setSupplierLedgers((prev) => [
        {
          id: `SLG-${1000 + prev.length + 1}`,
          date,
          supplierId: sup.id,
          supplierName: sup.name,
          transactionType: 'Payment Made',
          referenceId: paymentId,
          debit: p.amount,
          credit: 0,
          balance: newBal,
        },
        ...prev,
      ]);
    }
  };

  const deleteSalesOrder = (id: string) => {
    setSalesOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const voidSalesOrder = (id: string, reason: string) => {
    const query = (id || '').toLowerCase();
    const order = salesOrders.find((o) => o.id === id || (o.id && o.id.toLowerCase() === query));
    if (!order) return;
    if (order.deliveryStatus === 'Voided') return;

    // 1. Mark as Voided
    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              paymentStatus: 'Voided',
              deliveryStatus: 'Voided',
              voidReason: reason || 'Invoice voided by user/admin',
            }
          : o
      )
    );

    // 2. Return sold stock back to product inventory
    setProducts((prevProds) => {
      return prevProds.map((p) => {
        const itemInOrder = order.items.find((i) => i.productId === p.id);
        if (itemInOrder) {
          const newQty = p.currentStock + itemInOrder.quantity;
          setStockMovements((sm) => [
            {
              id: `STK-${1000 + sm.length + 1}`,
              movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
              productId: p.id,
              productName: p.name,
              type: 'Return',
              quantity: itemInOrder.quantity,
              previousStock: p.currentStock,
              newStock: newQty,
              referenceType: 'Sales Order',
              referenceId: order.id,
              remarks: `Void Invoice ${order.id} - Restored Stock (${reason || 'Voided'})`,
            },
            ...sm,
          ]);
          return { ...p, currentStock: newQty };
        }
        return p;
      });
    });

    // 3. Reverse customer balance & ledger if due balance existed
    const cust = customers.find((c) => c.id === order.customerId);
    if (cust && order.dueAmount > 0) {
      const newBal = Math.max(0, cust.currentBalance - order.dueAmount);
      setCustomers((prev) => prev.map((c) => (c.id === cust.id ? { ...c, currentBalance: newBal } : c)));

      setCustomerLedgers((prev) => [
        {
          id: `CLG-${1000 + prev.length + 1}`,
          date: new Date().toISOString().split('T')[0],
          customerId: cust.id,
          customerName: cust.name,
          transactionType: 'Adjustment',
          referenceId: `VOID-${order.id}`,
          debit: 0,
          credit: order.dueAmount,
          balance: newBal,
        },
        ...prev,
      ]);
    }
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const voidPurchase = (id: string, reason: string) => {
    const query = (id || '').toLowerCase();
    const purchase = purchases.find((p) => p.id === id || (p.id && p.id.toLowerCase() === query) || p.invoiceNumber === id);
    if (!purchase) return;
    if (purchase.status === 'Voided') return;

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchase.id
          ? {
              ...p,
              paymentStatus: 'Voided',
              status: 'Voided',
              voidReason: reason || 'Purchase voided by user/admin',
            }
          : p
      )
    );

    // Deduct inventory stock added by this purchase
    setProducts((prevProds) => {
      return prevProds.map((p) => {
        const itemInPur = purchase.items.find((i) => i.productId === p.id);
        if (itemInPur) {
          const newQty = Math.max(0, p.currentStock - itemInPur.quantity);
          setStockMovements((sm) => [
            {
              id: `STK-${1000 + sm.length + 1}`,
              movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
              productId: p.id,
              productName: p.name,
              type: 'Stock OUT',
              quantity: itemInPur.quantity,
              previousStock: p.currentStock,
              newStock: newQty,
              referenceType: 'Purchase',
              referenceId: purchase.id,
              remarks: `Void Purchase ${purchase.id} - Reduced Stock (${reason || 'Voided'})`,
            },
            ...sm,
          ]);
          return { ...p, currentStock: newQty };
        }
        return p;
      });
    });

    const sup = suppliers.find((s) => s.id === purchase.supplierId);
    if (sup && purchase.dueAmount > 0) {
      const newBal = Math.max(0, sup.currentBalance - purchase.dueAmount);
      setSuppliers((prev) => prev.map((s) => (s.id === sup.id ? { ...s, currentBalance: newBal } : s)));
    }
  };

  const deleteCustomerPayment = (id: string) => {
    setCustomerPayments((prev) => prev.filter((cp) => cp.id !== id));
  };

  const deleteSupplierPayment = (id: string) => {
    setSupplierPayments((prev) => prev.filter((sp) => sp.id !== id));
  };

  const addExpense = (e: Omit<Expense, 'id' | 'expenseDate'>) => {
    const expId = `EXP-${10000 + expenses.length + 1}`;
    const date = new Date().toISOString().split('T')[0];
    setExpenses((prev) => [{ ...e, id: expId, expenseDate: date }, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((ex) => ex.id !== id));
  };

  const addStockAdjustment = (adj: {
    productId: string;
    type: 'Stock IN' | 'Stock OUT' | 'Adjustment';
    quantity: number;
    remarks: string;
  }) => {
    const prod = products.find((p) => p.id === adj.productId);
    if (!prod) return;

    if (adj.type === 'Stock OUT' && prod.currentStock < adj.quantity) {
      alert(`স্টক আউট করা সম্ভব নয়! "${prod.name}" এর বর্তমান স্টক ${prod.currentStock} টি।`);
      throw new Error('Insufficient stock for Stock OUT adjustment');
    }

    let newStock = prod.currentStock;
    if (adj.type === 'Stock IN') newStock += adj.quantity;
    else if (adj.type === 'Stock OUT') newStock = Math.max(0, newStock - adj.quantity);
    else newStock = adj.quantity;

    setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, currentStock: newStock } : p)));

    setStockMovements((prev) => [
      {
        id: `STK-${1000 + prev.length + 1}`,
        movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        productId: prod.id,
        productName: prod.name,
        type: adj.type,
        quantity: adj.quantity,
        previousStock: prod.currentStock,
        newStock,
        referenceType: 'Manual Adjustment',
        referenceId: 'ADJ-MANUAL',
        remarks: adj.remarks,
      },
      ...prev,
    ]);
  };

  const addStockMovement = (data: { productId: string; movementType: string; quantity: number; referenceId: string; remarks: string }) => {
    const prod = products.find((p) => p.id === data.productId);
    if (!prod) return;
    const isOut = data.movementType === 'Sale' || data.movementType === 'Damage' || data.movementType === 'Stock OUT';
    
    if (isOut && prod.currentStock < data.quantity) {
      alert(`স্টক আউট করা সম্ভব নয়! "${prod.name}" এর বর্তমান স্টক ${prod.currentStock} টি।`);
      throw new Error('Insufficient stock');
    }

    const newQty = isOut ? Math.max(0, prod.currentStock - data.quantity) : prod.currentStock + data.quantity;

    setProducts((prev) => prev.map((p) => (p.id === data.productId ? { ...p, currentStock: newQty } : p)));

    setStockMovements((prev) => [
      {
        id: `STK-${1000 + prev.length + 1}`,
        movementDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        movementType: data.movementType,
        productId: data.productId,
        productName: prod.name,
        type: isOut ? 'Stock OUT' : 'Stock IN',
        quantity: data.quantity,
        previousStock: prod.currentStock,
        newStock: newQty,
        referenceType: 'Manual Adjustment',
        referenceId: data.referenceId || 'ADJ-MANUAL',
        remarks: data.remarks,
      },
      ...prev,
    ]);
  };

  const deleteStockMovement = (id: string) => {
    setStockMovements((prev) => prev.filter((m) => m.id !== id));
  };

  const deleteCustomerLedgerEntry = (id: string) => {
    const target = customerLedgers.find((l) => l.id === id);
    if (!target) return;
    const custId = target.customerId;
    setCustomerLedgers((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      if (custId) {
        const cust = customers.find((c) => c.id === custId);
        if (cust) {
          const custEntries = updated.filter((l) => l.customerId === custId);
          const totalDebit = custEntries.reduce((s, e) => s + (e.debit || 0), 0);
          const totalCredit = custEntries.reduce((s, e) => s + (e.credit || 0), 0);
          const newBal = Math.max(0, (cust.openingBalance || 0) + totalDebit - totalCredit);
          setCustomers((cPrev) => cPrev.map((c) => (c.id === custId ? { ...c, currentBalance: newBal } : c)));
        }
      }
      return updated;
    });
  };

  const deleteSupplierLedgerEntry = (id: string) => {
    const target = supplierLedgers.find((l) => l.id === id);
    if (!target) return;
    const supId = target.supplierId;
    setSupplierLedgers((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      if (supId) {
        const sup = suppliers.find((s) => s.id === supId);
        if (sup) {
          const supEntries = updated.filter((l) => l.supplierId === supId);
          const totalDebit = supEntries.reduce((s, e) => s + (e.debit || 0), 0);
          const totalCredit = supEntries.reduce((s, e) => s + (e.credit || 0), 0);
          const newBal = Math.max(0, (sup.openingBalance || 0) + totalCredit - totalDebit);
          setSuppliers((sPrev) => sPrev.map((s) => (s.id === supId ? { ...s, currentBalance: newBal } : s)));
        }
      }
      return updated;
    });
  };

  const downloadExcel = async () => {
    await generateERPWorkbook({
      companySettings,
      customers,
      suppliers,
      categories,
      brands,
      products,
      salesOrders,
      purchases,
      customerPayments,
      supplierPayments,
      expenses,
      stockMovements,
      customerLedgers,
      supplierLedgers,
    });
  };

  return (
    <ERPContext.Provider
      value={{
        activeModule,
        setActiveModule,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        companySettings,
        updateCompanySettings,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        categories,
        addCategory,
        deleteCategory,
        brands,
        addBrand,
        deleteBrand,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        users,
        addUser,
        updateUser,
        deleteUser,
        updateUserPassword,
        activeUser,
        switchUser,
        switchUserWithPassword,
        isAuthenticated,
        login,
        logout,
        salesOrders,
        createSalesOrder,
        deleteSalesOrder,
        voidSalesOrder,
        purchases,
        createPurchase,
        deletePurchase,
        voidPurchase,
        customerPayments,
        recordCustomerPayment,
        deleteCustomerPayment,
        supplierPayments,
        recordSupplierPayment,
        deleteSupplierPayment,
        expenses,
        addExpense,
        deleteExpense,
        stockMovements,
        addStockAdjustment,
        addStockMovement,
        deleteStockMovement,
        customerLedgers,
        supplierLedgers,
        deleteCustomerLedgerEntry,
        deleteSupplierLedgerEntry,
        selectedCustomerIdForLedger,
        setSelectedCustomerIdForLedger,
        selectedSupplierIdForLedger,
        setSelectedSupplierIdForLedger,
        downloadExcel,
        selectedPrintOrder,
        setSelectedPrintOrder,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToOrder,
        selectedPrintQuotation,
        setSelectedPrintQuotation,
        markOrderPaid,
        markOrderDelivered,
        updateSalesOrderStatus,
        bulkUpdateSalesOrderStatus,
        updateSalesOrderItems,
        pendingOrders,
        addPendingOrder,
        approvePendingOrder,
        rejectPendingOrder,
        deletePendingOrder,
        batchDeletePendingOrders,
        batchApprovePendingOrders,
        batchDeleteSalesOrders,
        batchDeletePurchases,
        batchDeleteCustomers,
        batchDeleteSuppliers,
        batchDeleteProducts,
        batchDeleteExpenses,
        batchDeleteCustomerPayments,
        batchDeleteSupplierPayments,
        batchDeleteCustomerLedgers,
        batchDeleteSupplierLedgers,
        resetFullERPData,
        resetFullApp,
        isOnline,
        pendingOfflineSyncCount,
        lastSyncedTime,
        isSyncing,
        syncOfflineDataWithServer,
        canInstallPWA,
        promptInstallPWA,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
