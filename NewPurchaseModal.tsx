import React, { useState } from 'react';
import { Download, ShoppingBag, Truck, ShieldCheck, Shield, ChevronDown, Menu, X, LogOut, LogIn, User, Lock, Key, Eye, EyeOff, Wifi, WifiOff, RefreshCw, Smartphone, CheckCircle2, Store } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { UserAccount } from '../types/erp';
import { NewOrderModal } from './NewOrderModal';
import { NewPurchaseModal } from './NewPurchaseModal';
import { MyProfileModal } from './MyProfileModal';

export const Header: React.FC = () => {
  const {
    companySettings,
    downloadExcel,
    setActiveModule,
    users,
    activeUser,
    switchUserWithPassword,
    logout,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isOnline,
    pendingOfflineSyncCount,
    lastSyncedTime,
    isSyncing,
    syncOfflineDataWithServer,
    promptInstallPWA,
  } = useERP();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [syncToastMsg, setSyncToastMsg] = useState<string>('');

  const handleManualSync = async () => {
    const res = await syncOfflineDataWithServer();
    setSyncToastMsg(res.message);
    setTimeout(() => setSyncToastMsg(''), 4000);
  };

  // Switch User Security Modal State
  const [targetSwitchUser, setTargetSwitchUser] = useState<UserAccount | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);
  const [switchError, setSwitchError] = useState('');

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadExcel();
    } finally {
      setIsDownloading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#002E5D] text-white flex items-center justify-between px-6 shrink-0 shadow-md">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1.5 rounded-lg bg-blue-900/80 text-white hover:bg-blue-800 cursor-pointer focus:outline-hidden"
            title="Toggle Menu"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="bg-white p-1 rounded-lg flex items-center justify-center shrink-0 shadow-xs h-9 w-10 sm:h-10 sm:w-12 overflow-hidden">
            <img
              src={companySettings.logoUrl || '/logo.jpg'}
              alt="Hayat Haven Logo"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.jpg';
              }}
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              HAYAT HAVEN{' '}
              <span className="font-light opacity-80 uppercase text-xs tracking-[0.2em] hidden sm:inline-block text-blue-200">
                Enterprise ERP
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-medium truncate max-w-[150px] sm:max-w-none">
              {companySettings.businessType} • {companySettings.country}
            </p>
          </div>
        </div>

        {/* Global Actions & Architect Pill */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Online / Offline Sync Badge & Trigger */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-950/80 border border-blue-400/30 text-white text-[11px] font-semibold">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold" title="ইন্টারনেট সংযুক্ত - ডাটা লাইভ সিঙ্ক হচ্ছে">
                <Wifi className="h-3.5 w-3.5" />
                <span>অনলাইন</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-bold" title="ইন্টারনেট সংযোগ নেই - অফলাইনে সেল চলছে">
                <WifiOff className="h-3.5 w-3.5" />
                <span>অফলাইন</span>
              </span>
            )}

            {pendingOfflineSyncCount > 0 ? (
              <button
                onClick={handleManualSync}
                disabled={isSyncing || !isOnline}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold animate-pulse transition-all cursor-pointer disabled:opacity-50"
                title="অফলাইন ডাটা সার্ভারে আপলোড করতে ক্লিক করুন"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : `${pendingOfflineSyncCount} সিঙ্ক বাকি`}</span>
              </button>
            ) : (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-800/60 hover:bg-blue-700 text-blue-200 text-[10px] font-medium transition-all cursor-pointer"
                title="সার্ভারে সরাসরি ম্যানুয়াল সিঙ্ক করুন"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সিঙ্ক...' : 'সিঙ্ক'}</span>
              </button>
            )}
          </div>

          {/* Install App Button */}
          <button
            onClick={promptInstallPWA}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-tight shadow-xs transition-all cursor-pointer"
            title="পিসি বা মোবাইলে সরাসরি অ্যাপ হিসেবে ইন্সটল করুন (PWA)"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>অ্যাপ ইন্সটল</span>
          </button>

          {/* E-Commerce Storefront Shortcut */}
          <button
            onClick={() => setActiveModule('ecommerce_store')}
            className="flex items-center gap-1 sm:gap-1.5 rounded bg-amber-500 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight text-slate-950 shadow-xs hover:bg-amber-400 transition-all cursor-pointer"
            title="অনলাইন ই-কমার্স ল্যান্ডিং পেজ ও কাস্টমার শপ ভিউ দেখুন"
          >
            <Store className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">অনলাইন শপ</span>
            <span className="sm:hidden">শপ</span>
          </button>

          <button
            onClick={() => setShowPOSModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 rounded bg-blue-600 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-white shadow-xs hover:bg-blue-500 transition-all cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Sale (POS)</span>
            <span className="sm:hidden">POS</span>
          </button>

          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 rounded bg-emerald-600 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Truck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Purchase</span>
            <span className="sm:hidden">Buy</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="hidden md:flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-tight text-white hover:bg-white/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isDownloading ? 'Downloading...' : 'Export Excel'}</span>
          </button>

          {(activeUser.role === 'Admin' || activeUser.allowedModules.includes('user_roles')) && (
            <button
              onClick={() => setActiveModule('user_roles')}
              className="hidden lg:flex items-center gap-1.5 rounded border border-white/20 bg-slate-900/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-tight text-blue-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span>User Roles</span>
            </button>
          )}

          {/* User Role Badge & Dropdown Switcher */}
          <div className="relative border-l border-white/20 pl-4">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 text-left hover:opacity-90 cursor-pointer focus:outline-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0 border border-white/30">
                {activeUser.avatarUrl ? (
                  <img src={activeUser.avatarUrl} alt={activeUser.name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(activeUser.name)
                )}
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-semibold block leading-tight truncate max-w-[120px]">
                  {activeUser.name}
                </span>
                <span className="text-[10px] text-blue-300 font-mono font-bold flex items-center gap-1">
                  <span>Role: {activeUser.role}</span>
                  <ChevronDown className="h-3 w-3" />
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Active User Session
                    </p>
                    <p className="text-xs font-bold text-slate-900 truncate">{activeUser.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    title="Sign Out / Logout"
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>

                <div className="py-1">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch User Account
                  </p>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (u.id !== activeUser.id) {
                          setTargetSwitchUser(u);
                          setSwitchPassword('');
                          setSwitchError('');
                          setShowSwitchPassword(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 flex items-center justify-between cursor-pointer ${
                        u.id === activeUser.id ? 'bg-blue-50/70 font-bold text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            getInitials(u.name)
                          )}
                        </div>
                        <div>
                          <span className="block leading-tight">{u.name}</span>
                          <span className="text-[10px] text-slate-500 block">{u.email}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'Manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 px-4 pt-2 pb-1 space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1.5 cursor-pointer w-full text-left bg-blue-50/80 p-1.5 rounded-lg border border-blue-200"
                  >
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>My Profile & Password Change (প্রোফাইল)</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveModule('user_roles');
                      setShowUserDropdown(false);
                    }}
                    className="text-[11px] font-semibold text-slate-700 hover:underline flex items-center gap-1.5 cursor-pointer w-full text-left pt-1"
                  >
                    <Shield className="h-3.5 w-3.5 text-slate-500" />
                    <span>Manage Roles & Permissions Matrix</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1.5 cursor-pointer w-full text-left pt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out / Log Out (লগআউট)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {syncToastMsg && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shadow-md animate-fade-in z-20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-200 shrink-0" />
            <span>{syncToastMsg}</span>
          </div>
          <button onClick={() => setSyncToastMsg('')} className="p-0.5 hover:bg-emerald-700 rounded cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showPOSModal && <NewOrderModal onClose={() => setShowPOSModal(false)} />}
      {showPurchaseModal && <NewPurchaseModal onClose={() => setShowPurchaseModal(false)} />}
      {showProfileModal && <MyProfileModal onClose={() => setShowProfileModal(false)} />}

      {/* Switch User Security Modal */}
      {targetSwitchUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Account Login Security (সিকিউরিটি)</span>
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
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showSwitchPassword ? 'text' : 'password'}
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
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-10 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSwitchPassword(!showSwitchPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSwitchPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                  className="rounded-xl bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>লগইন ও সুইচ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


