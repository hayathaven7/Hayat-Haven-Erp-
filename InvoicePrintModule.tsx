import React, { useState } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const ExpensesModule: React.FC = () => {
  const { expenses, addExpense, deleteExpense, activeUser } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Utilities' as any,
    amount: 1500,
    paymentMethod: 'bKash' as any,
    description: '',
    referenceNo: '',
  });

  const totalExpenseAmount = expenses.reduce((acc, item) => acc + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.description) return;
    addExpense(formData);
    setShowModal(false);
    setFormData({ category: 'Utilities', amount: 1500, paymentMethod: 'bKash', description: '', referenceNo: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Module 14: Operational Expenses</h2>
          <p className="text-xs text-slate-500">
            Showroom rent, staff salary, utility bills, courier freight, marketing, and general overhead costs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expenses</span>
            <span className="text-lg font-black text-rose-700">৳{totalExpenseAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Expense ID</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold">Payment Method & Ref</th>
              <th className="py-3 px-4 font-semibold text-right">Amount (৳)</th>
              <th className="py-3 px-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-purple-900">{exp.id}</td>
                <td className="py-3 px-4 text-slate-600">{exp.expenseDate}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    {exp.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-900">{exp.description}</td>
                <td className="py-3 px-4 text-slate-600">
                  {exp.paymentMethod} {exp.referenceNo ? `(${exp.referenceNo})` : ''}
                </td>
                <td className="py-3 px-4 text-right font-bold text-rose-700">
                  ৳{exp.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center">
                  {activeUser.canDelete && (
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      title="Delete Expense"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record New Overhead Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-rose-600 focus:outline-hidden"
                >
                  <option value="Rent">Rent (Showroom / Office / Warehouse)</option>
                  <option value="Utilities">Utilities (Electricity / Water / Internet)</option>
                  <option value="Salary">Staff Salaries & Allowances</option>
                  <option value="Transport">Transport & Local Courier</option>
                  <option value="Marketing">Marketing & Sponsored Ads</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Misc">Misc / Sundry Overhead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Description / Particulars *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DESCO July electricity bill"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-rose-600 focus:outline-hidden"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No / Voucher ID</label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-DBBL-9921"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
