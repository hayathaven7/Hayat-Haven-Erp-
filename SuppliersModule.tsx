import React, { useState } from 'react';
import { Truck, Receipt, Search, Plus, Trash2, Ban, AlertTriangle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { NewPurchaseModal } from '../NewPurchaseModal';

export const PurchasesModule: React.FC = () => {
  const { purchases, deletePurchase, voidPurchase, activeUser } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(purchases[0]?.id || null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const query = (searchTerm || '').toLowerCase();
  const filteredPurchases = purchases.filter(
    (po) =>
      (po.id && po.id.toLowerCase().includes(query)) ||
      (po.invoiceNumber && po.invoiceNumber.toLowerCase().includes(query)) ||
      (po.supplierName && po.supplierName.toLowerCase().includes(query))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Modules 10 & 11: Purchases & Purchase Line Items</h2>
          <p className="text-xs text-slate-500">
            One Purchase → Multiple Products → Auto Stock Increase → Supplier Payable Ledger → Payment Terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Purchase ID, Supplier, Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPurchases.map((po) => {
          const isExpanded = expandedId === po.id;

          return (
            <div key={po.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div
                onClick={() => setExpandedId(isExpanded ? null : po.id)}
                className="p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-900 text-white rounded-xl font-bold text-xs">
                    {po.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{po.supplierName || po.supplierId}</h3>
                    <p className="text-[11px] text-slate-500">
                      Date: {po.purchaseDate} • Supplier Invoice No: <span className="font-semibold text-slate-800">{po.invoiceNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Grand Total</span>
                    <span className="text-base font-black text-slate-900">৳{po.grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Due</span>
                    <span className="text-sm font-extrabold text-rose-700">৳{po.dueAmount.toLocaleString()}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      po.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : po.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {po.paymentStatus}
                  </span>

                  {activeUser.canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(po.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                      title="Delete Purchase Order"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Module 11: Purchase Items Detail */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Module 11: Purchase Order Stock Items ({po.items.length})
                      </h4>
                    </div>
                    {po.notes && <span className="text-xs text-slate-500 italic">Notes: "{po.notes}"</span>}
                  </div>

                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Item ID</th>
                        <th className="py-2 px-3 font-semibold">Product SKU</th>
                        <th className="py-2 px-3 font-semibold text-right">Qty Received (+Stock)</th>
                        <th className="py-2 px-3 font-semibold text-right">Unit Buying Cost (৳)</th>
                        <th className="py-2 px-3 font-semibold text-right">Line Total (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {po.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{item.id}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{item.productName || item.productId}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">+{item.quantity}</td>
                          <td className="py-2 px-3 text-right">৳{item.unitCost.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">৳{item.totalCost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-4 text-slate-600">
                      <span>Subtotal: <strong className="text-slate-900">৳{po.subtotal.toLocaleString()}</strong></span>
                      <span>Discount: <strong className="text-emerald-600">-৳{po.discountAmount.toLocaleString()}</strong></span>
                      <span>Transport Cost: <strong className="text-slate-900">+৳{po.transportCost.toLocaleString()}</strong></span>
                    </div>

                    <div className="flex items-center gap-4 font-bold">
                      <span className="text-emerald-900">Grand Total: ৳{po.grandTotal.toLocaleString()}</span>
                      <span className="text-blue-700">Paid: ৳{po.paidAmount.toLocaleString()}</span>
                      <span className="text-rose-700">Due: ৳{po.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPurchaseModal && <NewPurchaseModal onClose={() => setShowPurchaseModal(false)} />}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Purchase Order?</h3>
                <p className="text-xs text-slate-500">Record ID: {deleteTargetId}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে এই পারচেজ রেকর্ডটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePurchase(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
