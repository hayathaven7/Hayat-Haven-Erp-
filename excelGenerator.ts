import React, { useState } from 'react';
import { Boxes, Plus, Search, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const StockMovementModule: React.FC = () => {
  const { stockMovements, products, addStockMovement, deleteStockMovement, activeUser } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deletingMovementId, setDeletingMovementId] = useState<string | null>(null);
  const [deleteRestrictedNotice, setDeleteRestrictedNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    movementType: 'Adjustment' as 'Purchase' | 'Sale' | 'Adjustment' | 'Damage' | 'Return',
    quantity: 5,
    referenceId: 'ADJ-MANUAL',
    remarks: 'Physical count reconciliation',
  });

  const query = (searchTerm || '').toLowerCase();
  const filteredMovements = stockMovements.filter(
    (m) =>
      (m.id && m.id.toLowerCase().includes(query)) ||
      (m.productName && m.productName.toLowerCase().includes(query)) ||
      (m.referenceId && m.referenceId.toLowerCase().includes(query))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return;
    addStockMovement(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Module 15: Stock Movements & Audits</h2>
          <p className="text-xs text-slate-500">
            Audit trail tracking physical stock entries (Purchases +, Sales -, Damage -, Manual Adjustments +/-).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, ref ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Manual Adjustment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Log ID</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Product SKU</th>
              <th className="py-3 px-4 font-semibold">Movement Type</th>
              <th className="py-3 px-4 font-semibold text-center">Qty Change</th>
              <th className="py-3 px-4 font-semibold">Ref Doc / Remarks</th>
              <th className="py-3 px-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMovements.map((m) => {
              const isPositive = m.movementType === 'Purchase' || (m.movementType === 'Adjustment' && m.quantity > 0);

              return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-500">{m.id}</td>
                  <td className="py-3 px-4 text-slate-600">{m.movementDate}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{m.productName || m.productId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        m.movementType === 'Purchase'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.movementType === 'Sale'
                          ? 'bg-blue-100 text-blue-800'
                          : m.movementType === 'Damage'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.movementType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-black ${
                        isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {isPositive ? `+${m.quantity}` : `-${Math.abs(m.quantity)}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold text-slate-800">{m.referenceId}</span>
                    {m.remarks && <span className="block text-[11px] text-slate-400">{m.remarks}</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (!activeUser?.canDelete) {
                          setDeleteRestrictedNotice(`Delete restricted for user role '${activeUser?.role || 'Guest'}'.`);
                          return;
                        }
                        setDeletingMovementId(m.id);
                      }}
                      title="Delete Entry"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record Stock Audit / Manual Adjustment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                  <select
                    value={formData.movementType}
                    onChange={(e) => setFormData({ ...formData, movementType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Adjustment">Adjustment (+/-)</option>
                    <option value="Damage">Damage (-Stock)</option>
                    <option value="Return">Customer Return (+Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Reason / Remarks</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
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
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMovementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Stock Entry?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to delete stock movement record <strong className="text-slate-900">{deletingMovementId}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingMovementId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStockMovement(deletingMovementId);
                  setDeletingMovementId(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restriction Notice Modal */}
      {deleteRestrictedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Permission Restricted</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">{deleteRestrictedNotice}</p>
            <button
              type="button"
              onClick={() => setDeleteRestrictedNotice(null)}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
