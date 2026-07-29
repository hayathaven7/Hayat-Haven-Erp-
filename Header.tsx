import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ModuleView } from './components/ModuleView';
import { LoginScreen } from './components/LoginScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EcommerceStoreModule } from './components/modules/EcommerceStoreModule';
import { Lock } from 'lucide-react';

function MainAppContent() {
  const { isAuthenticated } = useERP();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();

        // Check if visiting admin / dashboard URL
        const isAdminPath =
          path.includes('/dashboard') ||
          path.includes('/admin') ||
          path.includes('/login') ||
          search.includes('mode=admin') ||
          search.includes('admin=true') ||
          hash.includes('dashboard') ||
          hash.includes('admin');

        setIsAdminRoute(isAdminPath);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const navigateToStore = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      setIsAdminRoute(false);
    }
  };

  const navigateToAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/dashboard');
      setIsAdminRoute(true);
    }
  };

  // Scenario 1: Customer Storefront View (Default Main Domain e.g. hayathaven.vercel.app /)
  if (!isAdminRoute) {
    return (
      <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans">
        {/* Pure Customer Storefront */}
        <div className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <EcommerceStoreModule isPublicOnly={!isAuthenticated} />
          </ErrorBoundary>
        </div>

        {/* Minimal Customer Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-3 px-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 shrink-0">
          <span>© {new Date().getFullYear()} Hayat Haven Enterprise • Official Customer Storefront</span>
          <button
            onClick={navigateToAdmin}
            className="text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            title="অ্যাডমিন ও স্টাফদের ব্যাক-অফিস প্যানেল"
          >
            <Lock className="h-3 w-3 text-slate-500" />
            <span>অ্যাডমিন ইআরপি প্যানেল (/dashboard)</span>
          </button>
        </footer>
      </div>
    );
  }

  // Scenario 2: Admin Panel View (/dashboard) but NOT logged in -> Show Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onOpenPublicStore={navigateToStore} />;
  }

  // Scenario 3: Authenticated Staff/Admin in ERP Dashboard (/dashboard)
  return (
    <div className="flex flex-col h-screen w-full bg-[#F3F4F6] text-slate-900 font-sans overflow-hidden antialiased">
      {/* Top Navigation Bar */}
      <Header />

      {/* Middle Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Module Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col space-y-6 overflow-y-auto">
          <ErrorBoundary>
            <ModuleView />
          </ErrorBoundary>
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-[#001D3A] text-slate-400 text-[10px] flex items-center justify-between px-6 shrink-0 border-t border-white/10 font-mono">
        <div className="flex space-x-6 items-center">
          <span>
            DB STATUS: <span className="text-emerald-400 font-bold">STABLE</span>
          </span>
          <span className="hidden sm:inline-block">
            SYNC: <span className="text-emerald-400 font-bold">GOOGLE CLOUD READY</span>
          </span>
          <span>
            CURRENCY: <span className="text-white font-bold">BDT (৳)</span>
          </span>
        </div>
        <div className="font-mono italic hidden md:block opacity-80">
          VER 1.0.0.05 FINAL | SENIOR ERP ARCHITECT DEPLOYMENT
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <MainAppContent />
    </ERPProvider>
  );
}


