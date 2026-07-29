import React, { useState, useEffect } from 'react';
import { BookOpen, Users, UserCheck, Printer, Search, Trash2, ArrowUpRight, ArrowDownLeft, CheckSquare, Square, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const LedgersModule: React.FC = () => {
  const {
    customers,
    suppliers,
    customerLedgers,
    supplierLedgers,
    activeModule,
    selectedCustomerIdForLedger,
    setSelectedCustomerIdForLedger,
    selectedSupplierIdForLedger,
    setSelectedSupplierIdForLedger,
    deleteCustomerLedgerEntry,
    deleteSupplierLedgerEntry,
    batchDeleteCustomerLedgers,
    batchDeleteSupplierLedgers,
    activeUser,
    companySettings,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>(
    activeModule === 'supplier_ledger' ? 'supplier' : 'customer'
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    selectedCustomerIdForLedger || customers[0]?.id || ''
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    selectedSupplierIdForLedger || suppliers[0]?.id || ''
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerLedgerIds, setSelectedCustomerLedgerIds] = useState<string[]>([]);
  const [selectedSupplierLedgerIds, setSelectedSupplierLedgerIds] = useState<string[]>([]);

  // Confirmation Modals State (Replaces blocked window.confirm / window.alert)
  const [deletingEntry, setDeletingEntry] = useState<{ id: string; type: 'customer' | 'supplier' } | null>(null);
  const [batchDeletingType, setBatchDeletingType] = useState<'customer' | 'supplier' | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Update selected IDs if context changes from another module
  useEffect(() => {
    if (selectedCustomerIdForLedger) {
      setSelectedCustomerId(selectedCustomerIdForLedger);
    }
  }, [selectedCustomerIdForLedger]);

  useEffect(() => {
    if (selectedSupplierIdForLedger) {
      setSelectedSupplierId(selectedSupplierIdForLedger);
    }
  }, [selectedSupplierIdForLedger]);

  useEffect(() => {
    if (activeModule === 'supplier_ledger') {
      setActiveTab('supplier');
    } else if (activeModule === 'customer_ledger') {
      setActiveTab('customer');
    }
  }, [activeModule]);

  const query = (searchTerm || '').toLowerCase();

  const filteredCustomerLedger = customerLedgers
    .filter((l) => l.customerId === selectedCustomerId)
    .filter(
      (l) =>
        (l.particulars && l.particulars.toLowerCase().includes(query)) ||
        (l.id && l.id.toLowerCase().includes(query)) ||
        (l.referenceId && l.referenceId.toLowerCase().includes(query))
    );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const filteredSupplierLedger = supplierLedgers
    .filter((l) => l.supplierId === selectedSupplierId)
    .filter(
      (l) =>
        (l.particulars && l.particulars.toLowerCase().includes(query)) ||
        (l.id && l.id.toLowerCase().includes(query)) ||
        (l.referenceId && l.referenceId.toLowerCase().includes(query))
    );

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handlePrint = () => {
    window.print();
  };

  const canDelete = activeUser?.role === 'Admin' || activeUser?.canDelete;

  const handleSingleDeleteClick = (id: string, type: 'customer' | 'supplier') => {
    if (!canDelete) {
      setPermissionError(`ডিলিট করার অনুমতি নেই। আপনার বর্তমান রোল: '${activeUser?.role || 'Guest'}'.`);
      return;
    }
    setDeletingEntry({ id, type });
  };

  const handleBatchDeleteClick = (type: 'customer' | 'supplier') => {
    if (!canDelete) {
      setPermissionError(`ডিলিট করার অনুমতি নেই। আপনার বর্তমান রোল: '${activeUser?.role || 'Guest'}'.`);
      return;
    }
    setBatchDeletingType(type);
  };

  const executeConfirmDeleteSingle = () => {
    if (!deletingEntry) return;
    if (deletingEntry.type === 'customer') {
      deleteCustomerLedgerEntry(deletingEntry.id);
      setSelectedCustomerLedgerIds((prev) => prev.filter((id) => id !== deletingEntry.id));
    } else {
      deleteSupplierLedgerEntry(deletingEntry.id);
      setSelectedSupplierLedgerIds((prev) => prev.filter((id) => id !== deletingEntry.id));
    }
    setDeletingEntry(null);
  };

  const executeConfirmDeleteBatch = () => {
    if (!batchDeletingType) return;
    if (batchDeletingType === 'customer') {
      batchDeleteCustomerLedgers(selectedCustomerLedgerIds);
      setSelectedCustomerLedgerIds([]);
    } else {
      batchDeleteSupplierLedgers(selectedSupplierLedgerIds);
      setSelectedSupplierLedgerIds([]);
    }
    setBatchDeletingType(null);
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Modules 16 & 17: Customer & Supplier Ledgers (লেজার খাতা)
          </h2>
          <p className="text-xs text-slate-500">
            Double-entry ledger statement showing complete transaction histories and live running balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>Print Ledger Statement</span>
          </button>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'customer' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4 text-blue-600" />
              <span>16. Customer Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab('supplier')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'supplier' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>17. Supplier Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Company Header (Visible only when printing) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-black text-slate-900">{companySettings.companyName}</h1>
        <p className="text-xs text-slate-600">{companySettings.address} • Phone: {companySettings.phone}</p>
        <h2 className="text-base font-bold uppercase mt-2 text-blue-900">
          {activeTab === 'customer' ? 'Customer Account Statement' : 'Supplier Account Statement'}
        </h2>
      </div>

      {/* Tab 16: Customer Ledger */}
      {activeTab === 'customer' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:border-none print:p-0">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Select Customer Account:</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSelectedCustomerIdForLedger(e.target.value);
                  setSelectedCustomerLedgerIds([]);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden print:border-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) — Due: ৳{(c.currentBalance || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              {filteredCustomerLedger.length > 0 && (
                <button
                  onClick={() => {
                    if (selectedCustomerLedgerIds.length === filteredCustomerLedger.length) {
                      setSelectedCustomerLedgerIds([]);
                    } else {
                      setSelectedCustomerLedgerIds(filteredCustomerLedger.map((l) => l.id));
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-all border border-slate-300"
                >
                  {selectedCustomerLedgerIds.length === filteredCustomerLedger.length && filteredCustomerLedger.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                  <span>
                    {selectedCustomerLedgerIds.length === filteredCustomerLedger.length && filteredCustomerLedger.length > 0
                      ? 'Unselect All'
                      : `Select All (${filteredCustomerLedger.length})`}
                  </span>
                </button>
              )}

              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-2 py-1 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            {selectedCustomer && (
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Phone</span>
                  <span className="font-bold text-slate-800">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Opening Balance</span>
                  <span className="font-bold text-slate-800">৳{(selectedCustomer.openingBalance || 0).toLocaleString()}</span>
                </div>
                <div className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                  <span className="text-amber-800 block font-bold text-[10px] uppercase">Current Due Receivables</span>
                  <span className="font-black text-amber-900 text-sm">৳{(selectedCustomer.currentBalance || 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* BATCH DELETE BAR - CUSTOMER LEDGER */}
          {selectedCustomerLedgerIds.length > 0 && (
            <div className="bg-blue-900 text-white p-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-blue-700 animate-fade-in print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-blue-800 px-2.5 py-1 rounded-lg border border-blue-600 text-amber-300 font-mono">
                  {selectedCustomerLedgerIds.length} Ledger Entries Selected
                </span>
                <span>সিলেক্টকৃত কাস্টমার লেজার এন্ট্রি ডিলিট করতে পারেন:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBatchDeleteClick('customer')}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Batch Delete (ব্যাচ ডিলিট)</span>
                </button>

                <button
                  onClick={() => setSelectedCustomerLedgerIds([])}
                  className="text-xs text-blue-200 hover:text-white px-2 py-1 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="py-3 px-3 text-center print:hidden w-10">Select</th>
                  <th className="py-3 px-4 font-semibold">Trx ID</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Transaction Particulars</th>
                  <th className="py-3 px-4 font-semibold text-right">Debit (+) (Sale)</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit (-) (Payment)</th>
                  <th className="py-3 px-4 font-semibold text-right">Running Balance Due (৳)</th>
                  <th className="py-3 px-4 font-semibold text-center print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomerLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No ledger transactions found for this customer account.
                    </td>
                  </tr>
                ) : (
                  filteredCustomerLedger.map((l) => {
                    const isSelected = selectedCustomerLedgerIds.includes(l.id);
                    return (
                      <tr key={l.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-blue-50/60' : ''}`}>
                        <td className="py-3 px-3 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCustomerLedgerIds(selectedCustomerLedgerIds.filter((id) => id !== l.id));
                              } else {
                                setSelectedCustomerLedgerIds([...selectedCustomerLedgerIds, l.id]);
                              }
                            }}
                            className="p-1 text-slate-600 hover:text-blue-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{l.id}</td>
                        <td className="py-3 px-4 text-slate-600">{l.entryDate || l.date}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{l.particulars || l.transactionType}</span>
                          <span className="text-[10px] text-slate-400">Ref Doc: {l.referenceId}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700">
                          {(l.debit || 0) > 0 ? `৳${(l.debit || 0).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {(l.credit || 0) > 0 ? `৳${(l.credit || 0).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          ৳{(l.runningBalance ?? l.balance ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => handleSingleDeleteClick(l.id, 'customer')}
                            title="Delete Entry"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 17: Supplier Ledger */}
      {activeTab === 'supplier' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:border-none print:p-0">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Select Supplier Account:</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => {
                  setSelectedSupplierId(e.target.value);
                  setSelectedSupplierIdForLedger(e.target.value);
                  setSelectedSupplierLedgerIds([]);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-hidden print:border-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) — Payable Due: ৳{(s.currentBalance || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              {filteredSupplierLedger.length > 0 && (
                <button
                  onClick={() => {
                    if (selectedSupplierLedgerIds.length === filteredSupplierLedger.length) {
                      setSelectedSupplierLedgerIds([]);
                    } else {
                      setSelectedSupplierLedgerIds(filteredSupplierLedger.map((l) => l.id));
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-all border border-slate-300"
                >
                  {selectedSupplierLedgerIds.length === filteredSupplierLedger.length && filteredSupplierLedger.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                  <span>
                    {selectedSupplierLedgerIds.length === filteredSupplierLedger.length && filteredSupplierLedger.length > 0
                      ? 'Unselect All'
                      : `Select All (${filteredSupplierLedger.length})`}
                  </span>
                </button>
              )}

              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-2 py-1 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {selectedSupplier && (
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Contact Rep</span>
                  <span className="font-bold text-slate-800">{selectedSupplier.contactPerson || selectedSupplier.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Opening Balance</span>
                  <span className="font-bold text-slate-800">৳{(selectedSupplier.openingBalance || 0).toLocaleString()}</span>
                </div>
                <div className="bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                  <span className="text-rose-800 block font-bold text-[10px] uppercase">Current Payable Due</span>
                  <span className="font-black text-rose-900 text-sm">৳{(selectedSupplier.currentBalance || 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* BATCH DELETE BAR - SUPPLIER LEDGER */}
          {selectedSupplierLedgerIds.length > 0 && (
            <div className="bg-emerald-900 text-white p-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-emerald-700 animate-fade-in print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-600 text-amber-300 font-mono">
                  {selectedSupplierLedgerIds.length} Ledger Entries Selected
                </span>
                <span>সিলেক্টকৃত সাপ্লায়ার লেজার এন্ট্রি ডিলিট করতে পারেন:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBatchDeleteClick('supplier')}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Batch Delete (ব্যাচ ডিলিট)</span>
                </button>

                <button
                  onClick={() => setSelectedSupplierLedgerIds([])}
                  className="text-xs text-emerald-200 hover:text-white px-2 py-1 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-900 text-white">
                <tr>
                  <th className="py-3 px-3 text-center print:hidden w-10">Select</th>
                  <th className="py-3 px-4 font-semibold">Trx ID</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Transaction Particulars</th>
                  <th className="py-3 px-4 font-semibold text-right">Debit (-) (Payment)</th>
                  <th className="py-3 px-4 font-semibold text-right">Credit (+) (Purchase)</th>
                  <th className="py-3 px-4 font-semibold text-right">Running Balance Due (৳)</th>
                  <th className="py-3 px-4 font-semibold text-center print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSupplierLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No ledger transactions found for this supplier account.
                    </td>
                  </tr>
                ) : (
                  filteredSupplierLedger.map((l) => {
                    const isSelected = selectedSupplierLedgerIds.includes(l.id);
                    return (
                      <tr key={l.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/60' : ''}`}>
                        <td className="py-3 px-3 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSupplierLedgerIds(selectedSupplierLedgerIds.filter((id) => id !== l.id));
                              } else {
                                setSelectedSupplierLedgerIds([...selectedSupplierLedgerIds, l.id]);
                              }
                            }}
                            className="p-1 text-slate-600 hover:text-emerald-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{l.id}</td>
                        <td className="py-3 px-4 text-slate-600">{l.entryDate || l.date}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{l.particulars || l.transactionType}</span>
                          <span className="text-[10px] text-slate-400">Ref Doc: {l.referenceId}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-700">
                          {(l.debit || 0) > 0 ? `৳${(l.debit || 0).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700">
                          {(l.credit || 0) > 0 ? `৳${(l.credit || 0).toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          ৳{(l.runningBalance ?? l.balance ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => handleSingleDeleteClick(l.id, 'supplier')}
                            title="Delete Entry"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE ENTRY DELETE CONFIRMATION MODAL */}
      {deletingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:hidden animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {deletingEntry.type === 'customer' ? 'কাস্টমার লেজার এন্ট্রি ডিলিট' : 'সাপ্লায়ার লেজার এন্ট্রি ডিলিট'}
                </h3>
                <span className="text-xs font-mono text-slate-500">{deletingEntry.id}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              আপনি কি নিশ্চিত যে লেজার ট্রানজ্যাকশন <strong className="text-slate-900 font-mono">{deletingEntry.id}</strong> চিরতরে মুছে ফেলতে চান? এটি ডিলিট করলে খাতার বাকি হিসেব স্বয়ংক্রিয়ভাবে আপডেট হবে।
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={executeConfirmDeleteSingle}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-xs transition-colors"
              >
                হ্যাঁ, ডিলিট করুন (Confirm Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {batchDeletingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:hidden animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {batchDeletingType === 'customer' ? 'কাস্টমার ব্যাচ ডিলিট' : 'সাপ্লায়ার ব্যাচ ডিলিট'}
                </h3>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  {batchDeletingType === 'customer' ? selectedCustomerLedgerIds.length : selectedSupplierLedgerIds.length} টি সিলেক্টকৃত এন্ট্রি
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              আপনি কি নিশ্চিত যে সিলেক্টকৃত{' '}
              <strong className="text-red-700 font-black">
                {batchDeletingType === 'customer' ? selectedCustomerLedgerIds.length : selectedSupplierLedgerIds.length}
              </strong>{' '}
              টি লেজার ট্রানজ্যাকশন একসাথে মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBatchDeletingType(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={executeConfirmDeleteBatch}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-xs transition-colors"
              >
                হ্যাঁ, ব্যাচ ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION ERROR MODAL */}
      {permissionError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:hidden animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">অনুমতি নেই (Access Restricted)</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200">
              {permissionError}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPermissionError(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                ঠিক আছে (OK)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
