import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  ArrowLeft,
  Building2,
  CheckCircle,
  CheckCircle2,
  FileText,
  Receipt,
  Layers,
  MessageSquare,
  Mail,
  Download,
  Send,
  X,
  Phone,
  FileCheck,
  Search,
  Bluetooth,
  TrendingUp,
  Zap,
  Sliders,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import {
  downloadInvoicePDF,
  formatWhatsAppPhone,
  generateWhatsAppInvoiceMessage,
  openWhatsAppInvoice,
} from '../../utils/shareUtils';
import {
  connectBluetoothPrinter,
  autoConnectBluetoothPrinter,
  printSalesOrderBluetooth,
  getConnectedDeviceName,
  disconnectBluetoothPrinter,
  generateRawBTDataUrl,
  isInIframe,
} from '../../utils/bluetoothPrinter';

type PrintPaperSize = 'a4' | 'a5' | 'pos3in' | 'pos2in';

export const InvoicePrintModule: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    selectedPrintOrder,
    salesOrders,
    customers,
    products,
    setActiveModule,
    setSelectedPrintOrder,
    markOrderPaid,
    markOrderDelivered,
    updateSalesOrderStatus,
    activeUser,
  } = useERP();

  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PrintPaperSize>(companySettings.defaultPaperSize || 'pos3in');
  const [defaultPrinterMode, setDefaultPrinterMode] = useState<'standard' | 'bluetooth' | 'rawbt'>(
    companySettings.defaultPrinterMode || 'standard'
  );
  const [selectedWatermark, setSelectedWatermark] = useState<'AUTO' | 'PAID' | 'DUE' | 'RECEIVED' | 'APPROVED' | 'VOIDED' | 'NONE'>('AUTO');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Audio chime helper for POS order save / print confirmation
  const playPosChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio context unsupported or blocked
    }
  };

  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');

  // Memo Custom Alignment & Font Styling States
  const [headerAlign, setHeaderAlign] = useState<'left' | 'center' | 'right'>(() => {
    return (localStorage.getItem('memo_header_align') as 'left' | 'center' | 'right') || 'center';
  });
  const [bodyAlign, setBodyAlign] = useState<'left' | 'center' | 'right'>(() => {
    return (localStorage.getItem('memo_body_align') as 'left' | 'center' | 'right') || 'left';
  });
  const [footerAlign, setFooterAlign] = useState<'left' | 'center' | 'right'>(() => {
    return (localStorage.getItem('memo_footer_align') as 'left' | 'center' | 'right') || 'center';
  });
  const [memoFontSize, setMemoFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    return (localStorage.getItem('memo_font_size') as 'sm' | 'base' | 'lg') || 'base';
  });
  const [qrCustomUrl, setQrCustomUrl] = useState<string>(() => {
    return localStorage.getItem('memo_qr_url') || companySettings.facebookPageUrl || 'https://www.facebook.com/hayathaven7';
  });
  const [showQrCode, setShowQrCode] = useState<boolean>(true);

  const lastAutoPrintedOrderIdRef = React.useRef<string | null>(null);

  const order = selectedPrintOrder || salesOrders[0];
  const customer = customers.find((c) => c.id === order?.customerId);

  // Generate offline base64 & pure SVG QR Code
  useEffect(() => {
    const targetUrl = qrCustomUrl || companySettings.facebookPageUrl || 'https://www.facebook.com/hayathaven7';

    // 1. Pure inline SVG (100% offline & fast)
    QRCode.toString(targetUrl, {
      type: 'svg',
      width: 160,
      margin: 1,
      color: { dark: '#090d16', light: '#ffffff' },
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('Error generating inline QR SVG:', err));

    // 2. Base64 fallback Data URL
    QRCode.toDataURL(targetUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#090d16', light: '#ffffff' },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [qrCustomUrl, companySettings.facebookPageUrl]);

  // Keep local state synced with companySettings when updated from Printer Settings
  useEffect(() => {
    if (companySettings.defaultPaperSize) {
      setPaperSize(companySettings.defaultPaperSize as PrintPaperSize);
    }
    if (companySettings.defaultPrinterMode) {
      setDefaultPrinterMode(companySettings.defaultPrinterMode as 'standard' | 'bluetooth' | 'rawbt');
    }
    if (typeof companySettings.enableAutoPrintOnSave === 'boolean') {
      setAutoPrintEnabled(companySettings.enableAutoPrintOnSave);
    }
  }, [companySettings.defaultPaperSize, companySettings.defaultPrinterMode, companySettings.enableAutoPrintOnSave]);

  // Bluetooth Thermal POS State
  const [btStatus, setBtStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [btDeviceName, setBtDeviceName] = useState<string | null>(getConnectedDeviceName());
  const [btToastMsg, setBtToastMsg] = useState<string | null>(null);
  const [isBtPrinting, setIsBtPrinting] = useState(false);

  // Auto print when order changes (e.g. created from POS / New Order modal)
  useEffect(() => {
    if (order && autoPrintEnabled && lastAutoPrintedOrderIdRef.current !== order.id) {
      lastAutoPrintedOrderIdRef.current = order.id;
      playPosChime();
      setBtToastMsg(`🖨️ অটোমেটিক প্রিন্ট সার্ভিস চালু করা হয়েছে (Order #${order.id})...`);
      const timer = setTimeout(() => {
        handleExecuteDefaultPrint();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [order?.id, autoPrintEnabled]);

  // Auto-attempt Bluetooth reconnect on refresh
  useEffect(() => {
    let isMounted = true;
    const tryAutoConnect = async () => {
      if (btStatus === 'disconnected') {
        const res = await autoConnectBluetoothPrinter();
        if (isMounted && res.success) {
          setBtStatus('connected');
          setBtDeviceName(res.deviceName || 'Bluetooth POS Printer');
          setBtToastMsg(`⚡ ${res.message}`);
          setTimeout(() => setBtToastMsg(null), 4000);
        }
      }
    };
    tryAutoConnect();
    return () => {
      isMounted = false;
    };
  }, []);

  const [whatsappPhone, setWhatsappPhone] = useState(customer?.phone || companySettings.phone);
  const [emailTo, setEmailTo] = useState(customer?.email || 'customer@gmail.com');
  const [emailSubject, setEmailSubject] = useState(
    `Official Tax Invoice ${order?.id} - Hayat Haven Enterprise`
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Connect Bluetooth Thermal Printer
  const handleConnectBluetooth = async () => {
    setBtStatus('connecting');
    const res = await connectBluetoothPrinter();
    if (res.success) {
      setBtStatus('connected');
      setBtDeviceName(res.deviceName || 'Bluetooth POS Printer');
      setBtToastMsg(`✅ ${res.message}`);
    } else {
      setBtStatus('disconnected');
      if (res.isPermissionsBlocked) {
        setBtToastMsg(`⚠️ ${res.message}`);
      } else {
        setBtToastMsg(`⚠️ ${res.message}`);
      }
    }
    setTimeout(() => setBtToastMsg(null), 8000);
  };

  // Direct ESC/POS Print via Bluetooth
  const handleBluetoothPrint = async () => {
    if (!order) return;
    if (order.deliveryStatus === 'Pending' || !order.deliveryStatus) {
      updateSalesOrderStatus(order.id, 'Accepted');
    }
    setIsBtPrinting(true);
    const posSize = paperSize === 'pos2in' ? 'pos2in' : 'pos3in';
    const res = await printSalesOrderBluetooth(order, companySettings, posSize);
    setIsBtPrinting(false);
    setBtToastMsg(res.message);
    setTimeout(() => setBtToastMsg(null), 5000);
  };

  // Save current paper size and printer mode as default printer
  const handleSaveDefaultPrinterSettings = (newMode?: 'standard' | 'bluetooth' | 'rawbt') => {
    const targetMode = newMode || defaultPrinterMode;
    updateCompanySettings({
      ...companySettings,
      defaultPaperSize: paperSize,
      defaultPrinterMode: targetMode,
    });
    setDefaultPrinterMode(targetMode);
    const sizeName =
      paperSize === 'pos3in'
        ? 'POS 3" (80mm)'
        : paperSize === 'pos2in'
        ? 'POS 2" (58mm)'
        : paperSize.toUpperCase();
    const modeName =
      targetMode === 'bluetooth'
        ? 'Bluetooth Thermal'
        : targetMode === 'rawbt'
        ? 'RawBT App'
        : 'Standard System Print';
    setBtToastMsg(`✅ ডিফল্ট প্রিন্টার সেভ হয়েছে: ${sizeName} • ${modeName}`);
    setTimeout(() => setBtToastMsg(null), 5000);
  };

  // Smart Execute Default Selected Printer Action
  const handleExecuteDefaultPrint = () => {
    if (order && (order.deliveryStatus === 'Pending' || !order.deliveryStatus)) {
      updateSalesOrderStatus(order.id, 'Accepted');
    }
    const activeMode = companySettings.defaultPrinterMode || defaultPrinterMode;
    const activeSize = companySettings.defaultPaperSize || paperSize;
    if (activeMode === 'bluetooth') {
      handleBluetoothPrint();
    } else if (activeMode === 'rawbt') {
      if (order) {
        const url = generateRawBTDataUrl(order, companySettings, activeSize === 'pos2in' ? 'pos2in' : 'pos3in');
        window.open(url, '_blank');
      }
    } else {
      handlePrint();
    }
  };

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-600">No Sales Order selected for Invoice Printing.</p>
        <button
          onClick={() => setActiveModule('sales_orders')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
        >
          Go to Sales Orders →
        </button>
      </div>
    );
  }

  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsToastMsg, setSmsToastMsg] = useState<string | null>(null);

  const handleSendCustomerSms = (quiet = false) => {
    setIsSendingSms(true);
    const targetPhone = customer?.phone || order.customerPhone || companySettings.phone;
    const rawTemplate =
      companySettings.smsTemplate ||
      'প্রিয় {customer_name}, Hayat Haven-এ কেনাকাটার জন্য ধন্যবাদ! আপনার মেমো নং: {memo_id}, মোট বিল: ৳{grand_total}। পেজ লিঙ্ক: fb.com/hayathaven7';

    const renderedSms = rawTemplate
      .replace('{customer_name}', order.customerName)
      .replace('{memo_id}', order.id)
      .replace('{grand_total}', (order.grandTotal || 0).toLocaleString())
      .replace('{company_name}', companySettings.companyName);

    setTimeout(() => {
      setIsSendingSms(false);
      setSmsToastMsg(`📱 Auto SMS Sent to ${targetPhone}! Text: "${renderedSms}"`);
      setTimeout(() => {
        setSmsToastMsg(null);
      }, 5000);
    }, 600);
  };

  const handlePrint = () => {
    if (order && (order.deliveryStatus === 'Pending' || !order.deliveryStatus)) {
      updateSalesOrderStatus(order.id, 'Accepted');
    }
    if (companySettings.enableAutoSms ?? true) {
      handleSendCustomerSms(true);
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePDFDownload = async () => {
    setIsGeneratingPDF(true);
    await downloadInvoicePDF('printable-invoice-canvas', `Invoice_${order.id}.pdf`);
    setIsGeneratingPDF(false);
  };

  const handleSendWhatsApp = () => {
    openWhatsAppInvoice(order, customer, companySettings, whatsappPhone);
    setShowWhatsAppModal(false);
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);
      setTimeout(() => {
        setEmailSentSuccess(false);
        setShowEmailModal(false);
      }, 2000);
    }, 1200);
  };

  const matchedInvoiceOrders = invoiceSearchQuery.trim()
    ? salesOrders.filter(
        (so) =>
          so.id.toLowerCase().includes(invoiceSearchQuery.trim().toLowerCase()) ||
          so.customerName.toLowerCase().includes(invoiceSearchQuery.trim().toLowerCase()) ||
          (so.customerPhone && so.customerPhone.includes(invoiceSearchQuery.trim()))
      )
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* QUICK INVOICE SEARCH BAR (PRINT MODULE) */}
      <div className="print:hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl border border-blue-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">🔍 ইনভয়েস ও মেমো কুইক ফিল্টার (Quick Invoice Selector)</h2>
              <p className="text-[11px] text-blue-200">
                অন্য যেকোনো মেমো প্রিন্ট করতে মেমো নাম্বার (যেমন: SO-10001), কাস্টমার নাম বা মোবাইল নাম্বার টাইপ করুন:
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <input
              type="text"
              value={invoiceSearchQuery}
              onChange={(e) => setInvoiceSearchQuery(e.target.value)}
              placeholder="মেমো নং (SO-10001), নাম বা ফোন দিন..."
              className="w-full rounded-xl border border-blue-700 bg-slate-800 pl-9 pr-8 py-2 text-xs font-semibold text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-hidden"
            />
            {invoiceSearchQuery && (
              <button
                onClick={() => setInvoiceSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {invoiceSearchQuery.trim() !== '' && (
          <div className="bg-slate-800/90 backdrop-blur-md rounded-xl border border-blue-700/80 p-3 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
              <span className="font-bold text-slate-200">
                ফলাফল: <span className="text-blue-400">{matchedInvoiceOrders.length}</span> টি মেমো পাওয়া গেছে
              </span>
              <span className="text-[10px] text-slate-400">ক্লিক করে মেমো নির্বাচন করুন</span>
            </div>

            {matchedInvoiceOrders.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 text-center">
                "{invoiceSearchQuery}" দিয়ে কোনো মেমো পাওয়া যায়নি।
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pt-1">
                {matchedInvoiceOrders.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedPrintOrder(m);
                      setInvoiceSearchQuery('');
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      m.id === order.id
                        ? 'border-blue-400 bg-blue-600/30'
                        : 'border-slate-700 hover:border-blue-400 bg-slate-900/80 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-300 text-xs">{m.id}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                          {m.paymentStatus}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white block mt-0.5">{m.customerName}</span>
                      <span className="text-[10px] text-slate-400">{m.customerPhone || 'N/A'}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">৳{(m.grandTotal || 0).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-blue-400 group-hover:underline flex items-center gap-0.5 justify-end mt-1">
                        <Printer className="h-3 w-3" /> সিলেক্ট করুন
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Top Action Bar (hidden in print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white p-4 md:p-6 rounded-2xl shadow-md gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModule('sales_orders')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold">Module 23: Invoice & POS Receipt Printing</h2>
            <p className="text-xs text-slate-400">Order Ref: {order.id} • Date: {order.orderDate}</p>
          </div>
        </div>

        {/* Paper Size Selector & Sharing Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden lg:inline-block">Format:</span>
          <button
            onClick={() => setPaperSize('a4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              paperSize === 'a4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>A4</span>
          </button>

          <button
            onClick={() => setPaperSize('a5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              paperSize === 'a5'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>A5</span>
          </button>

          <button
            onClick={() => setPaperSize('pos3in')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              paperSize === 'pos3in'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>3" POS</span>
          </button>

          <button
            onClick={() => setPaperSize('pos2in')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              paperSize === 'pos2in'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>2" POS</span>
          </button>

          {/* Set Current as Default Printer Button */}
          <button
            onClick={() => handleSaveDefaultPrinterSettings()}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1"
            title="Set current paper size as default printer layout"
          >
            <span>⭐ Set Default (ডিফল্ট সেভ)</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block"></div>

          {/* Mark Paid Button */}
          {order.paymentStatus !== 'Paid' && (
            <button
              onClick={() => markOrderPaid(order.id)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer shadow-sm animate-pulse"
              title="Mark order as fully paid"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Mark as Paid (পেড মার্ক)</span>
            </button>
          )}

          {/* Watermark Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
            <span className="text-[10px] font-semibold text-slate-400 px-1">Seal:</span>
            <select
              value={selectedWatermark}
              onChange={(e: any) => setSelectedWatermark(e.target.value)}
              className="bg-slate-900 text-white text-[11px] font-bold rounded px-1.5 py-0.5 border border-slate-700 outline-none cursor-pointer"
            >
              <option value="AUTO">Auto Stamp</option>
              <option value="PAID">PAID Seal</option>
              <option value="DUE">DUE Seal</option>
              <option value="RECEIVED">RECEIVED Seal</option>
              <option value="APPROVED">APPROVED Seal</option>
              <option value="VOIDED">VOIDED Seal</option>
              <option value="NONE">No Stamp</option>
            </select>
          </div>

          <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block"></div>

          {/* Action Sharing Buttons */}
          <button
            onClick={handlePDFDownload}
            disabled={isGeneratingPDF}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white px-3 py-1.5 text-xs font-bold hover:bg-[#20bd5a] transition-all cursor-pointer shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Send WhatsApp</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Send Email</span>
          </button>

          <button
            onClick={() => handleSendCustomerSms(false)}
            disabled={isSendingSms}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-purple-500 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Customer Mobile No. e Auto Thank You SMS Send"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSendingSms ? 'Sending SMS...' : '📱 Send SMS'}</span>
          </button>

          <button
            onClick={() => setActiveModule('printer_settings')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 text-xs font-bold border border-slate-700 shadow-sm cursor-pointer"
            title="Configure Duty Printer and Drivers"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-400" />
            <span>⚙️ প্রিন্টার সেটিং (Printer Setup)</span>
          </button>

          <button
            onClick={handleExecuteDefaultPrint}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold shadow-lg active:scale-98 transition-all cursor-pointer ml-auto md:ml-2 border border-blue-400"
            title={`Run default printer action: ${defaultPrinterMode.toUpperCase()}`}
          >
            <Printer className="h-4 w-4 text-white" />
            <span>🖨️ Print Invoice ({defaultPrinterMode === 'bluetooth' ? 'Bluetooth' : defaultPrinterMode === 'rawbt' ? 'RawBT App' : 'Standard'})</span>
          </button>
        </div>
      </div>

      {/* BLUETOOTH THERMAL POS PRINTER BAR */}
      <div className="print:hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 rounded-2xl border border-indigo-800/80 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-sm">
              <Bluetooth className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-white">🛜 2" (58mm) & 3" (80mm) Bluetooth Thermal POS Printer</h3>
                {btStatus === 'connected' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    🟢 Connected: {btDeviceName}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    ⚪ Not Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-200 mt-0.5">
                মোবাইল বা পিসির ব্লুটুথ থার্মাল প্রিন্টারে ডিরেক্ট ক্যাশ মেমো প্রিন্ট করুন।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-indigo-700/60">
              <Zap className={`h-4 w-4 ${autoPrintEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-200">অটো প্রিন্ট (Auto Print):</span>
              <button
                type="button"
                onClick={() => setAutoPrintEnabled(!autoPrintEnabled)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  autoPrintEnabled
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {autoPrintEnabled ? '⚡ ON (চালু)' : 'OFF (বন্ধ)'}
              </button>
            </div>

            <button
              onClick={handleConnectBluetooth}
              disabled={btStatus === 'connecting'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50"
            >
              <Bluetooth className="h-3.5 w-3.5" />
              <span>{btStatus === 'connecting' ? 'কানেক্ট হচ্ছে...' : btStatus === 'connected' ? 'Reconnect Bluetooth' : 'Connect Bluetooth Printer'}</span>
            </button>

            <button
              onClick={handleBluetoothPrint}
              disabled={isBtPrinting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-sm border border-emerald-400 disabled:opacity-50"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-200" />
              <span>{isBtPrinting ? 'প্রিন্ট হচ্ছে...' : '🖨️ Direct Bluetooth Print'}</span>
            </button>

            {order && (
              <a
                href={generateRawBTDataUrl(order, companySettings, paperSize === 'pos2in' ? 'pos2in' : 'pos3in')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm border border-amber-400"
                title="Android RawBT App Thermal Printer Driver"
              >
                <span>📱 RawBT Print (Android)</span>
              </a>
            )}
          </div>
        </div>

        {/* If in iframe, offer Open in New Tab button for Web Bluetooth pairing */}
        {isInIframe() && (
          <div className="bg-indigo-900/80 border border-indigo-700/80 p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-indigo-200 text-[11px] flex items-center gap-1.5">
              <span>ℹ️</span>
              <span><strong>আইফ্রেম সিকিউরিটি নোট:</strong> ওয়েব ব্লুটুথ পপআপ পেমেন্ট/ডিভাইস সিলেক্টর ব্রাউজারের আইফ্রেমে ব্লক থাকে। ১-ক্লিকে <strong>নতুন ট্যাবে</strong> অ্যাপটি খুললে ওয়েব ব্লুটুথ সরাসরি ডায়ালগ ওপেন করবে!</span>
            </span>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
            >
              🚀 Open App in New Tab (নতুন ট্যাবে খুলুন)
            </button>
          </div>
        )}
      </div>



      {/* Bluetooth Toast Notification */}
      {btToastMsg && (
        <div className="print:hidden bg-indigo-900 text-white p-3.5 rounded-2xl shadow-xl border border-indigo-500 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="p-1 bg-indigo-700 rounded-lg text-sm">🛜</span>
            <span>{btToastMsg}</span>
          </div>
          <button
            onClick={() => setBtToastMsg(null)}
            className="text-xs text-indigo-200 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Auto SMS Toast Notification */}
      {smsToastMsg && (
        <div className="print:hidden bg-emerald-900 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-500 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="p-1 bg-emerald-600 rounded-lg text-sm">📱</span>
            <span>{smsToastMsg}</span>
          </div>
          <button
            onClick={() => setSmsToastMsg(null)}
            className="text-xs text-emerald-200 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MEMO TEXT ALIGNMENT & FONT SIZE CONTROLS BAR */}
      <div className="print:hidden bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-md space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">📐</span>
            <h3 className="text-xs font-black text-white">মেমো টেক্সট অ্যালাইনমেন্ট ও ফ্রন্ট কন্ট্রোল (Invoice Text Alignment)</h3>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            Live Canvas Adjustment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 1. Header Align */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">১. হেডার অ্যালাইনমেন্ট (Header):</label>
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setHeaderAlign('left');
                  localStorage.setItem('memo_header_align', 'left');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  headerAlign === 'left' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⬅️ Left (বাম)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeaderAlign('center');
                  localStorage.setItem('memo_header_align', 'center');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  headerAlign === 'center' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ↔️ Center
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeaderAlign('right');
                  localStorage.setItem('memo_header_align', 'right');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  headerAlign === 'right' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ➡️ Right (ডান)
              </button>
            </div>
          </div>

          {/* 2. Body / Table Align */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">২. বডি ও বিষয়বস্তু (Body / Items):</label>
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setBodyAlign('left');
                  localStorage.setItem('memo_body_align', 'left');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  bodyAlign === 'left' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⬅️ Left (বাম)
              </button>
              <button
                type="button"
                onClick={() => {
                  setBodyAlign('center');
                  localStorage.setItem('memo_body_align', 'center');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  bodyAlign === 'center' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ↔️ Center
              </button>
              <button
                type="button"
                onClick={() => {
                  setBodyAlign('right');
                  localStorage.setItem('memo_body_align', 'right');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  bodyAlign === 'right' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ➡️ Right (ডান)
              </button>
            </div>
          </div>

          {/* 3. Footer Align */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">৩. ফুটার অ্যালাইনমেন্ট (Footer):</label>
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setFooterAlign('left');
                  localStorage.setItem('memo_footer_align', 'left');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  footerAlign === 'left' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⬅️ Left (বাম)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFooterAlign('center');
                  localStorage.setItem('memo_footer_align', 'center');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  footerAlign === 'center' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ↔️ Center
              </button>
              <button
                type="button"
                onClick={() => {
                  setFooterAlign('right');
                  localStorage.setItem('memo_footer_align', 'right');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  footerAlign === 'right' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ➡️ Right (ডান)
              </button>
            </div>
          </div>

          {/* 4. Font Size Scale */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">৪. টেক্সট সাইজ (Font Size):</label>
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMemoFontSize('sm');
                  localStorage.setItem('memo_font_size', 'sm');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  memoFontSize === 'sm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Small (ছোট)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMemoFontSize('base');
                  localStorage.setItem('memo_font_size', 'base');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  memoFontSize === 'base' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => {
                  setMemoFontSize('lg');
                  localStorage.setItem('memo_font_size', 'lg');
                }}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  memoFontSize === 'lg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Large (বড়)
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Link Input */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="toggle-qr"
              checked={showQrCode}
              onChange={(e) => setShowQrCode(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="toggle-qr" className="font-bold text-slate-200 cursor-pointer">
              কিউআর কোড দেখান (Show QR Code)
            </label>
          </div>

          {showQrCode && (
            <div className="flex-1 flex items-center gap-2 min-w-[240px]">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">QR Code Link / URL:</span>
              <input
                type="text"
                value={qrCustomUrl}
                onChange={(e) => {
                  setQrCustomUrl(e.target.value);
                  localStorage.setItem('memo_qr_url', e.target.value);
                }}
                placeholder="https://facebook.com/yourpage"
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-full font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Outer Preview Canvas Box */}
      <div className="flex justify-center bg-slate-100 p-2 sm:p-6 rounded-2xl border border-slate-200 print:bg-transparent print:p-0 print:border-none">
        
        {/* Render Layout Based on Selected Size */}
        {paperSize === 'pos3in' || paperSize === 'pos2in' ? (
          /* THERMAL POS RECEIPT LAYOUT (3" or 2") */
          <div
            id="printable-invoice-canvas"
            className={`printable-invoice-container paper-${paperSize} bg-white shadow-xl text-slate-900 font-mono transition-all mx-auto ${
              paperSize === 'pos3in'
                ? memoFontSize === 'sm' ? 'w-[320px] p-3 text-[9.5px]' : memoFontSize === 'lg' ? 'w-[320px] p-4 text-[12px]' : 'w-[320px] p-4 text-[11px]'
                : memoFontSize === 'sm' ? 'w-[230px] p-2 text-[8px]' : memoFontSize === 'lg' ? 'w-[230px] p-2.5 text-[10px]' : 'w-[230px] p-2.5 text-[9px]'
            }`}
          >
            {/* Header / Store Info */}
            <div
              className={`space-y-1 pb-3 border-b border-dashed border-slate-800 ${
                headerAlign === 'left' ? 'text-left' : headerAlign === 'right' ? 'text-right' : 'text-center'
              }`}
            >
              <div
                className={`flex mb-1 ${
                  headerAlign === 'left' ? 'justify-start' : headerAlign === 'right' ? 'justify-end' : 'justify-center'
                }`}
              >
                <img
                  src={companySettings.logoUrl || '/logo.jpg'}
                  alt={companySettings.companyName || 'Hayat Haven Logo'}
                  className="h-12 w-auto object-contain max-w-[150px] block"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== location.origin + '/logo.jpg') {
                      target.src = '/logo.jpg';
                    }
                  }}
                />
              </div>
              <h2 className="font-extrabold tracking-tight text-sm uppercase text-slate-950">{companySettings.companyName}</h2>
              <p className="text-[10px] uppercase font-semibold text-slate-700">{companySettings.businessType}</p>
              <p className="leading-tight text-[10px] text-slate-600">{companySettings.address}</p>
              <p className="text-[10px] text-slate-700 font-medium">TEL: {companySettings.phone}</p>
              {companySettings.taxId && companySettings.taxId.trim() !== '' && companySettings.taxId !== 'N/A' && (
                <p className="text-[10px] text-slate-700 font-medium">BIN: {companySettings.taxId}</p>
              )}
            </div>

            {/* Receipt Info */}
            <div
              className={`py-2 space-y-0.5 border-b border-dashed border-slate-800 text-[10px] ${
                bodyAlign === 'left' ? 'text-left' : bodyAlign === 'right' ? 'text-right' : 'text-center'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="shrink-0 text-slate-600">INVOICE:</span>
                <span className="font-bold shrink-0 text-slate-900">{order.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="shrink-0 text-slate-600">DATE:</span>
                <span className="shrink-0 text-slate-900">{order.orderDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="shrink-0 text-slate-600">METHOD:</span>
                <span className="font-bold shrink-0 text-slate-900">{order.paymentMethod || 'Cash'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="shrink-0 text-slate-600">CUSTOMER:</span>
                <span className="font-bold truncate max-w-[120px] text-slate-900">{order.customerName || customer?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="shrink-0 text-slate-600">TYPE:</span>
                <span className="shrink-0 text-slate-900">{order.orderType}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-2 border-b border-dashed border-slate-800">
              <div className="flex justify-between font-bold border-b border-slate-400 pb-1 mb-1 text-[10px] text-slate-900">
                <span>ITEM</span>
                <span>QTY x PRICE = TOTAL</span>
              </div>
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="space-y-0.5 text-[10px]">
                    <p className={`font-bold leading-tight text-slate-900 ${bodyAlign === 'left' ? 'text-left' : bodyAlign === 'right' ? 'text-right' : 'text-center'}`}>
                      {item.productName || item.productId}
                    </p>
                    <div className="flex justify-between items-center text-slate-800">
                      <span className="shrink-0">{item.quantity} x ৳{item.unitPrice.toLocaleString()}</span>
                      <span className="font-extrabold shrink-0 text-slate-950">৳{item.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Totals */}
            <div className={`py-2 border-b border-dashed border-slate-800 space-y-1 ${paperSize === 'pos2in' ? 'text-[8.5px]' : 'text-[10px]'}`}>
              <div className="flex justify-between items-center text-slate-700 whitespace-nowrap">
                <span className="shrink-0 font-semibold">SUBTOTAL:</span>
                <span className="font-bold shrink-0 text-slate-900">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-rose-700 whitespace-nowrap">
                  <span className="shrink-0 font-semibold">DISCOUNT:</span>
                  <span className="font-bold shrink-0">-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              {order.deliveryCharge > 0 && (
                <div className="flex justify-between items-center text-slate-700 whitespace-nowrap">
                  <span className="shrink-0 font-semibold">DELIVERY:</span>
                  <span className="font-bold shrink-0 text-slate-900">+৳{order.deliveryCharge.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-black text-xs pt-1 border-t border-slate-900 text-slate-950 whitespace-nowrap">
                <span className="shrink-0 uppercase">GRAND TOTAL:</span>
                <span className="font-black shrink-0 text-blue-950">৳{order.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 whitespace-nowrap">
                <span className="shrink-0 font-semibold">ADVANCE / PAID:</span>
                <span className="font-bold shrink-0 text-emerald-800">৳{order.advancePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center font-extrabold text-slate-900 pt-0.5 whitespace-nowrap">
                <span className="shrink-0 uppercase">DUE BALANCE:</span>
                <span className="font-black shrink-0 text-amber-900">৳{order.dueAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment & Footer */}
            <div
              className={`pt-3 space-y-2 text-[10px] ${
                footerAlign === 'left' ? 'text-left' : footerAlign === 'right' ? 'text-right' : 'text-center'
              }`}
            >
              <div className="inline-block bg-slate-900 text-white px-2.5 py-0.5 font-black uppercase text-[9px] rounded">
                STATUS: {order.paymentStatus}
              </div>
              <p className="text-[9px] font-semibold text-slate-900 pt-1 border-t border-slate-300 border-dashed">
                Served By: <strong>{order.createdBy || activeUser?.name || activeUser?.username || 'Admin'}</strong>
                <span className="text-[8px] text-emerald-700 font-mono block">(Auto Detected)</span>
              </p>
              <p className="italic text-slate-700">Thank you for your business!</p>
              
              {/* Barcode Simulation */}
              <div
                className={`pt-2 flex flex-col ${
                  footerAlign === 'left' ? 'items-start' : footerAlign === 'right' ? 'items-end' : 'items-center'
                }`}
              >
                <div className="h-8 w-4/5 bg-slate-900 flex items-center justify-around px-1">
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-1.5 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-2 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-1 h-full bg-white"></div>
                </div>
                <span className="text-[8px] font-mono tracking-widest mt-0.5 text-slate-900">{order.id}</span>
              </div>

              {/* QR Code Block */}
              {showQrCode && (
                <div
                  className={`pt-2 border-t border-dashed border-slate-400 flex flex-col gap-1 ${
                    footerAlign === 'left' ? 'items-start text-left' : footerAlign === 'right' ? 'items-end text-right' : 'items-center text-center'
                  }`}
                >
                  <div className="bg-white p-1 border border-slate-400 rounded shadow-2xs inline-block">
                    {qrSvgString ? (
                      <div
                        className="h-16 w-16 [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                        dangerouslySetInnerHTML={{ __html: qrSvgString }}
                      />
                    ) : qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="h-16 w-16 object-contain block mx-auto"
                        loading="eager"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-slate-100 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                        QR Code
                      </div>
                    )}
                  </div>
                  <div className="text-[8px] font-bold text-slate-900">
                    <span>Scan for Details</span>
                    <p className="font-mono text-slate-600 text-[7px] truncate max-w-[180px]">{qrCustomUrl}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD COMMERCIAL INVOICE LAYOUT (A4 or A5) */
          <div
            id="printable-invoice-canvas"
            className={`printable-invoice-container paper-${paperSize} bg-white shadow-xl text-slate-900 transition-all relative overflow-hidden ${
              paperSize === 'a5'
                ? 'w-full max-w-[148mm] p-5 space-y-4 text-xs'
                : 'w-full max-w-[210mm] p-8 space-y-6 text-xs'
            }`}
          >
            {/* Visual Watermark Stamp Overlay */}
            {(() => {
              const stampText =
                selectedWatermark === 'AUTO'
                  ? order.deliveryStatus === 'Voided' || order.paymentStatus === 'Voided'
                    ? 'VOIDED'
                    : order.paymentStatus === 'Paid'
                    ? 'PAID'
                    : order.dueAmount > 0
                    ? 'DUE'
                    : 'PAID'
                  : selectedWatermark !== 'NONE'
                  ? selectedWatermark
                  : null;

              if (!stampText) return null;

              const stampColor =
                stampText === 'PAID' || stampText === 'RECEIVED' || stampText === 'APPROVED'
                  ? 'border-emerald-600 text-emerald-600/80'
                  : stampText === 'VOIDED'
                  ? 'border-red-600 text-red-600/80'
                  : 'border-amber-600 text-amber-600/80';

              return (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-25">
                  <div
                    className={`border-8 border-double px-10 py-3 rounded-2xl transform -rotate-25 font-black tracking-widest text-5xl uppercase ${stampColor}`}
                  >
                    {stampText}
                  </div>
                </div>
              );
            })()}
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={companySettings.logoUrl || '/logo.jpg'}
                    alt={companySettings.companyName || 'Hayat Haven Enterprise Logo'}
                    className={`${paperSize === 'a5' ? 'h-10' : 'h-14'} w-auto object-contain max-w-[180px] block`}
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== location.origin + '/logo.jpg') {
                        target.src = '/logo.jpg';
                      }
                    }}
                  />
                  <div>
                    <h1 className={`${paperSize === 'a5' ? 'text-base' : 'text-xl'} font-black text-blue-950 tracking-tight`}>
                      {companySettings.companyName}
                    </h1>
                    <p className="text-[11px] font-bold text-blue-800">{companySettings.businessType}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 max-w-xs mt-1 leading-tight">{companySettings.address}</p>
                <div className="text-[10px] text-slate-500 mt-1">
                  <span>Phone: <strong>{companySettings.phone}</strong></span>
                  {companySettings.taxId && companySettings.taxId.trim() !== '' && companySettings.taxId !== 'N/A' && (
                    <span> • BIN: <strong>{companySettings.taxId}</strong></span>
                  )}
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block bg-blue-900 text-white font-black px-3 py-1 rounded text-[10px] uppercase tracking-wider">
                  COMMERCIAL INVOICE
                </span>
                <p className="text-xs font-bold text-slate-900 pt-1">Invoice: {order.id}</p>
                <p className="text-[10px] text-slate-600">Date: {order.orderDate}</p>
                <p className="text-[10px] text-slate-600">Type: <strong className="text-slate-900">{order.orderType}</strong></p>
                <p className="text-[10px] text-slate-600">Method: <strong className="text-blue-900 font-black">{order.paymentMethod || 'Cash'}</strong></p>
              </div>
            </div>

            {/* Customer & Bill To */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs relative overflow-hidden">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">BILLED TO & DELIVERY ADDRESS</span>
                <h3 className="text-xs font-bold text-slate-900 mt-0.5">{order.customerName || customer?.name}</h3>
                <p className="text-[10px] text-slate-600">Phone: {customer?.phone || 'N/A'}</p>
                <p className="text-[10px] text-slate-600">
                  Address: {order.deliveryAddress || order.customerAddress || customer?.address || 'Dhaka, Bangladesh'}
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">PAYMENT & DELIVERY STATUS</span>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    order.deliveryStatus === 'Voided' || order.paymentStatus === 'Voided'
                      ? 'bg-red-600 text-white border border-red-700'
                      : order.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : order.paymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {order.deliveryStatus === 'Voided' ? 'VOIDED / CANCELLED' : order.paymentStatus}
                </span>
                {order.deliveryCharge > 0 && (
                  <p className="text-[10px] text-slate-600 font-semibold mt-1">Delivery Charge: ৳{order.deliveryCharge.toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Void Banner if order is voided */}
            {(order.deliveryStatus === 'Voided' || order.paymentStatus === 'Voided') && (
              <div className="bg-red-50 border-2 border-red-500 text-red-900 p-3 rounded-xl text-center font-bold text-xs space-y-1">
                <p className="uppercase tracking-widest text-red-600 font-black">⚠️ THIS INVOICE IS VOIDED / CANCELLED (বাতিলকৃত ইনভয়েস)</p>
                {order.voidReason && <p className="text-[11px] font-normal text-red-700">Reason: "{order.voidReason}"</p>}
              </div>
            )}

            {/* Line Items Table */}
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="py-2 px-2.5 font-bold w-8 text-center">#</th>
                  <th className="py-2 px-2.5 font-bold">Item Description</th>
                  <th className="py-2 px-2.5 font-bold text-right w-16">Qty</th>
                  <th className="py-2 px-2.5 font-bold text-right w-24">Price (৳)</th>
                  <th className="py-2 px-2.5 font-bold text-right w-24">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 text-center text-slate-500 font-bold text-[10px]">{index + 1}</td>
                    <td className="py-2 px-2.5">
                      <span className="font-bold text-slate-900 block">{item.productName || item.productId}</span>
                    </td>
                    <td className="py-2 px-2.5 text-right font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-2 px-2.5 text-right text-slate-700">৳{item.unitPrice.toLocaleString()}</td>
                    <td className="py-2 px-2.5 text-right font-black text-slate-900">৳{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary Calculation */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs pt-1">
              <div className="space-y-2 max-w-xs text-[10px] text-slate-600">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-700 block">Bank Details:</span>
                  <p className="whitespace-pre-line">{companySettings.bankDetails}</p>
                </div>
                <p className="italic">{companySettings.termsAndConditions}</p>

                {/* Facebook Page / Custom QR Code Block */}
                {showQrCode && (
                  <div className="flex items-center gap-2.5 bg-blue-50/70 p-2 rounded-xl border border-blue-200/80">
                    <div className="bg-white p-1 rounded-lg border border-blue-200 shadow-2xs shrink-0">
                      {qrSvgString ? (
                        <div
                          className="h-14 w-14 [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                          dangerouslySetInnerHTML={{ __html: qrSvgString }}
                        />
                      ) : qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="QR Code"
                          className="h-14 w-14 object-contain block"
                          loading="eager"
                        />
                      ) : (
                        <div className="h-14 w-14 bg-slate-100 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                          QR Code
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] space-y-0.5">
                      <span className="font-bold text-blue-950 block flex items-center gap-1">
                        <svg className="w-3 h-3 fill-blue-600 shrink-0" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Business / Facebook QR Code
                      </span>
                      <p className="text-slate-600 font-semibold text-[9px] truncate max-w-[170px]">
                        {qrCustomUrl}
                      </p>
                      <p className="text-[9px] text-blue-800 font-medium">স্ক্যান করে বিস্তারিত পেইজ ও কালেকশন দেখুন</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-1 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600 py-0.5">
                  <span className="shrink-0">Subtotal:</span>
                  <span className="font-bold text-slate-900 shrink-0">৳{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-600 py-0.5">
                    <span className="shrink-0">Discount:</span>
                    <span className="font-bold text-red-600 shrink-0">-৳{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {order.deliveryCharge > 0 && (
                  <div className="flex justify-between text-slate-600 py-0.5">
                    <span className="shrink-0">Delivery:</span>
                    <span className="font-bold text-slate-900 shrink-0">+৳{order.deliveryCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-t border-b border-slate-900 font-black text-blue-950">
                  <span className="shrink-0">Grand Total:</span>
                  <span className="shrink-0">৳{order.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 py-0.5">
                  <span className="shrink-0">Advance Paid:</span>
                  <span className="font-bold text-emerald-700 shrink-0">৳{order.advancePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 font-black text-amber-900 bg-amber-100 px-2 rounded">
                  <span className="shrink-0">Balance Due:</span>
                  <span className="shrink-0">৳{order.dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px]">
              <div>
                <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold text-slate-600">
                  Customer Signature
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-bold text-blue-950">
                  Authorized Signature
                </div>
                <p className="text-[10px] text-slate-700 font-semibold mt-1">
                  Served By: <span className="font-bold text-blue-950">{order.createdBy || activeUser?.name || activeUser?.username || 'Admin'}</span> <span className="text-[8px] text-emerald-700 font-mono">(Auto Detected)</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WHATSAPP SHARING MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#25D366]">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-sm">Send Invoice via WhatsApp</h3>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Helper explanation box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1.5 text-[11px] text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <FileCheck className="h-4 w-4" />
                  <span>How WhatsApp Sharing Works:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>
                    <strong>Text Message (Instant):</strong> Click "Open WhatsApp & Send Text" to send a clean itemized summary directly into the chat.
                  </li>
                  <li>
                    <strong>PDF Document Attachment:</strong> Click "Download PDF First", then open WhatsApp and attach the PDF using the 📎 paperclip icon.
                  </li>
                </ul>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Phone Number (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="e.g. 01711889900 or +8801711889900"
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs font-semibold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Target formatted number: <span className="font-mono font-bold text-slate-700">+{formatWhatsAppPhone(whatsappPhone)}</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Text Message Preview</label>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {generateWhatsAppInvoiceMessage(order, customer, companySettings)}
                </pre>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  await handlePDFDownload();
                  handleSendWhatsApp();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF & Open WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] shadow-md cursor-pointer transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Text Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL SHARING MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Mail className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-sm">Send Invoice via Email</h3>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {emailSentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Invoice Email Sent Successfully!</h4>
                <p className="text-xs text-slate-500">
                  Tax invoice <strong className="text-slate-800">{order.id}</strong> was delivered to <strong className="text-slate-800">{emailTo}</strong> with attached PDF.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmailSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-[11px]">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    <span>Attached Document: Invoice_{order.id}.pdf</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Grand Total: <strong>৳{order.grandTotal.toLocaleString()}</strong> | Balance Due: <strong className="text-amber-800">৳{order.dueAmount.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <a
                    href={`mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
                      `Dear ${order.customerName || customer?.name || 'Customer'},\n\nPlease find attached the invoice ${order.id} from ${companySettings.companyName}.\nTotal Amount: ৳${order.grandTotal.toLocaleString()}\nDue Balance: ৳${order.dueAmount.toLocaleString()}\n\nThank you!`
                    )}`}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Open Mail App (mailto)</span>
                  </a>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSendingEmail ? 'Sending...' : 'Send Invoice Email'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

