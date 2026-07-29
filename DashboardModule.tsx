import React, { useState } from 'react';
import { FolderTree, Tag, Plus, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const CategoriesBrandsModule: React.FC = () => {
  const { categories, addCategory, deleteCategory, brands, addBrand, deleteBrand, activeUser } = useERP();

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('Bangladesh');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory({ name: catName, description: catDesc, status: 'Active' });
    setCatName('');
    setCatDesc('');
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    addBrand({ name: brandName, countryOfOrigin: brandOrigin, status: 'Active' });
    setBrandName('');
    setBrandOrigin('Bangladesh');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Modules 5 & 6: Categories & Brands Taxonomy</h2>
        <p className="text-xs text-slate-500">
          Define product classifications, department categories, and brand origin labels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Module 5: Product Categories</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{categories.length} Categories</span>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Traditional Wear"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Brief category summary"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {categories.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-900">{c.id}</span>
                    <span className="font-bold text-xs text-slate-900">{c.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {c.status}
                  </span>
                  {activeUser.canDelete && (
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Module 6: Product Brands</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{brands.length} Brands</span>
          </div>

          <form onSubmit={handleAddBrand} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Artisans"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country Of Origin</label>
              <input
                type="text"
                placeholder="e.g. Bangladesh"
                value={brandOrigin}
                onChange={(e) => setBrandOrigin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Brand</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {brands.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-purple-900">{b.id}</span>
                    <span className="font-bold text-xs text-slate-900">{b.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Origin: {b.countryOfOrigin}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {b.status}
                  </span>
                  {activeUser.canDelete && (
                    <button
                      onClick={() => deleteBrand(b.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      title="Delete Brand"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
