import React, { useState } from 'react';
import { TrendingUp, ShoppingBag, Truck, Boxes, AlertTriangle, PieChart } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const ReportsModule: React.FC = () => {
  const {
    salesOrders,
    purchases,
    products,
    customers,
    suppliers,
    expenses,
    activeModule,
  } = useERP();

  const [activeReport, setActiveReport] = useState<
    'profit' | 'sales' | 'purchases' | 'stock' | 'due'
  >(
    activeModule === 'sales_report'
      ? 'sales'
      : activeModule === 'purchase_report'
      ? 'purchases'
      : activeModule === 'stock_report'
      ? 'stock'
      : activeModule === 'due_report'
      ? 'due'
      : 'profit'
  );

  // Financial calculations
  const activeSales = salesOrders.filter((s) => s.deliveryStatus !== 'Voided');
  const activePurchases = purchases.filter((p) => p.status !== 'Voided');

  const totalSalesRevenue = activeSales.reduce((sum, item) => sum + item.grandTotal, 0);
  const totalPurchaseCost = activePurchases.reduce((sum, item) => sum + item.grandTotal, 0);
  const totalOperatingExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate COGS based on sold line items
  const totalCOGS = activeSales.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((itemSum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        const buyingCost = prod ? prod.buyingPrice : item.unitPrice * 0.6;
        return itemSum + item.quantity * buyingCost;
      }, 0)
    );
  }, 0);

  const grossProfit = totalSalesRevenue - totalCOGS;
  const netProfit = grossProfit - totalOperatingExpenses;

  const totalCustomerReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalSupplierPayables = suppliers.reduce((sum, s) => sum + s.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Modules 18-22: Commercial ERP Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Profit & Loss Statement, Sales Revenue Analysis, Procurement Logs, Inventory Valuation & Outstanding Balances.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveReport('profit')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeReport === 'profit' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            18. Profit Report
          </button>
          <button
            onClick={() => setActiveReport('sales')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeReport === 'sales' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            19. Sales Report
          </button>
          <button
            onClick={() => setActiveReport('purchases')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeReport === 'purchases' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            20. Purchase Report
          </button>
          <button
            onClick={() => setActiveReport('stock')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeReport === 'stock' ? 'bg-white text-purple-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            21. Stock Report
          </button>
          <button
            onClick={() => setActiveReport('due')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeReport === 'due' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            22. Due Report
          </button>
        </div>
      </div>

      {/* Module 18: Profit Statement */}
      {activeReport === 'profit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Module 18: Profit & Loss Statement (Income Statement)</h3>
                <p className="text-xs text-slate-500">Hayat Haven Enterprise • Currency: BDT (৳)</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Real-Time Calculation
              </span>
            </div>

            <div className="space-y-3 text-xs max-w-2xl mx-auto font-medium">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-700 font-bold">Total Sales Turnover (Revenue):</span>
                <span className="font-extrabold text-blue-900 text-sm">৳{totalSalesRevenue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
                <span>Less: Cost of Goods Sold (COGS at Buying Cost):</span>
                <span className="font-bold text-rose-600">-৳{totalCOGS.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2.5 bg-slate-50 px-3 rounded-lg border border-slate-200 font-bold text-sm text-slate-900">
                <span>Gross Commercial Profit:</span>
                <span className="text-emerald-700">৳{grossProfit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
                <span>Less: Total Operating Expenses (Rent/Utilities/Salaries/Freight):</span>
                <span className="font-bold text-rose-600">-৳{totalOperatingExpenses.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-3 bg-blue-900 text-white px-4 rounded-xl shadow-md font-bold text-base">
                <span>Net Profit / (Loss):</span>
                <span className="text-emerald-300">৳{netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 19: Sales Report */}
      {activeReport === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Module 19: Complete Sales Report</h3>
            <span className="text-xs font-bold text-blue-900">Total Turnover: ৳{totalSalesRevenue.toLocaleString()}</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Order ID</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Customer</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
                <th className="py-2.5 px-4 font-semibold text-right">Discount</th>
                <th className="py-2.5 px-4 font-semibold text-right">Grand Total (৳)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {salesOrders.map((so) => (
                <tr key={so.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-900">{so.id}</td>
                  <td className="py-3 px-4 text-slate-600">{so.orderDate}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{so.customerName || so.customerId}</td>
                  <td className="py-3 px-4">{so.orderType}</td>
                  <td className="py-3 px-4 text-right text-slate-600">৳{so.subtotal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-red-600">-৳{so.discountAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">৳{so.grandTotal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        so.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {so.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Module 20: Purchase Report */}
      {activeReport === 'purchases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Module 20: Procurement Purchase Report</h3>
            <span className="text-xs font-bold text-emerald-900">Total Procurements: ৳{totalPurchaseCost.toLocaleString()}</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">PO ID</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Supplier</th>
                <th className="py-2.5 px-4 font-semibold">Supplier Ref Invoice</th>
                <th className="py-2.5 px-4 font-semibold text-right">Grand Total (৳)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Paid (৳)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Due (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {purchases.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-emerald-900">{po.id}</td>
                  <td className="py-3 px-4 text-slate-600">{po.purchaseDate}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{po.supplierName || po.supplierId}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{po.invoiceNumber}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">৳{po.grandTotal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-700">৳{po.paidAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-700">৳{po.dueAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Module 21: Stock Report */}
      {activeReport === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Module 21: Inventory Stock & Valuation Report</h3>
            <span className="text-xs font-bold text-purple-900">
              Total Stock Value: ৳
              {products.reduce((acc, p) => acc + p.currentStock * p.buyingPrice, 0).toLocaleString()}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">SKU</th>
                <th className="py-2.5 px-4 font-semibold">Product Name</th>
                <th className="py-2.5 px-4 font-semibold text-right">Buying Cost</th>
                <th className="py-2.5 px-4 font-semibold text-right">Selling Price</th>
                <th className="py-2.5 px-4 font-semibold text-center">Available Stock</th>
                <th className="py-2.5 px-4 font-semibold text-right">Stock Value (At Cost)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((p) => {
                const valuation = p.currentStock * p.buyingPrice;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-900">{p.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-right">৳{p.buyingPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium">৳{p.sellingPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">৳{valuation.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Module 22: Due Report */}
      {activeReport === 'due' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Receivables */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wider">Customer Receivables Due</h3>
              <span className="text-xs font-black text-amber-900">Total: ৳{totalCustomerReceivables.toLocaleString()}</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Credit Limit</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Due Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers
                  .filter((c) => c.currentBalance > 0)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.phone}</td>
                      <td className="py-2.5 px-3 text-right">৳{c.creditLimit.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-700">৳{c.currentBalance.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Supplier Payables */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
              <h3 className="font-bold text-rose-950 text-xs uppercase tracking-wider">Supplier Payables Due</h3>
              <span className="text-xs font-black text-rose-900">Total: ৳{totalSupplierPayables.toLocaleString()}</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Supplier</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Rep</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Due Payable (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {suppliers
                  .filter((s) => s.currentBalance > 0)
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.contactPerson || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.phone}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-700">৳{s.currentBalance.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
