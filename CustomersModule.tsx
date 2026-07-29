import React, { useState } from 'react';
import { X, Plus, Trash2, Truck, CheckCircle, Barcode, Search } from 'lucide-react';
import { useERP } from '../context/ERPContext';

interface PurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
}

export const NewPurchaseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { suppliers, products, createPurchase, setActiveModule } = useERP();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<PurchaseItemInput[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const handleBarcodeScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const q = query.toLowerCase();
    const matchedProduct = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === q) ||
        (p.id && p.id.toLowerCase() === q) ||
        (p.name && p.name.toLowerCase().includes(q))
    );

    if (matchedProduct) {
      const existingIndex = items.findIndex((item) => item.productId === matchedProduct.id);

      if (existingIndex >= 0) {
        setItems((prev) =>
          prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
        );
      } else {
        setItems((prev) => [...prev, { productId: matchedProduct.id, quantity: 1, unitCost: matchedProduct.buyingPrice }]);
      }

      setScanMessage(`✅ Added to Purchase: ${matchedProduct.name}`);
      setBarcodeInput('');
      setTimeout(() => setScanMessage(null), 3000);
    } else {
      setScanMessage(`❌ Product not found for code: "${query}"`);
      setTimeout(() => setScanMessage(null), 3500);
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setItems((prev) => [...prev, { productId: firstProd.id, quantity: 10, unitCost: firstProd.buyingPrice }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId,
              unitCost: prod ? prod.buyingPrice : 0,
            }
          : item
      )
    );
  };

  const handleQtyChange = (index: number, quantity: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item)));
  };

  const handleCostChange = (index: number, unitCost: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, unitCost: Math.max(0, unitCost) } : item)));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount + transportCost);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    createPurchase({
      supplierId,
      invoiceNumber,
      subtotal,
      discountAmount,
      transportCost,
      grandTotal,
      paidAmount,
      status: 'Received',
      notes,
      items,
    });

    setActiveModule('purchases');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between bg-emerald-900 px-5 py-3.5 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <Truck className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">New Supplier Purchase Order</h2>
              <p className="text-xs text-emerald-200">Auto Stock Increase & Supplier Ledger Post</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="new-purchase-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Partner *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Payable Due: ৳{s.currentBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Ref Invoice No *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* BARCODE SCANNER QUICK ADD BAR */}
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Barcode className="h-4 w-4" />
                <span>Barcode / SKU Quick Scanner (বারকোড স্ক্যানার)</span>
              </span>
              <span className="text-[10px] text-slate-400">Scan barcode or type SKU to add purchase item</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeScan();
                    }
                  }}
                  placeholder="Scan product barcode / enter SKU code (e.g. 890123456789 or PRD-1001)..."
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => handleBarcodeScan()}
                className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-400 cursor-pointer transition-all"
              >
                Scan Item
              </button>
            </div>
            {scanMessage && (
              <div
                className={`text-xs font-bold p-2 rounded-lg border ${
                  scanMessage.includes('✅')
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                {scanMessage}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Stock Purchase Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Product SKU</th>
                  <th className="py-2.5 px-3 font-semibold w-28">Qty (+Stock)</th>
                  <th className="py-2.5 px-3 font-semibold w-32">Unit Buying Cost (৳)</th>
                  <th className="py-2.5 px-3 font-semibold w-32">Total Cost (৳)</th>
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-700">কোন পচেজ আইটেম যোগ করা হয়নি</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ক্রয়কৃত প্রোডাক্ট স্টক যোগ করতে ওপরের <span className="font-bold text-emerald-600">+ Add Item</span> বোতামে ক্লিক করুন।
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-emerald-600 focus:outline-hidden"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Current: {p.currentStock} {p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-right focus:border-emerald-600 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitCost}
                          onChange={(e) => handleCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-right focus:border-emerald-600 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ৳{(item.quantity * item.unitCost).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Discount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transport / Freight Expense (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={transportCost}
                  onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Internal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Stock received in Mirpur warehouse"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Subtotal Items:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Discount Received:</span>
                <span className="font-semibold text-emerald-600">-৳{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Freight Cost:</span>
                <span className="font-semibold text-slate-900">+৳{transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 text-sm font-bold text-emerald-950">
                <span>Grand Total Cost:</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">Paid to Supplier (৳)</label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-blue-400 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-between py-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                <span>Pending Payable Due:</span>
                <span>৳{dueAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </form>

        {/* Modal Fixed Footer Actions */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-purchase-form"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Record Purchase & Update Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
