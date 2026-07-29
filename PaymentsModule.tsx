import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  FolderTree,
  Tag,
  Package,
  ShoppingCart,
  Receipt,
  Truck,
  CreditCard,
  Wallet,
  DollarSign,
  ArrowUpDown,
  BookOpen,
  TrendingUp,
  BarChart3,
  Boxes,
  AlertTriangle,
  Printer,
  Sliders,
  FileText,
  Database,
  FileSpreadsheet,
  Shield,
  KeyRound,
  Bot,
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  Store,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { ModuleType } from '../types/erp';

interface NavGroup {
  title: string;
  items: {
    id: ModuleType;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    products,
    pendingOrders,
    activeUser,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isOnline,
    pendingOfflineSyncCount,
    isSyncing,
    syncOfflineDataWithServer,
    promptInstallPWA,
  } = useERP();

  const lowStockCount = products.filter((p) => p.currentStock <= p.lowStockAlert).length;
  const pendingOrdersCount = pendingOrders ? pendingOrders.filter((po) => po.status === 'Pending').length : 0;

  const rawNavGroups: NavGroup[] = [
    {
      title: 'CORE & OVERVIEW',
      items: [
        { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
        { id: 'company_settings', label: '2. Company Settings', icon: Building2 },
        { id: 'user_roles', label: '3. User Roles & Access', icon: Shield },
        { id: 'user_reports', label: '4. User Sales Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'customers', label: '5. Customers', icon: Users },
        { id: 'suppliers', label: '6. Suppliers', icon: UserCheck },
        { id: 'categories', label: '7. Categories', icon: FolderTree },
        { id: 'brands', label: '8. Brands', icon: Tag },
        { id: 'products', label: '9. Products', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
      ],
    },
    {
      title: 'SALES & ONLINE BOT',
      items: [
        { id: 'ecommerce_store', label: '🌐 ই-কমার্স ওয়েবসাইট & ল্যান্ডিং পেজ', icon: Store },
        { id: 'ai_bot', label: '10. AI Order Bot & Pending', icon: Bot, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
        { id: 'quotations', label: '11. Price Quotation (কোটেশন)', icon: FileText },
        { id: 'sales_orders', label: '12. Sales Orders', icon: ShoppingCart },
        { id: 'sales_order_items', label: '13. Order Items', icon: Receipt },
        { id: 'customer_payments', label: '14. Customer Payments', icon: CreditCard },
      ],
    },
    {
      title: 'PURCHASES & VENDORS',
      items: [
        { id: 'purchases', label: '15. Purchases', icon: Truck },
        { id: 'purchase_items', label: '16. Purchase Items', icon: Receipt },
        { id: 'supplier_payments', label: '17. Supplier Payments', icon: Wallet },
      ],
    },
    {
      title: 'ACCOUNTS & STOCKS',
      items: [
        { id: 'expenses', label: '18. Expenses', icon: DollarSign },
        { id: 'stock_movement', label: '19. Stock Movement', icon: ArrowUpDown },
        { id: 'customer_ledger', label: '20. Customer Ledger', icon: BookOpen },
        { id: 'supplier_ledger', label: '21. Supplier Ledger', icon: BookOpen },
      ],
    },
    {
      title: 'FINANCIAL REPORTS',
      items: [
        { id: 'profit_report', label: '22. Profit Report', icon: TrendingUp },
        { id: 'sales_report', label: '23. Sales Report', icon: BarChart3 },
        { id: 'purchase_report', label: '24. Purchase Report', icon: BarChart3 },
        { id: 'stock_report', label: '25. Stock Report', icon: Boxes },
        { id: 'due_report', label: '26. Due Report', icon: AlertTriangle },
      ],
    },
    {
      title: 'PRINT & ARCHITECTURE',
      items: [
        { id: 'invoice_print', label: '27. Invoice Print (A4 / POS)', icon: Printer },
        { id: 'printer_settings', label: '28. Printer Settings (প্রিন্টার সেটিং)', icon: Sliders },
        { id: 'app_settings', label: '29. AppSheet DB Specs', icon: Database },
      ],
    },
  ];

  // Filter items based on activeUser allowedModules
  const navGroups = rawNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => activeUser.role === 'Admin' || activeUser.allowedModules.includes(item.id)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <aside className="w-64 md:w-56 flex-shrink-0 bg-[#1E293B] text-slate-300 flex flex-col border-r border-slate-700 h-full">
      <div className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
          <span>Modules Navigation</span>
        </div>
        <span className="text-[9px] bg-blue-900/80 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-blue-700/50">
          {activeUser.role === 'Admin' ? '25 SHEETS' : `${activeUser.allowedModules.length} SHEETS`}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto text-xs space-y-4 py-3 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1.5">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-bold'
                        : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 opacity-70'}`} />
                      <span className="truncate text-xs">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="rounded-full bg-red-500/20 text-red-400 px-1.5 py-0.5 text-[9px] font-mono font-bold border border-red-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700/80 bg-[#001D3A]/80 text-[10px] space-y-2">
        {/* Offline / Online Status Indicator */}
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-rose-400 shrink-0 animate-pulse" />
            )}
            <div>
              <p className={`font-bold leading-none ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isOnline ? 'অনলাইন মোড' : 'অফলাইন সেল মোড'}
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                {pendingOfflineSyncCount > 0 ? `${pendingOfflineSyncCount} সিঙ্ক বাকি` : 'ডাটা সিঙ্কড'}
              </p>
            </div>
          </div>

          <button
            onClick={() => syncOfflineDataWithServer()}
            disabled={isSyncing}
            className="p-1.5 rounded bg-blue-700/60 hover:bg-blue-600 text-white cursor-pointer transition-all disabled:opacity-50"
            title="সার্ভারে সিঙ্ক করুন"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-amber-300' : ''}`} />
          </button>
        </div>

        {/* Install PWA App Button */}
        <button
          onClick={promptInstallPWA}
          className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-[10px] uppercase tracking-tight transition-all cursor-pointer border border-purple-400/30"
        >
          <Smartphone className="h-3.5 w-3.5 text-purple-200" />
          <span>অ্যাপ হিসেবে ইন্সটল করুন</span>
        </button>

        <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-700/50">
          <span className="font-bold text-slate-300 truncate">{activeUser.name}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white shrink-0">
            {activeUser.role}
          </span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative z-10 h-full max-w-[80%] shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

