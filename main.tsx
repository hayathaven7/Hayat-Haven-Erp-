import React, { useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Shield, Lock, CheckSquare, Square, UserPlus, KeyRound, Upload, Camera, User as UserIcon, FileText, X } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModuleType, UserAccount, UserRole } from '../../types/erp';
import { ALL_ERP_MODULES } from '../../data/initialData';

const MODULE_GROUPS: { groupName: string; modules: { id: ModuleType; label: string }[] }[] = [
  {
    groupName: 'Core & System Administration',
    modules: [
      { id: 'dashboard', label: '1. Executive Dashboard' },
      { id: 'company_settings', label: '2. Company Settings' },
      { id: 'user_roles', label: '25. User Roles & Access Rules' },
      { id: 'app_settings', label: '24. AppSheet Data Engine Specs' },
    ],
  },
  {
    groupName: 'CRM & Contact Directories',
    modules: [
      { id: 'customers', label: '3. Customers Directory' },
      { id: 'suppliers', label: '4. Suppliers Directory' },
    ],
  },
  {
    groupName: 'Catalog & Inventory Control',
    modules: [
      { id: 'categories', label: '5. Categories Management' },
      { id: 'brands', label: '6. Brands Management' },
      { id: 'products', label: '7. Master Products Catalog' },
      { id: 'stock_movement', label: '15. Stock Movement Ledger' },
    ],
  },
  {
    groupName: 'Sales & POS Order Management',
    modules: [
      { id: 'sales_orders', label: '8. Sales Orders Master' },
      { id: 'sales_order_items', label: '9. Sales Order Items' },
      { id: 'invoice_print', label: '23. Invoice Print & Thermal POS' },
      { id: 'quotations', label: '28. Quotation & Price Estimate' },
    ],
  },
  {
    groupName: 'Purchasing & Procurement',
    modules: [
      { id: 'purchases', label: '10. Purchase Orders Master' },
      { id: 'purchase_items', label: '11. Purchase Order Items' },
    ],
  },
  {
    groupName: 'Finance, Payments & Ledgers',
    modules: [
      { id: 'customer_payments', label: '12. Customer Payments' },
      { id: 'supplier_payments', label: '13. Supplier Payments' },
      { id: 'expenses', label: '14. Expense Tracker' },
      { id: 'customer_ledger', label: '16. Customer Ledger' },
      { id: 'supplier_ledger', label: '17. Supplier Ledger' },
    ],
  },
  {
    groupName: 'Business Analytics & Reports',
    modules: [
      { id: 'profit_report', label: '18. Profit & Loss Report' },
      { id: 'sales_report', label: '19. Sales Analytics Report' },
      { id: 'purchase_report', label: '20. Purchase Analytics' },
      { id: 'stock_report', label: '21. Stock Valuation Report' },
      { id: 'due_report', label: '22. Customer Due Receivables' },
    ],
  },
];

