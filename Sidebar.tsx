import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, ShoppingBag, CheckCircle, Barcode, MapPin, Search, Sparkles, Check, Phone, User, Truck, UserPlus, Printer, WifiOff } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Product } from '../types/erp';

interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const COURIER_OPTIONS = [
  '🚚 Steadfast Courier (স্টেডফাস্ট কুরিয়ার)',
  '🚴 Pathao Courier (পাঠাও কুরিয়ার)',
  '📦 Sundarban Courier (সুন্দরবন কুরিয়ার)',
  '🔴 RedX Logistics (রেডএক্স)',
  '📄 Paperfly (পেপারফ্লাই)',
  '🚚 SA Paribahan (এস.এ পরিবহন)',
  '📦 Korotoa Courier (করোতোয়া কুরিয়ার)',
  '🛵 Hand Delivery / In-House Rider (নিজস্ব ডেলিভারি)',
  '⚙️ Other Courier (অন্যান্য)',
];

export const NewOrderModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { customers, products, createSalesOrder, addCustomer, setActiveModule, setSelectedPrintOrder, companySettings, activeUser, isOnline } = useERP();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [isManualCustomer, setIsManualCustomer] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [saveManualToDirectory, setSaveManualToDirectory] = useState(true);

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerSearchDropdown, setShowCustomerSearchDropdown] = useState(false);

  const [customerAddress, setCustomerAddress] = useState(customers[0]?.address || '');
  const [orderType, setOrderType] = useState<'Retail' | 'Wholesale' | 'Online'>('Retail');
  const [courierService, setCourierService] = useState('🚚 Steadfast Courier (স্টেডফাস্ট কুরিয়ার)');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card' | 'Due / Credit'>('Cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [createdBy, setCreatedBy] = useState(activeUser?.name || activeUser?.username || 'Admin');

  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync address when customer changes
  useEffect(() => {
    if (!isManualCustomer) {
      const selectedCust = customers.find((c) => c.id === customerId);
      if (selectedCust) {
        setCustomerAddress(selectedCust.address || '');
      }
    }
  }, [customerId, customers, isManualCustomer]);

  // Live filter customers by phone or name
  const matchedCustomers = customerSearchQuery.trim()
    ? customers.filter((c) => {
        const q = customerSearchQuery.trim().toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(customerSearchQuery.trim())) ||
          (c.id && c.id.toLowerCase().includes(q))
        );
      })
    : [];

  // Live filter products by name, barcode, or SKU
  const matchedProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          p.id.toLowerCase().includes(q)
        );
      })
    : [];

  // Add product to items helper (auto adds or increments qty)
  const addProductToItems = (product: Product) => {
    const unitPrice = orderType === 'Wholesale' ? product.minSellingPrice : product.sellingPrice;
    const existingIndex = items.findIndex((item) => item.productId === product.id);

    if (existingIndex >= 0) {
      setItems((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
      );
    } else {
      setItems((prev) => [...prev, { productId: product.id, quantity: 1, unitPrice }]);
    }

    setScanMessage(`✅ Auto Added: ${product.name} (৳${unitPrice.toLocaleString()})`);
    setSearchQuery('');
    setShowSearchResults(false);
    setTimeout(() => setScanMessage(null), 3000);
  };

  // Handle barcode scanning / SKU / Product Number / Name submit
  const handleBarcodeOrSearchScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const q = query.toLowerCase();

    // 1. Check exact match by barcode or SKU/ID
    let matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === q) ||
        p.id.toLowerCase() === q ||
        p.id.toLowerCase().replace(/[^0-9]/g, '') === q
    );

    // 2. Check if user typed numeric product index e.g. "1" for 1st product, "2" for 2nd product
    if (!matched && /^\d+$/.test(q)) {
      const idx = parseInt(q, 10) - 1;
      if (idx >= 0 && idx < products.length) {
        matched = products[idx];
      }
    }

    // 3. If no exact barcode/number match, match if query matches filtered search results
    if (!matched && matchedProducts.length > 0) {
      matched = matchedProducts[0];
    }

    if (matched) {
      addProductToItems(matched);
    } else {
      setScanMessage(`❌ "${query}" নম্বরে কোনো প্রোডাক্ট পাওয়া যায়নি! বারকোড বা সঠিক নম্বর টাইপ করুন।`);
      setTimeout(() => setScanMessage(null), 3500);
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const unaddedProd = products.find((p) => !items.some((i) => i.productId === p.id)) || products[0];
    const unitPrice = orderType === 'Wholesale' ? unaddedProd.minSellingPrice : unaddedProd.sellingPrice;
    setItems((prev) => [...prev, { productId: unaddedProd.id, quantity: 1, unitPrice }]);
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
              unitPrice: prod ? (orderType === 'Wholesale' ? prod.minSellingPrice : prod.sellingPrice) : 0,
            }
          : item
      )
    );
  };

  const handleQtyChange = (index: number, quantity: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item)));
  };

  const handlePriceChange = (index: number, unitPrice: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, unitPrice: Math.max(0, unitPrice) } : item)));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const dueAmount = Math.max(0, grandTotal - advancePaid);

  const handleSubmit = (e: React.FormEvent, instantPrint = false) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('দয়া করে অন্তত একটি প্রোডাক্ট নির্বাচন করুন।');
      return;
    }

    let finalCustomerId = customerId;
    let finalCustomerName = '';
    let finalCustomerPhone = '';
    let finalCustomerAddress = customerAddress;

    if (isManualCustomer) {
      if (!manualName.trim()) {
        alert('দয়া করে কাস্টমারের নাম টাইপ করুন!');
        return;
      }
      finalCustomerName = manualName.trim();
      finalCustomerPhone = manualPhone.trim();
      finalCustomerAddress = manualAddress.trim() || customerAddress;

      if (saveManualToDirectory) {
        const created = addCustomer({
          name: finalCustomerName,
          phone: finalCustomerPhone || '01700000000',
          email: '',
          address: finalCustomerAddress,
          type: orderType === 'Wholesale' ? 'Wholesale' : 'Retail',
          creditLimit: 50000,
          openingBalance: 0,
          status: 'Active',
        });
        finalCustomerId = created.id;
      } else {
        finalCustomerId = `WALKIN-${Date.now()}`;
      }
    } else {
      const selectedCust = customers.find((c) => c.id === customerId);
      finalCustomerName = selectedCust?.name || 'Walk-in Customer';
      finalCustomerPhone = selectedCust?.phone || '';
      finalCustomerAddress = customerAddress || selectedCust?.address || '';
    }

    const createdOrder = createSalesOrder({
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerAddress: finalCustomerAddress,
      deliveryAddress: customerAddress || finalCustomerAddress,
      courierService: orderType === 'Online' ? courierService : undefined,
      orderType,
      paymentMethod,
      subtotal,
      discountAmount,
      deliveryCharge,
      grandTotal,
      advancePaid,
      deliveryStatus: 'Processing',
      notes,
      createdBy: activeUser?.name || activeUser?.username || 'Admin',
      items,
    });

    setSelectedPrintOrder(createdOrder);
    setActiveModule('invoice_print');
    onClose();
  };

  const selectedCustObj = customers.find((c) => c.id === customerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-blue-900 px-5 py-3.5 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-800 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">New Sales Order (POS / Invoice Memo)</h2>
                {!isOnline && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse" title="অফলাইনে সেল হচ্ছে। নেট আসলেই অটো সার্ভারে আপলোড হবে।">
                    <WifiOff className="h-3 w-3" />
                    <span>অফলাইন সেল মোড</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-200">Hayat Haven Enterprise • Customer & Memo System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="new-order-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* CUSTOMER SEARCH & MODE TOGGLE SECTION */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600" />
                <span>Customer Details (কাস্টমার নির্বাচন ও ম্যানুয়াল এন্ট্রি)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualCustomer(false)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    !isManualCustomer
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>সংরক্ষিত কাস্টমার</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualCustomer(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isManualCustomer
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>✍️ ম্যানুয়াল কাস্টমার এন্ট্রি</span>
                </button>
              </div>
            </div>

            {!isManualCustomer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Search by phone number / name */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>Search Customer by Phone No / Name (ফোন নাম্বার দিয়ে খুঁজুন):</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        setShowCustomerSearchDropdown(true);
                      }}
                      onFocus={() => setShowCustomerSearchDropdown(true)}
                      placeholder="ফোন নাম্বার (e.g. 017...) বা কাস্টমার নাম টাইপ করুন..."
                      className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden bg-white shadow-2xs"
                    />
                  </div>

                  {/* Customer Search Dropdown */}
                  {showCustomerSearchDropdown && customerSearchQuery.trim() !== '' && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 max-h-48 overflow-y-auto space-y-1">
                      {matchedCustomers.length === 0 ? (
                        <div className="p-2 text-center text-xs text-slate-500">
                          "{customerSearchQuery}" ফোন বা নামে কোনো কাস্টমার পাওয়া যায়নি।
                        </div>
                      ) : (
                        matchedCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setCustomerId(c.id);
                              setCustomerSearchQuery('');
                              setShowCustomerSearchDropdown(false);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{c.name}</span>
                              <span className="text-[10px] text-slate-500">📱 {c.phone} • {c.address || 'No Address'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Bal: ৳{c.currentBalance.toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer Account *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden bg-white shadow-2xs"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — 📱 {c.phone} ({c.type} | Bal: ৳{c.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Manual Entry Form Inputs */
              <div className="space-y-3 bg-purple-50/50 p-3 rounded-xl border border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">কাস্টমার এর নাম (Customer Name) *</label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g. মোঃ রফিকুল ইসলাম"
                      className="w-full rounded-xl border border-purple-300 px-3 py-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">ফোন নাম্বার (Phone Number) *</label>
                    <input
                      type="text"
                      required
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full rounded-xl border border-purple-300 px-3 py-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">ঠিকানা (Customer Address)</label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g. বাসা ২০, রোড ৪, ধানমন্ডি, ঢাকা"
                    className="w-full rounded-xl border border-purple-300 px-3 py-2 text-xs font-medium focus:border-purple-600 focus:outline-hidden bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="save-manual-cust"
                    checked={saveManualToDirectory}
                    onChange={(e) => setSaveManualToDirectory(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="save-manual-cust" className="text-xs font-semibold text-purple-900 cursor-pointer">
                    ভবিষ্যতের জন্য এই কাস্টমারকে ডাটাবেজ ডিরেক্টরিতে অটো সেভ করুন (Save to Directory)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ORDER CHANNEL, COURIER SERVICE & PAYMENT METHOD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Order Channel *</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'Retail' | 'Wholesale' | 'Online')}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden shadow-2xs"
              >
                <option value="Retail">🏪 Showroom / Retail</option>
                <option value="Wholesale">📦 Wholesale Bulk</option>
                <option value="Online">🌐 Online Order (অনলাইন মেমো)</option>
              </select>
            </div>

            {/* Courier Service Selector (Visible when Online Order) */}
            {orderType === 'Online' ? (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Courier Service (কুরিয়ার সার্ভিস) *</span>
                </label>
                <select
                  value={courierService}
                  onChange={(e) => setCourierService(e.target.value)}
                  className="w-full rounded-xl border border-blue-400 bg-blue-50/80 px-3 py-2 text-xs font-bold text-blue-950 focus:border-blue-600 focus:outline-hidden shadow-2xs"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Served By (অপারেটর / ইউজার)</label>
                <div className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                    <span>{activeUser?.name || activeUser?.username || 'Admin'}</span>
                  </span>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    🔒 Auto Detected
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-hidden bg-emerald-50/60 text-emerald-950 shadow-2xs"
              >
                <option value="Cash">💵 Cash (ক্যাশ)</option>
                <option value="bKash">📱 bKash (বিকাশ)</option>
                <option value="Nagad">📱 Nagad (নগদ)</option>
                <option value="Bank Transfer">🏦 Bank Transfer (ব্যাংক)</option>
                <option value="Card">💳 Card Payment (কার্ড)</option>
                <option value="Due / Credit">⏳ Due / Credit (বাকী / ক্রেডিট)</option>
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>Customer Delivery Address (ডেলিভারি ঠিকানা)</span>
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Enter full shipping/delivery address..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* PRODUCT NAME & BARCODE LIVE AUTO-ADD SEARCH BAR */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-md space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Barcode className="h-4 w-4" />
                <span>প্রোডাক্ট সার্চ ও বারকোড স্ক্যানার (Live Search & Barcode Auto-Add)</span>
              </span>
              <span className="text-[10px] text-slate-300">টাইপ বা স্ক্যান করলেই অটো প্রোডাক্ট অ্যাড হবে</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeOrSearchScan();
                    }
                  }}
                  placeholder="প্রোডাক্ট এর নাম (e.g. T-Shirt, Phone), বারকোড বা SKU দিয়ে সার্চ করুন..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-hidden font-medium shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleBarcodeOrSearchScan()}
                className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-400 cursor-pointer transition-all flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Auto Add</span>
              </button>
            </div>

            {/* Scan / Add Message Notification Banner */}
            {scanMessage && (
              <div
                className={`text-xs font-bold p-2 rounded-xl border flex items-center gap-2 ${
                  scanMessage.includes('✅')
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/90 border-rose-500 text-rose-300'
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{scanMessage}</span>
              </div>
            )}

            {/* Live Product Name Search Dropdown */}
            {showSearchResults && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 border-b border-slate-700">
                  <span>মাচিং প্রোডাক্ট ({matchedProducts.length})</span>
                  <span>প্রোডাক্ট এ ক্লিক করলেই অর্ডার তালিকায় যোগ হবে</span>
                </div>

                {matchedProducts.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    "{searchQuery}" নামে কোনো প্রোডাক্ট পাওয়া যায়নি।
                  </div>
                ) : (
                  matchedProducts.map((prod) => {
                    const price = orderType === 'Wholesale' ? prod.minSellingPrice : prod.sellingPrice;
                    const isAdded = items.some((i) => i.productId === prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => addProductToItems(prod)}
                        className="p-2 hover:bg-slate-700/80 rounded-xl cursor-pointer flex items-center justify-between transition-all group border border-transparent hover:border-amber-400/50"
                      >
                        <div className="flex items-center gap-2.5">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-600" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                              {prod.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-white block group-hover:text-amber-300">{prod.name}</span>
                            <span className="text-[10px] text-slate-300">
                              SKU: {prod.id} • Stock: {prod.currentStock} {prod.unit} • <span className="text-amber-300 font-bold">কেনা: ৳{prod.buyingPrice}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-amber-400">৳{price.toLocaleString()}</span>
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                          >
                            {isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            <span>{isAdded ? '+1 Add' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Product Line Items ({items.length})</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Select Product SKU / Name</th>
                    <th className="py-2.5 px-3 font-semibold w-24">Qty</th>
                    <th className="py-2.5 px-3 font-semibold w-32">Unit Price (৳)</th>
                    <th className="py-2.5 px-3 font-semibold w-32">Total (৳)</th>
                    <th className="py-2.5 px-3 font-semibold w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 bg-slate-50/50">
                        <p className="text-xs font-semibold text-slate-700">কোন প্রোডাক্ট যোগ করা হয়নি</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          উপরে সার্চ করুন অথবা <span className="font-bold text-blue-600">+ Add Item</span> বোতামে ক্লিক করে প্রোডাক্ট যোগ করুন।
                        </p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId);
                      const isLow = prod && prod.currentStock <= item.quantity;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3">
                            <select
                              value={item.productId}
                              onChange={(e) => handleProductChange(idx, e.target.value)}
                              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden bg-white shadow-2xs"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} — (Stock: {p.currentStock} {p.unit} | কেনা: ৳{p.buyingPrice} | বেচা: ৳{p.sellingPrice})
                                </option>
                              ))}
                            </select>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                              <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                                🛒 কেনা দাম: ৳{(prod?.buyingPrice || 0).toLocaleString()}
                              </span>
                              <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                                📈 লাভ: ৳{(item.unitPrice - (prod?.buyingPrice || 0)).toLocaleString()} / {prod?.unit || 'Pcs'}
                              </span>
                            </div>
                            {isLow && (
                              <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                                ⚠️ Stock Warning: Only {prod?.currentStock} available
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-right font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-right font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                            ৳{(item.quantity * item.unitPrice).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                              title="Remove item"
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

          {/* Pricing Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Amount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Charge (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes / Memo</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Despatched via Steadfast Courier"
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs">
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Subtotal Items:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Discount:</span>
                <span className="font-semibold text-red-600">-৳{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-slate-900">+৳{deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 text-sm font-bold text-blue-900">
                <span>Grand Total:</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Collection / Paid Amount (৳)</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAdvancePaid(grandTotal)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer shadow-2xs"
                    >
                      Full Paid (ফুল পেইড)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvancePaid(0)}
                      className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer shadow-2xs"
                    >
                      Full Due (ফুল বাকী)
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-emerald-400 bg-emerald-50/60 px-3 py-1.5 text-xs font-bold text-emerald-900 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-between py-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 rounded-xl border border-amber-200">
                <span>Balance Due:</span>
                <span>৳{dueAmount.toLocaleString()}</span>
              </div>

              {/* Net Profit Count (বিক্রির দাম - কেনা দাম) */}
              {(() => {
                const projectedProfit = items.reduce((sum, item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  const buyingCost = p ? p.buyingPrice : 0;
                  return sum + (item.unitPrice - buyingCost) * item.quantity;
                }, 0) - discountAmount;

                return (
                  <div className="flex justify-between py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 rounded-xl border border-emerald-300">
                    <span className="flex items-center gap-1">
                      <span>💰 Estimated Net Profit (নিট লাভ):</span>
                    </span>
                    <span className="font-black text-emerald-700">৳{projectedProfit.toLocaleString()}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </form>

        {/* Modal Fixed Footer Actions */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-order-form"
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Save Order Only (সেভ করুন)</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-black text-white shadow-md active:scale-98 transition-all cursor-pointer ring-2 ring-blue-400/50"
          >
            <Printer className="h-4 w-4" />
            <span>🖨️ Save & Print Memo (সেভ ও মেমো প্রিন্ট করুন)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

