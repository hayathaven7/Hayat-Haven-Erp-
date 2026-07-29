import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, Upload, AlertTriangle, RotateCcw, Lock } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const CompanySettingsModule: React.FC = () => {
  const { companySettings, updateCompanySettings, resetFullERPData } = useERP();
  const [formData, setFormData] = useState(companySettings);
  const [saved, setSaved] = useState(false);

  // System Reset Modal / Form State
  const [showResetModal, setShowResetModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    const res = resetFullERPData(adminPassword);
    setResetMessage({ success: res.success, text: res.message });
    if (res.success) {
      setAdminPassword('');
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage(null);
      }, 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Module 1: Company Settings</h2>
          <p className="text-xs text-slate-500">
            Configure enterprise parameters, logo, currency, address, Tax BIN ID, and invoice terms.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>Company settings saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Business Name *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Type *</label>
            <input
              type="text"
              required
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol / Code *</label>
            <input
              type="text"
              required
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Phone Number *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tax / BIN ID <span className="text-slate-400 font-normal">(যদি না থাকে খালি রাখুন - মেমোতে BIN দেখাবে না)</span>
            </label>
            <input
              type="text"
              value={formData.taxId}
              placeholder="খালি রাখলে মেমোতে BIN দেখাবে না"
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Page Link (মেমো কিউআর কোডের জন্য) *</label>
            <input
              type="text"
              value={formData.facebookPageUrl || ''}
              onChange={(e) => setFormData({ ...formData, facebookPageUrl: e.target.value })}
              placeholder="https://www.facebook.com/hayathaven7"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Official Business Logo (লোগো ছবি আপলোড)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="h-16 w-28 bg-white border border-slate-200 rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Business Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpg';
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase">No Logo</span>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Logo File (স্বয়ংসক্রিয় লোগো বাছুন)</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '/logo.jpg' })}
                      className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="/logo.jpg or image URL"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium focus:border-blue-600 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Head Office Address *</label>
            <textarea
              rows={3}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Details</label>
            <textarea
              rows={3}
              value={formData.bankDetails}
              onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Terms & Policy</label>
          <textarea
            rows={3}
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        {/* DEFAULT PRINTER & MEMO PAPER SIZE CONFIGURATION SECTION */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800 text-white rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg text-sm">🖨️</span>
              <div>
                <h3 className="text-sm font-bold text-white">Default Printer & Paper Size (ডিফল্ট প্রিন্টার এবং মেমো সাইজ)</h3>
                <p className="text-[11px] text-indigo-200">
                  অর্ডার সেভ বা প্রিন্ট বাটনে ক্লিক করলে আপনার পছন্দের সাইজ ও প্রিন্টার অপশন স্বয়ংক্রিয়ভাবে সক্রিয় হবে।
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-indigo-900/80 px-3 py-1.5 rounded-xl border border-indigo-700">
              <input
                type="checkbox"
                checked={formData.enableAutoPrintOnSave ?? true}
                onChange={(e) => setFormData({ ...formData, enableAutoPrintOnSave: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
              />
              <span className="text-xs font-bold text-indigo-100">
                {formData.enableAutoPrintOnSave ? '⚡ অর্ডার সেভে অটো প্রিন্ট ওপেন' : '⏸️ ম্যানুয়াল প্রিন্ট'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-100 mb-1">
                📄 Default Paper Size (ডিফল্ট পেপার সাইজ)
              </label>
              <select
                value={formData.defaultPaperSize || 'pos3in'}
                onChange={(e) => setFormData({ ...formData, defaultPaperSize: e.target.value as any })}
                className="w-full rounded-xl border border-indigo-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
              >
                <option value="pos3in">🧾 POS Thermal 3" / 80mm (৩ ইঞ্চি থার্মাল রসিদ - Standard)</option>
                <option value="pos2in">🧾 POS Thermal 2" / 58mm (২ ইঞ্চি থার্মাল রসিদ - Mini/Portable)</option>
                <option value="a4">📄 Normal Printer A4 Size (ফুল পেজ মেমো)</option>
                <option value="a5">📜 Normal Printer A5 Size (হাফ পেজ মেমো)</option>
              </select>
              <span className="text-[10px] text-indigo-300 mt-1 block">
                মোবাইল বা পোর্টেবল থার্মাল প্রিন্টারের জন্য POS 2" বা 3" নির্বাচন করুন।
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-100 mb-1">
                🛜 Default Printer Mode (ডিফল্ট প্রিন্টার টাইপ)
              </label>
              <select
                value={formData.defaultPrinterMode || 'standard'}
                onChange={(e) => setFormData({ ...formData, defaultPrinterMode: e.target.value as any })}
                className="w-full rounded-xl border border-indigo-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-hidden"
              >
                <option value="standard">💻 Standard Printer / PDF (সরাসরি সিস্টেম উইন্ডোজ/ম্যাক/পিডিএফ)</option>
                <option value="bluetooth">🛜 Web Bluetooth Direct ESC/POS Thermal Printer</option>
                <option value="rawbt">📱 Android RawBT Mobile Printer App (এক-ক্লিকে এন্ড্রয়েড ప్రిন্ট)</option>
              </select>
              <span className="text-[10px] text-indigo-300 mt-1 block">
                প্রিন্ট করার সময় ডিরেক্ট কোনটি ব্যবহার করা হবে তা নির্বাচন করে সেভ করুন।
              </span>
            </div>
          </div>
        </div>

        {/* SMS GATEWAY & AUTO-SMS CONFIGURATION SECTION */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-lg">📱</span>
              <h3 className="text-sm font-bold text-slate-900">Auto SMS System & SMS Gateway Settings (অটো মেসেজ সেটিংস)</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAutoSms ?? true}
                onChange={(e) => setFormData({ ...formData, enableAutoSms: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                {formData.enableAutoSms ? '🟢 অটো এসএমএস চালু (Active)' : '🔴 অটো এসএমএস বন্ধ (Disabled)'}
              </span>
            </label>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            মেমো প্রিন্ট, নতুন সেলস সাবমিট বা বালক এসএমএস এর মাধ্যমে কাস্টমারের ফোন নাম্বারে স্বয়ংক্রিয়ভাবে থ্যাংক ইউ টেক্সট ও মেমো বিবরণী চলে যাবে।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMS Sender ID (মাস্কিং / সেন্ডার নাম)</label>
              <input
                type="text"
                value={formData.smsSenderId || 'HayatHaven'}
                onChange={(e) => setFormData({ ...formData, smsSenderId: e.target.value })}
                placeholder="HayatHaven"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMS Gateway API Key / Auth Token</label>
              <input
                type="password"
                value={formData.smsApiKey || 'HH-SMS-GATEWAY-KEY-9988'}
                onChange={(e) => setFormData({ ...formData, smsApiKey: e.target.value })}
                placeholder="SMS Gateway Secret Key"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden bg-white font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer SMS Template (মেসেজ টেমপ্লেট)
              </label>
              <textarea
                rows={2}
                value={
                  formData.smsTemplate ||
                  'প্রিয় {customer_name}, Hayat Haven-এ কেনাকাটার জন্য ধন্যবাদ! আপনার মেমো নং: {memo_id}, মোট বিল: ৳{grand_total}। পেজ লিঙ্ক: fb.com/hayathaven7'
                }
                onChange={(e) => setFormData({ ...formData, smsTemplate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden bg-white"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                Available tags: <span className="text-blue-700 font-bold">{'{customer_name}'}</span>, <span className="text-blue-700 font-bold">{'{memo_id}'}</span>, <span className="text-blue-700 font-bold">{'{grand_total}'}</span>, <span className="text-blue-700 font-bold">{'{company_name}'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Update Settings</span>
          </button>
        </div>
      </form>

      {/* DANGER ZONE: SYSTEM RESET CARD */}
      <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950">System Data Reset Zone (ফুল অ্যাপ ডাটা রিসেট)</h3>
              <p className="text-xs text-red-700 mt-0.5">
                সকল সেলেস, কেনাকাটা, কাস্টমার ও সাপ্লায়ারের বাকি (Due) এবং প্রোডাক্টের স্টক ০ (শূন্য) করে নতুনভাবে ব্যবসা শুরু করুন।
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>App Reset (ডাটা জিরো করুন)</span>
          </button>
        </div>
      </div>

      {/* RESET ADMIN CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-red-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                <h3 className="font-bold text-sm">Full ERP Data Reset Confirmation</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetMessage(null);
                  setAdminPassword('');
                }}
                className="text-red-200 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteReset} className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-xl text-xs leading-relaxed space-y-1">
                <p className="font-bold">⚠️ সতর্কবার্তা (Warning):</p>
                <p>
                  এই কাজটি সম্পন্ন করলে বর্তমান সকল সেলেস ইনভয়েস, পারচেজ রসিদ, কাস্টমার বাকি, সাপ্লায়ার দেনা এবং স্টক লেজার <strong>স্থায়ীভাবে ০ (শূন্য)</strong> হয়ে যাবে।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-red-600" />
                  <span>Enter Admin Password to Confirm Reset * (এডমিন পাসওয়ার্ড দিন)</span>
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="আপনার গোপন পাসওয়ার্ড প্রবেশ করান"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono font-bold focus:border-red-600 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">লগইনকৃত এডমিন একাউন্টের বৈধ পাসওয়ার্ড প্রদান করুন</p>
              </div>

              {resetMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                    resetMessage.success
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-red-100 text-red-900 border-red-300'
                  }`}
                >
                  <span>{resetMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetMessage(null);
                    setAdminPassword('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Confirm & Zero All Balances</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
