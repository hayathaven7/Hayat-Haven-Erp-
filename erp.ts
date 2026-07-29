import React, { useState } from 'react';
import { UserCheck, Plus, Phone, Mail, Search, Edit2, Trash2, AlertTriangle, FileText, Printer, X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Supplier } from '../../types/erp';

export const SuppliersModule: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, activeUser, setActiveModule, setSelectedSupplierIdForLedger, supplierLedgers, companySettings } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplierId, setDeletingSupplierId] = useState<string | null>(null);
  const [quickLedgerSupplier, setQuickLedgerSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    openingBalance: 0,
    status: 'Active' as 'Active' | 'Inactive',
  });

  const query = (searchTerm || '').toLowerCase();
  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.phone && s.phone.includes(searchTerm)) ||
      (s.id && s.id.toLowerCase().includes(query))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier({ ...editingSupplier, ...formData });
      setEditingSupplier(null);
    } else {
      addSupplier(formData);
      setShowAddModal(false);
    }
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      openingBalance: 0,
      status: 'Active',
    });
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      openingBalance: s.openingBalance,
      status: s.status,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Module 4: Suppliers Directory</h2>
          <p className="text-xs text-slate-500">
            Vendor partners, textile manufacturers, contact representatives, and live payables balance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier, contact, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
          <button
            onClick={() => {
              setEditingSupplier(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Supplier ID</th>
                <th className="py-3 px-4 font-semibold">Company Name</th>
                <th className="py-3 px-4 font-semibold">Contact Person & Phone</th>
                <th className="py-3 px-4 font-semibold text-right">Current Payable Due (৳)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-emerald-900">{s.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">{s.contactPerson || 'N/A'}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                      {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                    ৳{s.currentBalance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-1.5">
                    <button
                      onClick={() => openEdit(s)}
                      title="Edit Supplier"
                      className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSupplierId(s.id)}
                      title="Delete Supplier"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setQuickLedgerSupplier(s);
                        setSelectedSupplierIdForLedger(s.id);
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 cursor-pointer inline-flex items-center gap-1 ml-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Ledger (লেজার)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK SUPPLIER LEDGER MODAL */}
      {quickLedgerSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Supplier Ledger Statement (সাপ্লায়ার লেজার)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{quickLedgerSupplier.name} ({quickLedgerSupplier.id})</h3>
                <p className="text-xs text-slate-500">Contact: {quickLedgerSupplier.contactPerson || 'N/A'} • Phone: {quickLedgerSupplier.phone}</p>
              </div>
              <button
                onClick={() => setQuickLedgerSupplier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Balance Summary */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Opening Balance</span>
                <span className="font-bold text-slate-900">৳{quickLedgerSupplier.openingBalance.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Payable Due</span>
                <span className="font-black text-rose-700 text-sm">৳{quickLedgerSupplier.currentBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date & Trx ID</th>
                    <th className="py-2.5 px-3 font-semibold">Particulars / Ref</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Debit (Payment)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Credit (Purchase)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Payable Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierLedgers.filter(l => l.supplierId === quickLedgerSupplier.id).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No ledger transactions logged for this supplier.
                      </td>
                    </tr>
                  ) : (
                    supplierLedgers.filter(l => l.supplierId === quickLedgerSupplier.id).map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-600">
                          <span className="block font-medium">{l.entryDate}</span>
                          <span className="font-mono text-[10px] text-slate-400">{l.id}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">{l.particulars}</span>
                          <span className="text-[10px] text-slate-400">Ref: {l.referenceId}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-blue-700">
                          {l.debit > 0 ? `৳${l.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-rose-700">
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
                  setSelectedSupplierIdForLedger(quickLedgerSupplier.id);
                  setQuickLedgerSupplier(null);
                  setActiveModule('supplier_ledger');
                }}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                Go to Full Module 17 Supplier Ledger →
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
                  onClick={() => setQuickLedgerSupplier(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSupplierId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Supplier Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove supplier <strong className="text-slate-800">{deletingSupplierId}</strong> from system?
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSupplierId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSupplier(deletingSupplierId);
                  setDeletingSupplierId(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddModal || editingSupplier) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Factory / Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {!editingSupplier && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Payable Due (৳)</label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSupplier(null);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
