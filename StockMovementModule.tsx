import React, { useState } from 'react';
import { CreditCard, Wallet, Plus, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const PaymentsModule: React.FC = () => {
  const {
    customers,
    suppliers,
    customerPayments,
    supplierPayments,
    recordCustomerPayment,
    recordSupplierPayment,
    deleteCustomerPayment,
    deleteSupplierPayment,
    activeUser,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [showCPModal, setShowCPModal] = useState(false);
  const [showSPModal, setShowSPModal] = useState(false);

  // Form States
  const [cpData, setCpData] = useState({
    customerId: customers[0]?.id || '',
    paymentMethod: 'bKash' as 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card',
    amount: 5000,
    referenceNo: '',
    notes: '',
  });

  const [spData, setSpData] = useState({
    supplierId: suppliers[0]?.id || '',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card',
    amount: 10000,
    referenceNo: '',
    notes: '',
  });

  const handleCPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpData.customerId || cpData.amount <= 0) return;
    recordCustomerPayment(cpData);
    setShowCPModal(false);
    setCpData({ customerId: customers[0]?.id || '', paymentMethod: 'bKash', amount: 5000, referenceNo: '', notes: '' });
  };

  const handleSPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spData.supplierId || spData.amount <= 0) return;
    recordSupplierPayment(spData);
    setShowSPModal(false);
    setSpData({ supplierId: suppliers[0]?.id || '', paymentMethod: 'Bank Transfer', amount: 10000, referenceNo: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Modules 12 & 13: Customer Collections & Supplier Payments</h2>
          <p className="text-xs text-slate-500">
            Record money received from customers (bKash/Nagad/Cash/Bank) and disbursements to suppliers with automatic ledger posting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'customer' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>12. Customer Collections</span>
            </button>
            <button
              onClick={() => setActiveTab('supplier')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'supplier' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span>13. Supplier Payments</span>
            </button>
          </div>

          {activeTab === 'customer' ? (
            <button
              onClick={() => setShowCPModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Receive Payment</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSPModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Pay Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Module 12: Customer Collections Table */}
      {activeTab === 'customer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Customer Collection Receipts</h3>
            <span className="text-xs text-slate-500">{customerPayments.length} Receipts</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Payment ID</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Customer</th>
                <th className="py-2.5 px-4 font-semibold">Method</th>
                <th className="py-2.5 px-4 font-semibold">Reference No / TrxID</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount Received (৳)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customerPayments.map((cp) => (
                <tr key={cp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-900">{cp.id}</td>
                  <td className="py-3 px-4 text-slate-600">{cp.paymentDate}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{cp.customerName || cp.customerId}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {cp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{cp.referenceNo || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">৳{cp.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    {activeUser.canDelete && (
                      <button
                        onClick={() => deleteCustomerPayment(cp.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Delete Receipt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Module 13: Supplier Payments Table */}
      {activeTab === 'supplier' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Supplier Payment Disbursements</h3>
            <span className="text-xs text-slate-500">{supplierPayments.length} Disbursements</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Payment ID</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Supplier</th>
                <th className="py-2.5 px-4 font-semibold">Method</th>
                <th className="py-2.5 px-4 font-semibold">Reference No</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount Paid (৳)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {supplierPayments.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-emerald-900">{sp.id}</td>
                  <td className="py-3 px-4 text-slate-600">{sp.paymentDate}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{sp.supplierName || sp.supplierId}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {sp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{sp.referenceNo || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-900">৳{sp.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    {activeUser.canDelete && (
                      <button
                        onClick={() => deleteSupplierPayment(sp.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Delete Disbursement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Payment Modal */}
      {showCPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record Customer Payment Collection</h3>
            <form onSubmit={handleCPSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer *</label>
                <select
                  value={cpData.customerId}
                  onChange={(e) => setCpData({ ...cpData, customerId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Current Due: ৳{c.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={cpData.paymentMethod}
                  onChange={(e) => setCpData({ ...cpData, paymentMethod: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card POS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Collected (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={cpData.amount}
                  onChange={(e) => setCpData({ ...cpData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / TrxID</label>
                <input
                  type="text"
                  placeholder="e.g. BK88291012"
                  value={cpData.referenceNo}
                  onChange={(e) => setCpData({ ...cpData, referenceNo: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCPModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal */}
      {showSPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record Supplier Payment Disbursement</h3>
            <form onSubmit={handleSPSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                <select
                  value={spData.supplierId}
                  onChange={(e) => setSpData({ ...spData, supplierId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Payable Due: ৳{s.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={spData.paymentMethod}
                  onChange={(e) => setSpData({ ...spData, paymentMethod: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="Bank Transfer">Bank Transfer (EFT/NPSB)</option>
                  <option value="bKash">bKash</option>
                  <option value="Cash">Cash</option>
                  <option value="Nagad">Nagad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={spData.amount}
                  onChange={(e) => setSpData({ ...spData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Ref / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. EFT-DBBL-99210"
                  value={spData.referenceNo}
                  onChange={(e) => setSpData({ ...spData, referenceNo: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSPModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
