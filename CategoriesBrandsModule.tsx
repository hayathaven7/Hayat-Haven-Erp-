import React from 'react';
import { useERP } from '../context/ERPContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Module Components
import { CompanySettingsModule } from './modules/CompanySettingsModule';
import { DashboardModule } from './modules/DashboardModule';
import { CustomersModule } from './modules/CustomersModule';
import { SuppliersModule } from './modules/SuppliersModule';
import { CategoriesBrandsModule } from './modules/CategoriesBrandsModule';
import { ProductsModule } from './modules/ProductsModule';
import { SalesOrdersModule } from './modules/SalesOrdersModule';
import { PurchasesModule } from './modules/PurchasesModule';
import { PaymentsModule } from './modules/PaymentsModule';
import { ExpensesModule } from './modules/ExpensesModule';
import { StockMovementModule } from './modules/StockMovementModule';
import { LedgersModule } from './modules/LedgersModule';
import { ReportsModule } from './modules/ReportsModule';
import { InvoicePrintModule } from './modules/InvoicePrintModule';
import { PrinterSettingsModule } from './modules/PrinterSettingsModule';
import { AppSheetSchemaModule } from './modules/AppSheetSchemaModule';
import { UserRolesModule } from './modules/UserRolesModule';
import { UserReportsModule } from './modules/UserReportsModule';
import { AIBotPendingModule } from './modules/AIBotPendingModule';
import { QuotationsModule } from './modules/QuotationsModule';
import { EcommerceStoreModule } from './modules/EcommerceStoreModule';

export const ModuleView: React.FC = () => {
  const { activeModule, setActiveModule, activeUser } = useERP();

  // Security & Permissions Check
  const hasAccess =
    activeUser.role === 'Admin' || activeUser.allowedModules.includes(activeModule);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-xs text-slate-600 max-w-md mb-6 leading-relaxed">
          Your active account <strong className="text-slate-900">{activeUser.name}</strong> ({activeUser.role}) does not have permission to access the <strong>{activeModule}</strong> module. Please contact your System Admin to adjust your role access matrix.
        </p>
        <button
          onClick={() => {
            const defaultMod = activeUser.role === 'Admin' ? 'dashboard' : (activeUser.allowedModules[0] || 'sales_orders');
            setActiveModule(defaultMod);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>অনুমোদিত মডিউলে ফিরে যান (Return to Allowed Module)</span>
        </button>
      </div>
    );
  }

  switch (activeModule) {
    case 'company_settings':
      return <CompanySettingsModule />;
    case 'dashboard':
      return <DashboardModule />;
    case 'customers':
      return <CustomersModule />;
    case 'suppliers':
      return <SuppliersModule />;
    case 'categories':
    case 'brands':
      return <CategoriesBrandsModule />;
    case 'products':
      return <ProductsModule />;
    case 'sales_orders':
    case 'sales_order_items':
      return <SalesOrdersModule />;
    case 'purchases':
    case 'purchase_items':
      return <PurchasesModule />;
    case 'customer_payments':
    case 'supplier_payments':
      return <PaymentsModule />;
    case 'expenses':
      return <ExpensesModule />;
    case 'stock_movement':
      return <StockMovementModule />;
    case 'customer_ledger':
    case 'supplier_ledger':
      return <LedgersModule />;
    case 'profit_report':
    case 'sales_report':
    case 'purchase_report':
    case 'stock_report':
    case 'due_report':
      return <ReportsModule />;
    case 'invoice_print':
      return <InvoicePrintModule />;
    case 'printer_settings':
      return <PrinterSettingsModule />;
    case 'quotations':
      return <QuotationsModule />;
    case 'app_settings':
      return <AppSheetSchemaModule />;
    case 'user_roles':
      return <UserRolesModule />;
    case 'user_reports':
      return <UserReportsModule />;
    case 'ai_bot':
    case 'pending_orders':
      return <AIBotPendingModule />;
    case 'ecommerce_store':
      return <EcommerceStoreModule />;
    default:
      return <DashboardModule />;
  }
};