export const UserRolesModule: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, activeUser, switchUserWithPassword } = useERP();

  const getInitials = (name: string) => {
    return (name || '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ name: string; url: string; type: string } | null>(null);

  // Switch User Modal State
  const [targetSwitchUser, setTargetSwitchUser] = useState<UserAccount | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);
  const [switchError, setSwitchError] = useState('');

  const [formData, setFormData] = useState<{
    username: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    avatarUrl: string;
    role: UserRole;
    allowedModules: ModuleType[];
    canDelete: boolean;
    status: 'Active' | 'Inactive';
    nidNumber: string;
    documentType: 'NID' | 'BirthCertificate' | 'Passport';
    documentUrl: string;
    designation: string;
    joiningDate: string;
  }>({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '123456',
    avatarUrl: '',
    role: 'Executive',
    allowedModules: [
      'dashboard',
      'customers',
      'products',
      'sales_orders',
      'sales_order_items',
      'customer_payments',
      'user_reports',
      'invoice_print',
    ],
    canDelete: false,
    status: 'Active',
    nidNumber: '',
    documentType: 'NID',
    documentUrl: '',
    designation: 'Executive Officer',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, documentUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      phone: '',
      password: '123456',
      avatarUrl: '',
      role: 'Executive',
      allowedModules: [
        'dashboard',
        'customers',
        'products',
        'sales_orders',
        'sales_order_items',
        'customer_payments',
        'user_reports',
        'invoice_print',
      ],
      canDelete: false,
      status: 'Active',
      nidNumber: '',
      documentType: 'NID',
      documentUrl: '',
      designation: 'Executive Officer',
      joiningDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEdit = (u: UserAccount) => {
    setEditingUser(u);
    setFormData({
      username: u.username || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      password: u.password || '123456',
      avatarUrl: u.avatarUrl || '',
      role: u.role,
      allowedModules: [...u.allowedModules],
      canDelete: u.canDelete,
      status: u.status,
      nidNumber: u.nidNumber || '',
      documentType: u.documentType || 'NID',
      documentUrl: u.documentUrl || '',
      designation: u.designation || u.role,
      joiningDate: u.joiningDate || '2023-01-01',
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({ ...editingUser, ...formData });
    } else {
      addUser(formData);
    }
    setShowModal(false);
  };

  const toggleModule = (modId: ModuleType) => {
    setFormData((prev) => {
      const exists = prev.allowedModules.includes(modId);
      if (exists) {
        return { ...prev, allowedModules: prev.allowedModules.filter((m) => m !== modId) };
      } else {
        return { ...prev, allowedModules: [...prev.allowedModules, modId] };
      }
    });
  };

  const applyPreset = (preset: 'all' | 'sales' | 'inventory' | 'accounts' | 'none') => {
    if (preset === 'all') {
      setFormData((prev) => ({ ...prev, allowedModules: [...ALL_ERP_MODULES] }));
    } else if (preset === 'sales') {
      setFormData((prev) => ({
        ...prev,
        allowedModules: [
          'dashboard',
          'customers',
          'products',
          'sales_orders',
          'sales_order_items',
          'customer_payments',
          'invoice_print',
          'due_report',
        ],
      }));
    } else if (preset === 'inventory') {
      setFormData((prev) => ({
        ...prev,
        allowedModules: [
          'dashboard',
          'products',
          'categories',
          'brands',
          'purchases',
          'purchase_items',
          'supplier_payments',
          'stock_movement',
          'stock_report',
        ],
      }));
    } else if (preset === 'accounts') {
      setFormData((prev) => ({
        ...prev,
        allowedModules: [
          'dashboard',
          'customers',
          'suppliers',
          'customer_payments',
          'supplier_payments',
          'expenses',
          'customer_ledger',
          'supplier_ledger',
          'profit_report',
          'sales_report',
          'purchase_report',
          'due_report',
          'invoice_print',
        ],
      }));
    } else if (preset === 'none') {
      setFormData((prev) => ({ ...prev, allowedModules: ['dashboard'] }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Module 25: User Roles & Executive Permissions</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define system user accounts, assign roles (Admin, Manager, Executive), and configure precise module access permissions.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User / Executive</span>
        </button>
      </div>

      {/* Active User Switcher Bar */}
      <div className="bg-gradient-to-r from-[#002E5D] to-slate-800 rounded-xl p-4 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <KeyRound className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Currently Logged In As:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                {activeUser.role}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">{activeUser.name} ({activeUser.email})</h3>
            <p className="text-[11px] text-slate-300">
              Module Access: {activeUser.role === 'Admin' ? 'All 25 Modules Unlocked' : `${activeUser.allowedModules.length} Modules Allowed`} • Delete Privileges: {activeUser.canDelete ? 'ENABLED' : 'RESTRICTED'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white/10 p-1.5 rounded-lg border border-white/10 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-200 pl-2">Switch Session:</span>
          <select
            value={activeUser.id}
            onChange={(e) => {
              const targetId = e.target.value;
              if (targetId !== activeUser.id) {
                const found = users.find((u) => u.id === targetId);
                if (found) {
                  setTargetSwitchUser(found);
                  setSwitchPassword('');
                  setSwitchError('');
                  setShowSwitchPassword(false);
                }
              }
            }}
            className="bg-slate-900 text-white text-xs font-semibold rounded px-3 py-1.5 border border-white/20 focus:outline-hidden cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users & Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Registered System Accounts & Executive Privileges ({users.length})
          </h3>
          <span className="text-[10px] text-slate-500 italic">
            Admin can edit permissions or switch sessions at any time
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">User Details</th>
              <th className="py-3 px-4 font-semibold">Contact & Designation</th>
              <th className="py-3 px-4 font-semibold text-center">NID / Document</th>
              <th className="py-3 px-4 font-semibold text-center">Role</th>
              <th className="py-3 px-4 font-semibold">Allowed Modules</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => {
              const isCurrent = u.id === activeUser.id;
              return (
                <tr key={u.id} className={`hover:bg-slate-50 ${isCurrent ? 'bg-blue-50/50' : ''}`}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 text-xs font-bold text-slate-700">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                        ) : (
                          getInitials(u.name)
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {u.name} {isCurrent && <span className="text-[10px] text-blue-600 font-semibold">(Active)</span>}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">ID: {u.username || u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-slate-800 block">{u.designation || u.role}</span>
                    <span className="text-[10px] text-slate-500 block">{u.phone || u.email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {u.nidNumber ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-700 block bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                          {u.documentType || 'NID'}: {u.nidNumber}
                        </span>
                        {u.documentUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDocPreview({ name: u.name, url: u.documentUrl!, type: u.documentType || 'NID' })
                            }
                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          >
                            <FileText className="h-3 w-3" />
                            <span>View Doc</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 block">No Image</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'Manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {u.role === 'Admin' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                          All 25 Modules Unlocked
                        </span>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                            {u.allowedModules.length} Modules Allowed
                          </span>
                          <span className="text-[10px] text-slate-500 self-center">
                            ({u.allowedModules.slice(0, 3).join(', ')}...)
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.canDelete ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.canDelete ? 'Allowed' : 'Restricted'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-1.5">
                    <button
                      onClick={() => openEdit(u)}
                      title="Edit Permissions"
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {u.id !== activeUser.id ? (
                      <button
                        onClick={() => setDeletingUser(u)}
                        title="Delete User Account"
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="p-1 text-[10px] text-blue-600 font-bold bg-blue-50 rounded" title="বর্তমানে সক্রিয় একাউন্ট">Active</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit User Modal with Granular Permission Matrix */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? `Edit Executive Permissions: ${editingUser.name}` : 'Add New User / Executive Account'}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {editingUser ? editingUser.id : 'NEW-USER'}
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
              {/* User Profile Picture Auto Upload */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="block text-xs font-bold text-slate-800">
                    User Profile Picture (প্রোফাইল ছবি / Photo)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Picture (ছবি আপলোড)</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                    {formData.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                        className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* User Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                    placeholder="e.g. Md. Kamal Hossain"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                    placeholder="kamal@hayathaven.com"
                  />
                </div>
              </div>

              {/* Phone, Designation, Joining Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (ফোন নম্বর)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                    placeholder="+880 1711-xxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation (পদবী)</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                    placeholder="e.g. Sales Officer / Accounts"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date (যোগদান)</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Document & NID Verification Upload Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>NID / Birth Certificate Identity Document (আইডি কার্ড / জন্ম নিবন্ধন)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData({ ...formData, documentType: e.target.value as 'NID' | 'BirthCertificate' | 'Passport' })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                    >
                      <option value="NID">National ID (NID)</option>
                      <option value="BirthCertificate">Birth Certificate (জন্ম নিবন্ধন)</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">NID / Reg No.</label>
                    <input
                      type="text"
                      value={formData.nidNumber}
                      onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                      placeholder="e.g. 1990123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Attach Doc File/Photo</label>
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition-all">
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      <span>{formData.documentUrl ? 'Change File' : 'Upload NID Image'}</span>
                      <input type="file" accept="image/*,.pdf" onChange={handleDocumentUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {formData.documentUrl && (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <img src={formData.documentUrl} alt="Document preview" className="h-10 w-16 object-cover rounded border" />
                      <span className="text-xs font-mono text-slate-600">Document Uploaded Successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, documentUrl: '' })}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Credentials Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Login Username / ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-blue-600 focus:outline-hidden"
                    placeholder="e.g. kamal, USR-1005"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                    placeholder="Default: 123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setFormData({ ...formData, role: newRole });
                      if (newRole === 'Admin') {
                        applyPreset('all');
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canDelete}
                      onChange={(e) => setFormData({ ...formData, canDelete: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-800">Can Delete Customer/Products</span>
                  </label>
                </div>
              </div>

              {/* Module Permission Matrix Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Module Access Permissions Matrix
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check modules this user is allowed to access in sidebar navigation.
                    </p>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => applyPreset('all')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('sales')}
                      className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[10px] font-semibold text-blue-700 cursor-pointer"
                    >
                      Sales Exec
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('inventory')}
                      className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-[10px] font-semibold text-purple-700 cursor-pointer"
                    >
                      Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('accounts')}
                      className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-[10px] font-semibold text-emerald-700 cursor-pointer"
                    >
                      Accounts
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('none')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-500 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {MODULE_GROUPS.map((group) => (
                    <div key={group.groupName} className="space-y-2">
                      <h5 className="text-[11px] font-bold text-blue-900 uppercase tracking-tight border-b border-slate-200 pb-1">
                        {group.groupName}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.modules.map((m) => {
                          const isChecked = formData.allowedModules.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              onClick={() => toggleModule(m.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{m.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  Save Executive Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">ইউজার একাউন্ট রিমুভ (Delete)</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              আপনি কি নিশ্চিতভাবে ইউজার <strong className="text-slate-900">{deletingUser.name}</strong> ({deletingUser.email || deletingUser.username || deletingUser.id}) এর একাউন্ট ডাটা ডিলিট করতে চান? ডিলিট করার পর এই আইডি বা পাসওয়ার্ড দিয়ে আর লগইন বা সুইচ করা যাবে না।
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(deletingUser.id);
                  setDeletingUser(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs cursor-pointer"
              >
                ডিলিট করুন (Confirm Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDocPreview.name} - {selectedDocPreview.type} Document</h3>
                <p className="text-[11px] text-slate-500">আপলোডকৃত জাতীয় পরিচয়পত্র / আইডি কার্ড / সার্টিফিকেট</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4 flex justify-center bg-slate-50 rounded-xl my-3 border">
              <img
                src={selectedDocPreview.url}
                alt={selectedDocPreview.name}
                className="max-h-80 max-w-full object-contain rounded shadow"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch User Security Modal */}
      {targetSwitchUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Account Switch Security (সিকিউরিটি)</span>
              </div>
              <button
                type="button"
                onClick={() => setTargetSwitchUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden">
                {targetSwitchUser.avatarUrl ? (
                  <img src={targetSwitchUser.avatarUrl} alt={targetSwitchUser.name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(targetSwitchUser.name)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{targetSwitchUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">ID: {targetSwitchUser.username || targetSwitchUser.id} • Role: {targetSwitchUser.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              <strong className="text-slate-900">{targetSwitchUser.name}</strong> এর একাউন্টে সুইচ করতে পাসওয়ার্ড প্রবেশ করান:
            </p>

            {switchError && (
              <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-2.5 rounded-xl font-medium">
                ⚠️ {switchError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSwitchError('');
                const res = switchUserWithPassword(targetSwitchUser.id, switchPassword);
                if (res.success) {
                  setTargetSwitchUser(null);
                  setSwitchPassword('');
                } else {
                  setSwitchError(res.message);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password (পাসওয়ার্ড) *
                </label>
                <input
                  type="password"
                  autoFocus
                  value={switchPassword}
                  onChange={(e) => setSwitchPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!switchPassword) {
                        setSwitchError('দয়া করে পাসওয়ার্ড লিখুন।');
                        return;
                      }
                      const res = switchUserWithPassword(targetSwitchUser.id, switchPassword);
                      if (res.success) {
                        setTargetSwitchUser(null);
                        setSwitchPassword('');
                      } else {
                        setSwitchError(res.message);
                      }
                    }
                  }}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetSwitchUser(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  লগইন ও সুইচ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
