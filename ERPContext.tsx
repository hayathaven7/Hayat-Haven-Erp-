import React, { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, Barcode, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product } from '../../types/erp';

export const ProductsModule: React.FC = () => {
  const { products, categories, brands, addProduct, updateProduct, deleteProduct, activeUser } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    barcode: '',
    imageUrl: '',
    name: '',
    categoryId: categories[0]?.id || '',
    brandId: brands[0]?.id || '',
    unit: 'Pcs',
    size: 'M',
    buyingPrice: 1000,
    sellingPrice: 2000,
    minSellingPrice: 1800,
    openingStock: 20,
    lowStockAlert: 10,
    status: 'Active' as 'Active' | 'Discontinued',
  });

  const query = (searchTerm || '').toLowerCase();
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.barcode && p.barcode.includes(searchTerm)) ||
      (p.id && p.id.toLowerCase().includes(query));
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData });
      setEditingProduct(null);
    } else {
      addProduct(formData);
      setShowModal(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      barcode: p.barcode,
      imageUrl: p.imageUrl,
      name: p.name,
      categoryId: p.categoryId,
      brandId: p.brandId,
      unit: p.unit,
      size: p.size,
      buyingPrice: p.buyingPrice,
      sellingPrice: p.sellingPrice,
      minSellingPrice: p.minSellingPrice,
      openingStock: p.openingStock,
      lowStockAlert: p.lowStockAlert,
      status: p.status,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Module 7: Master Products Catalog</h2>
          <p className="text-xs text-slate-500">
            Inventory items with Barcode, Images, Category, Brand, Units, Size, Buying/Selling Price, Stock Alerts & Status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 rounded bg-[#002E5D] px-3.5 py-2 text-[11px] font-bold uppercase tracking-tight text-white shadow-xs hover:bg-[#001D3A] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">Inventory Status Control</h3>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Showing {filteredProducts.length} Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
              <tr>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider w-14">Img</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">SKU / Barcode</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">Product Description</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">Category</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider text-right">Buy Price</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider text-right">Sell Price</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider text-center">Stock</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider text-center">Status</th>
                <th className="p-3 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const brand = brands.find((b) => b.id === p.brandId);
                const isLowStock = p.currentStock <= p.lowStockAlert;

                return (
                  <tr key={p.id} className={`hover:bg-blue-50 transition-colors cursor-pointer ${isLowStock ? 'bg-amber-50/40' : ''}`}>
                    <td className="p-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-9 w-9 object-cover rounded border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-9 w-9 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#002E5D] block">{p.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Barcode className="h-3 w-3 opacity-60" />
                        {p.barcode || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span className="font-medium text-slate-800 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Unit: {p.unit} • Spec: {p.size}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span className="text-slate-700 font-semibold block">{cat ? cat.name : p.categoryId}</span>
                      <span className="text-[10px] text-slate-500 italic">{brand ? brand.name : p.brandId}</span>
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      ৳{p.buyingPrice.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-blue-800 font-bold">
                      ৳{p.sellingPrice.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          isLowStock
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-1">
                      <button
                        onClick={() => openEdit(p)}
                        title="Edit Product SKU"
                        className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-100/50 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        title="Delete Product SKU"
                        className="p-1 rounded cursor-pointer text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {(showModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Master Product SKU' : 'Add New Product SKU'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form id="product-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode / EAN-13 Code</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Box">Box</option>
                    <option value="Ctn">Ctn</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Set">Set</option>
                    <option value="Pair">Pair</option>
                    <option value="Bottle">Bottle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Size / Specification</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Buying Price (Cost) (৳) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (Retail) (৳) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Wholesale Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minSellingPrice}
                    onChange={(e) => setFormData({ ...formData, minSellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: parseInt(e.target.value) || 5 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {!editingProduct && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({ ...formData, openingStock: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Picture (ছবি আপলোড / Image)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload File (ছবি বাছুন)</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {formData.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Or enter web image URL: https://..."
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </form>
            <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-98 cursor-pointer transition-all shadow-md"
              >
                Save Product SKU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Product SKU?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to delete product SKU <strong className="text-slate-900">{deletingProduct.name}</strong> ({deletingProduct.id})? This will remove the item from the catalog.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(deletingProduct.id);
                  setDeletingProduct(null);
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
