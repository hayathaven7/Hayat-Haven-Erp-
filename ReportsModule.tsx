import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  ShoppingBag,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Bot,
  Clock,
  Sparkles,
  CheckCircle2,
  Search,
  Printer,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const DashboardModule: React.FC = () => {
  const {
    salesOrders,
    purchases,
    customers,
    suppliers,
    expenses,
    products,
    pendingOrders,
    approvePendingOrder,
    setActiveModule,
    setSelectedPrintOrder,
  } = useERP();

  const pendingList = pendingOrders ? pendingOrders.filter((po) => po.status === 'Pending') : [];

  const totalSales = salesOrders.reduce((acc, item) => acc + item.grandTotal, 0);
  const totalPurchases = purchases.reduce((acc, item) => acc + item.grandTotal, 0);
  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);
  const totalCustomerDue = customers.reduce((acc, item) => acc + item.currentBalance, 0);
  const totalSupplierDue = suppliers.reduce((acc, item) => acc + item.currentBalance, 0);
  const stockValuation = products.reduce((acc, item) => acc + item.currentStock * item.buyingPrice, 0);

  // Today & Monthly Profit Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Today's Sales & Profit
  const todayOrders = salesOrders.filter((so) => so.orderDate === todayStr);
  const todaySalesTotal = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const todayGrossProfit = todayOrders.reduce((acc, order) => {
    if (order.totalProfit !== undefined) return acc + order.totalProfit;
    const itemsProfit = order.items.reduce((iAcc, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const buyingCost = p ? p.buyingPrice : 0;
      return iAcc + (item.unitPrice - buyingCost) * item.quantity;
    }, 0);
    return acc + (itemsProfit - (order.discountAmount || 0));
  }, 0);
  const todayExpensesVal = expenses
    .filter((e) => e.expenseDate === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);
  const todayNetProfit = todayGrossProfit - todayExpensesVal;

  // Monthly Sales & Profit
  const monthOrders = salesOrders.filter((so) => so.orderDate && so.orderDate.startsWith(currentMonthStr));
  const monthSalesTotal = monthOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const monthGrossProfit = monthOrders.reduce((acc, order) => {
    if (order.totalProfit !== undefined) return acc + order.totalProfit;
    const itemsProfit = order.items.reduce((iAcc, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const buyingCost = p ? p.buyingPrice : 0;
      return iAcc + (item.unitPrice - buyingCost) * item.quantity;
    }, 0);
    return acc + (itemsProfit - (order.discountAmount || 0));
  }, 0);
  const monthExpensesVal = expenses
    .filter((e) => e.expenseDate && e.expenseDate.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);
  const monthNetProfit = monthGrossProfit - monthExpensesVal;

  // Total Lifetime Sales Profit = (Selling Price - Buying Price) * Qty - Discounts
  const totalGrossSalesProfit = salesOrders.reduce((acc, order) => {
    if (order.totalProfit !== undefined) {
      return acc + order.totalProfit;
    }
    const itemsProfit = order.items.reduce((iAcc, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const buyingCost = p ? p.buyingPrice : 0;
      return iAcc + (item.unitPrice - buyingCost) * item.quantity;
    }, 0);
    return acc + (itemsProfit - (order.discountAmount || 0));
  }, 0);

  // Net Profit = Gross Profit from Sales - Total Operating Expenses
  const netProfit = totalGrossSalesProfit - totalExpenses;

  const lowStockProducts = products.filter((p) => p.currentStock <= p.lowStockAlert);

  const [dashMemoSearch, setDashMemoSearch] = useState('');

  const matchedMemos = dashMemoSearch.trim()
    ? salesOrders.filter(
        (so) =>
          so.id.toLowerCase().includes(dashMemoSearch.trim().toLowerCase()) ||
          so.customerName.toLowerCase().includes(dashMemoSearch.trim().toLowerCase()) ||
          (so.customerPhone && so.customerPhone.includes(dashMemoSearch.trim()))
      )
    : [];

  const handlePrintMemo = (order: typeof salesOrders[0]) => {
    setSelectedPrintOrder(order);
    setActiveModule('invoice_print');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-6 text-white shadow-lg">
        <div>
          <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30 mb-2">
            Executive ERP Overview • BDT Currency
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Hayat Haven Enterprise Dashboard</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Real-time multi-module commercial operations, inventory valuation, sales ledgers, supplier payables, and net profitability calculations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModule('profit_report')}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-950 shadow-md hover:bg-blue-50 transition-all cursor-pointer"
          >
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>Profit Statement</span>
          </button>
        </div>
      </div>

      {/* AI Bot Pending Orders Quick Action Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900">
                WhatsApp & Messenger AI Bot Pending Orders
              </h3>
              <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                {pendingList.length} Active Pending
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              সোশ্যাল মিডিয়া চ্যাট থেকে আসা কাস্টমার অর্ডার রিভিউ করে এক ক্লিকে অ্যাপ্রুভ করুন। স্টক স্বয়ংক্রিয়ভাবে কমবে ও মেমো জেনারেট হবে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveModule('ai_bot')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open AI Bot & Pending Hub ({pendingList.length})</span>
          </button>
        </div>
      </div>

      {/* QUICK MEMO & INVOICE FINDER SEARCH BAR */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-2xl border border-blue-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">🔍 দ্রুত মেমো ও ইনভয়েস খুঁজে বের করুন (Quick Memo Search)</h2>
              <p className="text-[11px] text-slate-600">
                মেমো নাম্বার (যেমন: SO-10001), কাস্টমার নাম বা ফোন নাম্বার দিয়ে সরাসরি মেমো খুঁজে বের করুন ও প্রিন্ট করুন।
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
            <input
              type="text"
              value={dashMemoSearch}
              onChange={(e) => setDashMemoSearch(e.target.value)}
              placeholder="মেমো নং (SO-10001), নাম বা ফোন নাম্বার..."
              className="w-full rounded-xl border border-blue-300 bg-white pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden shadow-2xs"
            />
            {dashMemoSearch && (
              <button
                onClick={() => setDashMemoSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Matched Memos Dropdown Results */}
        {dashMemoSearch.trim() !== '' && (
          <div className="bg-white rounded-xl border border-blue-200 p-3 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800">
                সন্ধানের ফলাফল: <span className="text-blue-600">{matchedMemos.length}</span> টি মেমো পাওয়া গেছে
              </span>
              <span className="text-[10px] text-slate-400">মেমো তে ক্লিক করে সরাসরি ইনভয়েস প্রিন্ট ভিউ তে যান</span>
            </div>

            {matchedMemos.length === 0 ? (
              <p className="text-xs text-slate-500 p-2 text-center">
                "{dashMemoSearch}" দিয়ে কোন মেমো / ইনভয়েস পাওয়া যায়নি।
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pt-1">
                {matchedMemos.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handlePrintMemo(m)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-900 text-xs">{m.id}</span>
                        <span className="text-[10px] bg-slate-100 group-hover:bg-blue-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                          {m.paymentStatus}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{m.customerName}</span>
                      <span className="text-[10px] text-slate-500">{m.customerPhone || 'N/A'} • {m.orderDate}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 block">৳{(m.grandTotal || 0).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-blue-600 group-hover:underline flex items-center gap-0.5 justify-end mt-1">
                        <Printer className="h-3 w-3" /> প্রিন্ট ইনভয়েস
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DAILY & MONTHLY PROFIT HIGHLIGHT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Profit Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-700/60 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-black shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider">Today's Profit Overview</span>
                <h3 className="text-sm font-black text-white">📅 দৈনিক লাভ (আজকের প্রফিট)</h3>
              </div>
            </div>
            <span className="text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full">
              {todayOrders.length} টি অর্ডার আজ
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-emerald-200">আজকের নিট প্রফিট (Net Profit):</span>
              <p className="text-3xl font-black text-emerald-400 mt-0.5">৳{todayNetProfit.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-200">আজকের গ্রস প্রফিট:</span>
              <p className="text-base font-bold text-white">৳{todayGrossProfit.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/60 grid grid-cols-3 gap-2 text-[11px] text-emerald-200">
            <div>
              <span className="block text-emerald-400 font-semibold">আজকের মোট বিক্রি:</span>
              <span className="font-bold text-white">৳{todaySalesTotal.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-emerald-400 font-semibold">আজকের মোট খরচ:</span>
              <span className="font-bold text-rose-300">৳{todayExpensesVal.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="block text-emerald-400 font-semibold">আজকের মেমো:</span>
              <span className="font-bold text-white">{todayOrders.length} টি</span>
            </div>
          </div>
        </div>

        {/* Monthly Profit Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-5 border border-indigo-700/60 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-500 text-white rounded-xl font-black shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-blue-300 tracking-wider">This Month's Profit Overview</span>
                <h3 className="text-sm font-black text-white">🗓️ চলতি মাসের লাভ (Monthly Profit)</h3>
              </div>
            </div>
            <span className="text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-full">
              {monthOrders.length} টি অর্ডার চলতি মাসে
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-blue-200">চলতি মাসের নিট প্রফিট (Net Profit):</span>
              <p className="text-3xl font-black text-blue-300 mt-0.5">৳{monthNetProfit.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-200">চলতি মাসের গ্রস প্রফিট:</span>
              <p className="text-base font-bold text-white">৳{monthGrossProfit.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-800/60 grid grid-cols-3 gap-2 text-[11px] text-blue-200">
            <div>
              <span className="block text-blue-300 font-semibold">চলতি মাসের বিক্রি:</span>
              <span className="font-bold text-white">৳{monthSalesTotal.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-blue-300 font-semibold">চলতি মাসের খরচ:</span>
              <span className="font-bold text-rose-300">৳{monthExpensesVal.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="block text-blue-300 font-semibold">মাসিক মোট মেমো:</span>
              <span className="font-bold text-white">{monthOrders.length} টি</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales (BDT)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">৳{totalSales.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Orders: {salesOrders.length}</span>
            <button onClick={() => setActiveModule('sales_orders')} className="text-blue-600 font-semibold hover:underline cursor-pointer">
              View All →
            </button>
          </div>
        </div>

        {/* Card 2: Purchases */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchases (BDT)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">৳{totalPurchases.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Procurements: {purchases.length}</span>
            <button onClick={() => setActiveModule('purchases')} className="text-emerald-600 font-semibold hover:underline cursor-pointer">
              View All →
            </button>
          </div>
        </div>

        {/* Card 3: Receivables */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Due (Receivables)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-3">৳{totalCustomerDue.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Active Clients: {customers.length}</span>
            <button onClick={() => setActiveModule('customer_ledger')} className="text-amber-600 font-semibold hover:underline cursor-pointer">
              Ledgers →
            </button>
          </div>
        </div>

        {/* Card 4: Payables */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Due (Payables)</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 mt-3">৳{totalSupplierDue.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Vendors: {suppliers.length}</span>
            <button onClick={() => setActiveModule('supplier_ledger')} className="text-rose-600 font-semibold hover:underline cursor-pointer">
              Ledgers →
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Operating Expenses</span>
            <p className="text-lg font-bold text-slate-900">৳{totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Stock Valuation (at Cost)</span>
            <p className="text-lg font-bold text-slate-900">৳{stockValuation.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 block">Sales Profit (বিক্রির দাম - কেনা দাম)</span>
            <p className="text-lg font-black text-emerald-700">৳{totalGrossSalesProfit.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-indigo-200 bg-indigo-50/20 p-5 shadow-xs flex items-center gap-4">
          <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-900 block">Net Profit (খরচ বাদ দিয়ে নিট লাভ)</span>
            <p className={`text-lg font-black ${netProfit >= 0 ? 'text-indigo-800' : 'text-red-700'}`}>
              ৳{netProfit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Sales Orders</h3>
            <button
              onClick={() => setActiveModule('sales_orders')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              View Sales Module
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Order ID</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Grand Total (৳)</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salesOrders.slice(0, 5).map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-900">{so.id}</td>
                    <td className="py-3 px-4 text-slate-600">{so.orderDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{so.customerName || so.customerId}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${so.orderType === 'Wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                        {so.orderType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ৳{so.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          so.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : so.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {so.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedPrintOrder(so);
                          setActiveModule('invoice_print');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Print Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-amber-950 text-sm">Low Stock Alerts</h3>
            </div>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">All product stocks are healthy!</p>
            ) : (
              lowStockProducts.map((prod) => (
                <div key={prod.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{prod.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">SKU: {prod.id} • Unit: {prod.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {prod.currentStock} left
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Threshold: {prod.lowStockAlert}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => setActiveModule('products')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Manage Inventory Stock →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

