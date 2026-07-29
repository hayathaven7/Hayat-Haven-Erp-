import React, { useState } from 'react';
import { Users, Plus, Phone, Mail, MapPin, Search, Edit2, Trash2, ShieldAlert, FileText, Printer, X, ShoppingBag, Award, Eye } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Customer, SalesOrder } from '../../types/erp';

export const CustomersModule: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, setActiveModule, activeUser, setSelectedCustomerIdForLedger, customerLedgers, companySettings, salesOrders, setSelectedPrintOrder } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [quickLedgerCustomer, setQuickLedgerCustomer] = useState<Customer | null>(null);
  const [memosCustomer, setMemosCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'Retail' as 'Retail' | 'Wholesale',
    creditLimit: 50000,
    openingBalance: 0,
    status: 'Active' as 'Active' | 'Inactive',
  });

  const query = (searchTerm || '').toLowerCase();
  const filteredCustomers = customers.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.id && c.id.toLowerCase().includes(query))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...formData });
      setEditingCustomer(null);
    } else {
      addCustomer(formData);
      setShowAddModal(false);
    }
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      type: 'Retail',
      creditLimit: 50000,
      openingBalance: 0,
      status: 'Active',
    });
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      type: c.type,
      creditLimit: c.creditLimit,
      openingBalance: c.openingBalance,
      status: c.status,
    });
  };

  // Helper to get orders associated with customer
  const getCustomerOrders = (c: Customer): SalesOrder[] => {
    return salesOrders.filter(
      (s) =>
        s.customerId === c.id ||
        (s.customerPhone && c.phone && s.customerPhone.trim() === c.phone.trim())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Module 3: Customers Directory & Loyalty</h2>
          <p className="text-xs text-slate-500">
            Retail & Wholesale client accounts, total purchase history, memo counts, reward points, and credit receivables.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="মোবাইল নাম্বার (e.g. 017...), নাম বা ID দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden bg-white shadow-2xs"
            />
          </div>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Customer ID & Name</th>
              <th className="py-3 px-4 font-semibold">Type & Contact</th>
              <th className="py-3 px-4 font-semibold text-right">Total Purchases (মোট কেনাকাটা)</th>
              <th className="py-3 px-4 font-semibold text-center">Total Memos (মেমো সংখ্যা)</th>
              <th className="py-3 px-4 font-semibold text-center">Reward Points</th>
              <th className="py-3 px-4 font-semibold text-right">Balance Due (৳)</th>
              <th className="py-3 px-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  "{searchTerm}" এর সাথে মিল রেখে কোনো কাস্টমার পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                const cOrders = getCustomerOrders(c);
                const totalSpent = cOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
                const memoCount = cOrders.length;
                const points = c.rewardPoints ?? Math.floor(totalSpent / 100);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-xs">{c.name}</span>
                      <span className="font-mono text-[10px] text-blue-900 font-bold">{c.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.type === 'Wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {c.type}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700 text-xs">
                          <Phone className="h-3 w-3 text-blue-600" />
                          {c.phone}
                        </span>
                      </div>
                      {c.address && <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">{c.address}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-slate-900 block">৳{totalSpent.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setMemosCustomer(c)}
                        className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs font-bold hover:bg-amber-100 cursor-pointer transition-all"
                        title="এই কাস্টমারের সকল মেমো দেখুন"
                      >
                        <ShoppingBag className="h-3 w-3 text-amber-600" />
                        <span>{memoCount} টি মেমো</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                        <Award className="h-3 w-3 text-emerald-600" />
                        <span>{points} Pts</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                      ৳{c.currentBalance.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit Customer"
                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCustomer(c)}
                        title="Delete Customer"
                        className="p-1 rounded cursor-pointer text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setQuickLedgerCustomer(c);
                          setSelectedCustomerIdForLedger(c.id);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Ledger</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CUSTOMER MEMOS / ORDERS LIST MODAL */}
      {memosCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Customer Order History & Memo List (কাস্টমারের মেমো লিস্ট)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{memosCustomer.name}</h3>
                <p className="text-xs text-slate-500">📱 {memosCustomer.phone} • {memosCustomer.address || 'No Address'}</p>
              </div>
              <button
                onClick={() => setMemosCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Total Summary Row */}
            {(() => {
              const cOrders = getCustomerOrders(memosCustomer);
              const totalSpent = cOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
              const totalPaid = cOrders.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
              const totalDue = cOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);

              return (
                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Memos (মেমো)</span>
                    <span className="font-bold text-blue-900 text-sm">{cOrders.length} টি</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Purchased (মোট ক্রয়)</span>
                    <span className="font-bold text-slate-900 text-sm">৳{totalSpent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Paid (সংগৃহীত)</span>
                    <span className="font-bold text-emerald-700 text-sm">৳{totalPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Current Balance Due (বাকী)</span>
                    <span className="font-bold text-rose-700 text-sm">৳{totalDue.toLocaleString()}</span>
                  </div>
                </div>
              );
            })()}

            {/* Memos List Table (Ordered sequentially) */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold w-10"># Srl</th>
                    <th className="py-2.5 px-3 font-semibold">Memo ID & Date</th>
                    <th className="py-2.5 px-3 font-semibold">Channel & Courier</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total (৳)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Paid (৳)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Due (৳)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getCustomerOrders(memosCustomer).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        এই কাস্টমারের কোনো মেমো বা অর্ডার পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    getCustomerOrders(memosCustomer).map((so, idx) => (
                      <tr key={so.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-blue-900 block">{so.id}</span>
                          <span className="text-[10px] text-slate-500">{so.orderDate}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-slate-800 block">{so.orderType}</span>
                          {so.courierService && (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                              {so.courierService}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                          ৳{so.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          ৳{so.advancePaid.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-700">
                          ৳{so.dueAmount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedPrintOrder(so);
                              setActiveModule('invoice_print');
                              setMemosCustomer(null);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Print Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CUSTOMER LEDGER MODAL */}
      {quickLedgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Customer Ledger Statement (কাস্টমার লেজার)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{quickLedgerCustomer.name} ({quickLedgerCustomer.id})</h3>
                <p className="text-xs text-slate-500">Phone: {quickLedgerCustomer.phone} • Address: {quickLedgerCustomer.address || 'N/A'}</p>
              </div>
              <button
                onClick={() => setQuickLedgerCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Balance Summary */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Opening Balance</span>
                <span className="font-bold text-slate-900">৳{quickLedgerCustomer.openingBalance.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Credit Limit</span>
                <span className="font-bold text-slate-900">৳{quickLedgerCustomer.creditLimit.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Receivables Due</span>
                <span className="font-black text-rose-700 text-sm">৳{quickLedgerCustomer.currentBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date & Trx ID</th>
                    <th className="py-2.5 px-3 font-semibold">Particulars / Ref</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Debit (Sale)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Credit (Payment)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerLedgers.filter(l => l.customerId === quickLedgerCustomer.id).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No ledger transactions logged for this customer.
                      </td>
                    </tr>
                  ) : (
                    customerLedgers.filter(l => l.customerId === quickLedgerCustomer.id).map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-600">
                          <span className="block font-medium">{l.entryDate}</span>
                          <span className="font-mono text-[10px] text-slate-400">{l.id}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">{l.particulars}</span>
                          <span className="text-[10px] text-slate-400">Ref: {l.referenceId}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-700">
                          {l.debit > 0 ? `৳${l.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          {l.credit > 0 ? `৳${l.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-black text-slate-900">
                          ৳{l.runningBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 shrink-0">
              <button
                onClick={() => {
                  setSelectedCustomerIdForLedger(quickLedgerCustomer.id);
                  setQuickLedgerCustomer(null);
                  setActiveModule('customer_ledger');
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                Go to Full Module 16 Customer Ledger →
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setQuickLedgerCustomer(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Retail' | 'Wholesale' })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit (৳)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Balance Due (৳)</label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Customer Record?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to delete customer <strong className="text-slate-900">{deletingCustomer.name}</strong> ({deletingCustomer.id})? This will remove the account from the directory.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(deletingCustomer.id);
                  setDeletingCustomer(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
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
