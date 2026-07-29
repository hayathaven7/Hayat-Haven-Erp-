import React, { useState } from 'react';
import {
  Bot,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  Printer,
  ChevronRight,
  Info,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter,
  Check,
  Building2,
  Search,
  Link,
  Key,
  Globe,
  Copy,
  Settings,
  HelpCircle,
  Save,
  Layers,
  Radio,
  FileText,
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ChatMessage, PendingOrder } from '../../types/erp';

export const AIBotPendingModule: React.FC = () => {
  const {
    pendingOrders,
    approvePendingOrder,
    rejectPendingOrder,
    deletePendingOrder,
    batchDeletePendingOrders,
    batchApprovePendingOrders,
    addPendingOrder,
    products,
    setActiveModule,
    setSelectedPrintOrder,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'bot_chat' | 'pending_queue' | 'connect_guide' | 'bot_settings'>('bot_chat');
  const [selectedChannel, setSelectedChannel] = useState<'WhatsApp' | 'Facebook Messenger'>('WhatsApp');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Bot Custom Rules & Product Knowledge State
  const [botWelcomeMsg, setBotWelcomeMsg] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('bot_welcome_msg') ||
        'আসসালামু আলাইকুম! Hayat Haven (হায়াত হেভেন) কাস্টমাইজড গিফট শপে স্বাগতম। 🎁✨ আমি আপনার AI অটো-অর্ডার ও কাস্টমাইজেশন এসিস্ট্যান্ট। আমাদের কাছে কাস্টমাইজড ওয়ালেট কম্বো, উডেন ফটো প্লাক, এক্রিলিক ৩ডি নাইট ল্যাম্প, কাস্টমাইজড ম্যাজিক মগ ও লাক্সারি কাপল কম্বো রয়েছে। আপনার কাঙ্ক্ষিত গিফট কোনটি?'
      );
    } catch {
      return 'আসসালামু আলাইকুম! Hayat Haven (হায়াত হেভেন) কাস্টমাইজড গিফট শপে স্বাগতম। 🎁✨';
    }
  });

  const [botProductKnowledge, setBotProductKnowledge] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('bot_product_knowledge') ||
        `• শপের নাম: Hayat Haven (হায়াত হেভেন)
• প্রধান প্রোডাক্টসমূহ:
  ১. কাস্টমাইজড লেদার ওয়ালেট ও কি-রিং কম্বো বক্স (দাম: ৳১,৪৫০) - নাম খোদাই ফ্রি।
  ২. কাস্টমাইজড ৩ডি ফটো নাইট ল্যাম্প (দাম: ৳১,২৫০) - এক্রিলিক গ্লাস ফটো প্রিন্ট ও উডেন নিওন বেস।
  ৩. কাস্টমাইজড ম্যাজিক মগ (দাম: ৳৫৫০) - চা বা গরম পানি ঢাললে ছবি ভেসে ওঠে।
  ৪. কাস্টমাইজড উডেন ফটো প্লাক (দাম: ৳৯৫০) - কাঠের ওপর খোদাই ছবি ও লাভ মেসেজ।
• কাস্টমাইজেশন নির্দেশাবলী: যেকোনো নাম, বাংলা/ইংরেজি খোদাই লেখা এবং কাস্টম ফটো লেজার প্রিন্ট করা যায়।
• অর্ডার বুকিং নিয়ম: কাস্টমারের নাম, ফোন নাম্বার, ডেলিভারি ঠিকানা এবং খোদাই করার নাম/ছবি পাঠাতে বলবেন।`
      );
    } catch {
      return '';
    }
  });

  const [botDeliveryInfo, setBotDeliveryInfo] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('bot_delivery_info') ||
        'ঢাকার ভেতরে ডেলিভারি চার্জ ৳১০০ (২৪-৪৮ ঘন্টা), ঢাকার বাইরে ৳১৫০ (২-৩ দিন)। কাস্টমাইজড কাজের সুরক্ষার জন্য ৳২০০ এডভান্স করতে হয়।'
      );
    } catch {
      return '';
    }
  });

  const [botSavedNotification, setBotSavedNotification] = useState(false);

  const handleSaveBotSettings = () => {
    try {
      localStorage.setItem('bot_welcome_msg', botWelcomeMsg);
      localStorage.setItem('bot_product_knowledge', botProductKnowledge);
      localStorage.setItem('bot_delivery_info', botDeliveryInfo);
      setBotSavedNotification(true);
      setTimeout(() => setBotSavedNotification(false), 3500);

      // Update initial chat message in simulator
      setChatMessages((prev) => [
        {
          id: 'c1',
          sender: 'bot',
          text: botWelcomeMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  // API & Webhook Credentials State
  const [waPhoneId, setWaPhoneId] = useState('01410090076');
  const [waAccessToken, setWaAccessToken] = useState('EAAX...meta_wa_token');
  const [waVerifyToken, setWaVerifyToken] = useState('hayat_haven_gift_bot_2026');
  const [fbPageToken, setFbPageToken] = useState('EAAX...meta_page_token');
  const [fbVerifyToken, setFbVerifyToken] = useState('hayat_haven_fb_bot_2026');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [keysSaved, setKeysSaved] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hayat-haven-erp.run.app';
  const waWebhookUrl = `${currentOrigin}/api/webhook/whatsapp`;
  const fbWebhookUrl = `${currentOrigin}/api/webhook/facebook`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! Hayat Haven (হায়াত হেভেন) কাস্টমাইজড গিফট শপে স্বাগতম। 🎁✨ আমি আপনার AI অটো-অর্ডার ও কাস্টমাইজেশন এসিস্ট্যান্ট। আমাদের কাছে কাস্টমাইজড ওয়ালেট কম্বো, উডেন ফটো প্লাক, এক্রিলিক ৩ডি নাইট ল্যাম্প, কাস্টমাইজড ম্যাজিক মগ ও লাক্সারি কাপল কম্বো রয়েছে। আপনার কাঙ্ক্ষিত গিফট কোনটি?',
      time: '12:00',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChatOrder, setSelectedChatOrder] = useState<PendingOrder | null>(null);

  // Extracted Order State for Chat Bot
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [customerAddressInput, setCustomerAddressInput] = useState('');

  // Bot Logic Response Handler
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'customer',
      text: query,
      time: userMsgTime,
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lower = (query || '').toLowerCase();

      // Check product queries
      const activeCatalogList = products.length > 0 ? products.slice(0, 5) : [];

      if (lower.includes('ডেলিভারি') || lower.includes('delivery') || lower.includes('কুরিয়ার') || lower.includes('চার্জ')) {
        botResponse = `ডেলিভারি ও পেমেন্ট রুলস:\n${botDeliveryInfo}`;
      } else if (lower.includes('দাম') || lower.includes('দাম কত') || lower.includes('price') || lower.includes('মেনু') || lower.includes('রেট') || lower.includes('গিফট') || lower.includes('প্রোডাক্ট')) {
        botResponse = `আমাদের আপডেট প্রোডাক্ট তালিকা ও মূল্য বিবরণী (AI Knowledge):\n\n${botProductKnowledge}\n\nডেলিভারি নিয়ম: ${botDeliveryInfo}`;
      } else if (lower.includes('ওয়ালেট') || lower.includes('wallet') || lower.includes('কম্বো')) {
        const p = products.find(item => item.name.toLowerCase().includes('wallet') || item.name.toLowerCase().includes('ওয়ালেট')) || products[0];
        botResponse = `জ্বী স্যার! ${p.name} আমাদের বেস্ট সেলার। প্রিমিয়াম ওয়ালেট ও কি-রিঙে নাম খোদাই করে দেওয়া হয়। সেটটির মূল্য ৳${p.sellingPrice.toLocaleString()}। ওয়ালেটে কি নাম খোদাই করবেন জানান!`;
      } else if (lower.includes('ল্যাম্প') || lower.includes('lamp') || lower.includes('৩ডি')) {
        const p = products.find(item => item.name.toLowerCase().includes('lamp') || item.name.toLowerCase().includes('ল্যাম্প')) || products[2];
        botResponse = `জ্বী স্যার! ${p.name} আমাদের অত্যন্ত জনপ্রিয় আইটেম। মূল্য ৳${p.sellingPrice.toLocaleString()}। আপনার ছবি পাঠালে আমরা সুন্দর ৩ডি এক্রিলিক ফটো নাইট ল্যাম্প বানিয়ে দিব।`;
      } else if (lower.includes('মগ') || lower.includes('mug') || lower.includes('ম্যাজিক')) {
        const p = products.find(item => item.name.toLowerCase().includes('mug') || item.name.toLowerCase().includes('মগ')) || products[3];
        botResponse = `আমাদের ${p.name} এর মূল্য ৳${p.sellingPrice.toLocaleString()}। এতে ছবি কালার চেঞ্জ হয়ে ভেসে ওঠে!`;
      } else if (lower.includes('অর্ডার') || lower.includes('নিব') || lower.includes('চাই') || lower.includes('order')) {
        botResponse = `কাস্টমাইজড গিফট অর্ডার বুকিংয়ের জন্য আপনার:\n১. নাম\n২. মোবাইল নাম্বার\n৩. ডেলিভারি ঠিকানা\n৪. কাস্টমাইজেশন টেক্সট (খোদাই করার নাম বা ছবি)\nলিখে পাঠান। আমি পেন্ডিং অর্ডারে সরাসরি সেভ করে দিব।`;
      } else if (/\d{11}/.test(query) || lower.includes('ঢাকা') || lower.includes('উত্তরা') || lower.includes('মিরপুর') || lower.includes('ধানমন্ডি')) {
        // Auto parse phone / address and trigger pending order
        const extractedPhone = (query.match(/01\d{9}/) || ['+880 1700-112233'])[0];
        const extractedName = query.split(',')[0] || 'অনলাইন কাস্টমার';
        const targetProduct = products[0];

        const createdPending = addPendingOrder({
          channel: selectedChannel,
          customerName: extractedName.length > 2 ? extractedName : 'মোঃ তানভীর হাসান',
          customerPhone: extractedPhone,
          customerAddress: query,
          items: [
            {
              productId: targetProduct.id,
              productName: targetProduct.name,
              quantity: 1,
              unitPrice: targetProduct.sellingPrice,
              totalPrice: targetProduct.sellingPrice,
            },
          ],
          subtotal: targetProduct.sellingPrice,
          deliveryCharge: 100,
          grandTotal: targetProduct.sellingPrice + 100,
          aiNotes: `Simulated auto-order from ${selectedChannel} gift chat. Customized engraving request included.`,
          chatHistory: [
            ...newHistory,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `অসংখ্য ধন্যবাদ! আপনার ${targetProduct.name} এর অর্ডারটি তৈরি করা হয়েছে।\nমোট বিল: ৳${(targetProduct.sellingPrice + 100).toLocaleString()} (ডেলিভারিসহ)।\nট্র্যাকিং আইডি: PEND-NEW\nঅর্ডারটি অ্যাডমিন পেন্ডিং তালিকায় পাঠানো হয়েছে!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        });

        botResponse = `✅ ধন্যবাদ স্যার! আপনার ${targetProduct.name} অর্ডারটি পেন্ডিং সেকশনে সরাসরি জমা করা হয়েছে (ট্র্যাকিং ID: ${createdPending.id})। আমাদের টিম দ্রুত কাস্টমাইজেশন ডিজাইন কনফার্ম করতে যোগাযোগ করবে।`;
      } else if (lower.includes('হ্যাঁ') || lower.includes('ok') || lower.includes('confirm') || lower.includes('ঠিক আছে')) {
        botResponse = `অসংখ্য ধন্যবাদ স্যার! আপনার কাস্টমাইজড অর্ডার কনফার্ম করে সিস্টেমে পেন্ডিং সেকশনে রাখা হলো। আপনি 'Pending Orders Queue' ট্যাবে এটি দেখতে পারেন।`;
      } else {
        botResponse = `আপনাকে কিভাবে সাহায্য করতে পারি? আমাদের গিফট সামগ্রীর দাম জানতে টাইপ করুন 'দাম' অথবা সরাসরি কাস্টমাইজেশন নির্দেশাবলী ও ঠিকানা দিন।`;
      }

      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  // Run Quick Preset Customer Simulations
  const runPresetSimulation = (scenario: 'leather_wallet_combo' | 'acrylic_lamp_magic_mug') => {
    let orderData: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>;

    if (scenario === 'leather_wallet_combo') {
      const p = products.find(prod => prod.id === 'PRD-1001') || products[0];
      const qty = 1;
      const sub = p.sellingPrice * qty;
      orderData = {
        channel: 'WhatsApp',
        customerName: 'মোঃ রাশেদুল ইসলাম (Rashedul Islam)',
        customerPhone: '+880 1711-998877',
        customerAddress: 'বাসা ১৭/এ, সড়ক ৫, সেক্টর ১১, উত্তরা, ঢাকা',
        items: [
          {
            productId: p.id,
            productName: p.name,
            quantity: qty,
            unitPrice: p.sellingPrice,
            totalPrice: sub,
          },
        ],
        subtotal: sub,
        deliveryCharge: 100,
        grandTotal: sub + 100,
        aiNotes: 'WhatsApp AI Bot Simulation: Customer ordered Engraved Leather Wallet & Keychain Combo Box. Name to engrave: "Rashedul Islam".',
        chatHistory: [
          { id: '1', sender: 'customer', text: 'হাই, কাস্টমাইজড ওয়ালেট কম্বো বক্সে কি নাম খোদাই করে দেয়া যাবে?', time: '16:00' },
          { id: '2', sender: 'bot', text: 'জ্বী স্যার! Customized Engraved Leather Wallet & Keychain Combo Box এ নাম খোদাই করে দেওয়া হয়। দাম ৳১,৪৫০।', time: '16:00' },
          { id: '3', sender: 'customer', text: 'আমি ১টি কম্বো বক্স নিব। উত্তরা সেক্টর ১১ তে কাল পাঠাতে পারবেন? ওয়ালেটে থাকবে: Rashedul Islam', time: '16:01' },
          { id: '4', sender: 'bot', text: 'অবশ্যই স্যার। মোবাইল নাম্বার ও ঠিকানা দিন।', time: '16:01' },
          { id: '5', sender: 'customer', text: 'মোঃ রাশেদুল ইসলাম, ০১৭১১৯৯৮৮৭৭, বাসা ১৭/এ, সড়ক ৫, সেক্টর ১১, উত্তরা', time: '16:02' },
          { id: '6', sender: 'bot', text: 'অর্ডার পেন্ডিং এ জমা করা হলো! বিল: ৳১,৫৫০।', time: '16:02' },
        ],
      };
    } else {
      const p1 = products.find(prod => prod.id === 'PRD-1003') || products[2];
      const p2 = products.find(prod => prod.id === 'PRD-1004') || products[3];
      const sub = p1.sellingPrice * 1 + p2.sellingPrice * 1;

      orderData = {
        channel: 'Facebook Messenger',
        customerName: 'শারমিন সুলতানা (Sharmin Sultana)',
        customerPhone: '+880 1819-332211',
        customerAddress: 'হাউজ ২৪, লেন ৪, ব্লক সি, সেকশন ১০, মিরপুর, ঢাকা',
        items: [
          {
            productId: p1.id,
            productName: p1.name,
            quantity: 1,
            unitPrice: p1.sellingPrice,
            totalPrice: p1.sellingPrice,
          },
          {
            productId: p2.id,
            productName: p2.name,
            quantity: 1,
            unitPrice: p2.sellingPrice,
            totalPrice: p2.sellingPrice,
          },
        ],
        subtotal: sub,
        deliveryCharge: 100,
        grandTotal: sub + 100,
        aiNotes: 'Messenger AI Bot Simulation: Customer ordered 3D Acrylic Photo Lamp + Magic Mug from facebook.com/hayathaven7.',
        chatHistory: [
          { id: '1', sender: 'customer', text: 'Hello, photo 3d lamp and magic mug price please?', time: '16:10' },
          { id: '2', sender: 'bot', text: `3D Acrylic Photo Lamp = ৳${p1.sellingPrice} and Magic Mug = ৳${p2.sellingPrice}.`, time: '16:10' },
          { id: '3', sender: 'customer', text: 'I want 1 photo lamp and 1 magic mug. Mirpur 10 delivery.', time: '16:12' },
          { id: '4', sender: 'bot', text: 'Order saved in Pending List!', time: '16:12' },
        ],
      };
    }

    addPendingOrder(orderData);
    setActiveTab('pending_queue');
  };

  // Handle Order Approval & Stock Deduct
  const handleApproveOrder = (pendingId: string) => {
    const createdSO = approvePendingOrder(pendingId);
    if (createdSO) {
      setSelectedPrintOrder(createdSO);
      setActiveModule('invoice_print');
    }
  };

  // Filtered pending orders
  const filteredOrders = pendingOrders.filter((po) => {
    const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
    const query = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (po.id && po.id.toLowerCase().includes(query)) ||
      (po.customerName && po.customerName.toLowerCase().includes(query)) ||
      (po.customerPhone && po.customerPhone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = pendingOrders.filter((po) => po.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Bot className="h-7 w-7 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black tracking-tight">
                WhatsApp & Messenger AI Order Bot (এআই অটো-অর্ডার বট)
              </h1>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                AI Webhook Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              আপনার সোশ্যাল মিডিয়া কাস্টমারদের সাথে মানুষের মত অটোমেটিক চ্যাট করে Hayat Haven (হায়াত হেভেন) এর কাস্টমাইজড গিফট আইটেম (ওয়ালেট কম্বো, উডেন ফটো প্লাক, ৩ডি এক্রিলিক ল্যাম্প, কাস্টম মগ) এর দাম ও স্টক সম্পর্কিত উত্তর দিবে এবং কাস্টমারের নাম, ফোন, ঠিকানা ও কাস্টমাইজেশন টেক্সট নিয়ে সরাসরি <strong>পেন্ডিং অর্ডারে</strong> জমা করবে!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setActiveTab('bot_chat')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bot_chat'
                ? 'bg-blue-600 text-white shadow-lg border border-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Bot Chat Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('pending_queue')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'pending_queue'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg border border-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Pending Orders</span>
            {pendingCount > 0 && (
              <span className="h-5 w-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('connect_guide')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'connect_guide'
                ? 'bg-emerald-600 text-white font-black shadow-lg border border-emerald-400'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Link className="h-4 w-4 text-emerald-300" />
            <span>🔗 Connect WhatsApp & Page</span>
          </button>

          <button
            onClick={() => setActiveTab('bot_settings')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bot_settings'
                ? 'bg-purple-600 text-white font-black shadow-lg border border-purple-400'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4 text-purple-300 animate-spin-slow" />
            <span>⚙️ বটের মেসেজ ও প্রম্পট (Bot Settings)</span>
          </button>
        </div>
      </div>

      {/* Main Module Body */}
      {activeTab === 'bot_chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Chat Simulator */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[650px]">
            {/* Chat Top Bar */}
            <div
              className={`p-4 text-white flex items-center justify-between transition-all ${
                selectedChannel === 'WhatsApp'
                  ? 'bg-emerald-800 border-b border-emerald-900'
                  : 'bg-blue-700 border-b border-blue-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white font-bold">
                    <Bot className="h-6 w-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-900"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    {selectedChannel === 'WhatsApp' ? '🟢 WhatsApp Business Bot' : '🔵 Messenger Bot'}
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Gemini 2.5 NLP</span>
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Hayat Haven Customized Gifts Bot • Auto Order Parsing
                  </p>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center bg-black/20 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setSelectedChannel('WhatsApp')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedChannel === 'WhatsApp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setSelectedChannel('Facebook Messenger')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedChannel === 'Facebook Messenger' ? 'bg-blue-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Messenger
                </button>
              </div>
            </div>

            {/* Catalog Recommendation Quick Buttons */}
            <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Quick Catalog Hints:
              </span>
              <button
                onClick={() => handleSendMessage('কাস্টমাইজড ওয়ালেট কম্বোর দাম কত?')}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-blue-900 shrink-0 cursor-pointer shadow-2xs"
              >
                🎁 ওয়ালেট কম্বো
              </button>
              <button
                onClick={() => handleSendMessage('৩ডি ফটো নাইট ল্যাম্প এর দাম কত?')}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-blue-900 shrink-0 cursor-pointer shadow-2xs"
              >
                📸 ৩ডি ফটো ল্যাম্প
              </button>
              <button
                onClick={() => handleSendMessage('ম্যাজিক কালার চেঞ্জিং মগ এর প্রাইজ কত?')}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-blue-900 shrink-0 cursor-pointer shadow-2xs"
              >
                ☕ ম্যাজিক মগ
              </button>
              <button
                onClick={() => handleSendMessage('নাম: তানভীর হাসান, ফোন: ০১৭১১২২৩৩৪৪, খোদাই নাম: Tanvir Hasan, উত্তরা সেক্টর ৪, ঢাকা')}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer shadow-2xs"
              >
                ⚡ সিমুলেট অর্ডার টেক্সট
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E5DDD5]/30 custom-scrollbar">
              {chatMessages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
                          : selectedChannel === 'WhatsApp'
                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                          : 'bg-blue-600 text-white rounded-tr-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75 font-semibold">
                        <span>{isBot ? '🤖 Hayat Haven Bot' : '👤 Customer'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-2 text-xs text-slate-500 border border-slate-200 flex items-center gap-2 shadow-2xs">
                    <Bot className="h-4 w-4 text-blue-600 animate-spin" />
                    <span>AI Bot typing response...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type customer message (e.g. ১টি ওয়ালেট কম্বো নিব, খোদাই থাকবে: Tanvir Hasan)..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden"
              />
              <button
                type="submit"
                className={`p-2.5 rounded-xl text-white font-bold transition-all cursor-pointer shadow-md ${
                  selectedChannel === 'WhatsApp' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Column: AI Automation Controls & One-Click Presets */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Demo Simulator Box */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-2xl p-5 border border-amber-300 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-amber-900">
                <Zap className="h-5 w-5 text-amber-600 fill-amber-500" />
                <h3 className="text-sm font-black">এক ক্লিকে সিমুলেশন করুন (1-Click Presets)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                নিচের বাটনগুলোতে ক্লিক করলে সোশ্যাল মিডিয়ার কাস্টমার চ্যাট অটোমেটিক সম্পন্ন হয়ে অর্ডারে রূপান্তর হবে এবং <strong>পেন্ডিং অর্ডারে</strong> সেভ হবে:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => runPresetSimulation('leather_wallet_combo')}
                  className="w-full text-left p-3 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-xl transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      🟢 1-Click WhatsApp Order
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      ৳১,৫৫০
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customer: মোঃ রাশেদুল ইসলাম (উত্তরা) • কাস্টমাইজড ওয়ালেট কম্বো
                  </p>
                </button>

                <button
                  onClick={() => runPresetSimulation('acrylic_lamp_magic_mug')}
                  className="w-full text-left p-3 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-xl transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      🔵 1-Click Messenger Order
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      ৳১,৯০০
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customer: শারমিন সুলতানা (মিরপুর) • ৩ডি ফটো ল্যাম্প + ম্যাজিক মগ
                  </p>
                </button>
              </div>
            </div>

            {/* Bot Stock Knowledge Sync Box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">AI Live Product Knowledge</h3>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  Synced with ERP
                </span>
              </div>

              <div className="space-y-2">
                {products
                  .slice(0, 5)
                  .map((prod) => (
                    <div key={prod.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[180px]">{prod.name}</p>
                        <p className="text-[10px] text-slate-500">Stock: <strong className="text-slate-800">{prod.currentStock} {prod.unit}</strong></p>
                      </div>
                      <span className="text-xs font-black text-blue-900 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                        ৳{prod.sellingPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* How System Works Step Guide */}
            <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 space-y-3 text-xs">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                অটোমেশন যেভাবে কাজ করে (Flow):
              </h4>
              <ol className="space-y-2 text-[11px] leading-relaxed list-decimal pl-4 font-sans text-slate-300">
                <li>সোশ্যাল মিডিয়া থেকে মেসেজ এলেই এআই বট কাস্টমারের সাথে কথা বলে দাম ও বিবরণ দেয়।</li>
                <li>কাস্টমার অর্ডার করলে নাম, ফোন ও ঠিকানা নিয়ে <strong>পেন্ডিং অর্ডারে</strong> সেভ করে।</li>
                <li>আপনি <strong>"Approve & Confirm Order"</strong> এ ক্লিক করলে স্টক কমবে, সেলে যোগ হবে এবং মেমো তৈরি হবে।</li>
              </ol>
            </div>
          </div>
        </div>
      ) : activeTab === 'pending_queue' ? (
        /* Pending Orders Queue Table / Cards */
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === st
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st === 'Pending' ? `⏳ Pending (${pendingCount})` : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select All Checkbox */}
              {filteredOrders.length > 0 && (
                <button
                  onClick={() => {
                    if (selectedOrderIds.length === filteredOrders.length) {
                      setSelectedOrderIds([]);
                    } else {
                      setSelectedOrderIds(filteredOrders.map((o) => o.id));
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-300"
                >
                  {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                  <span>
                    {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0
                      ? 'Unselect All'
                      : `Select All (${filteredOrders.length})`}
                  </span>
                </button>
              )}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Pending Order ID, Customer, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* BATCH ACTIONS FLOATING / BANNER BAR */}
          {selectedOrderIds.length > 0 && (
            <div className="bg-blue-900 text-white p-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fade-in border border-blue-700">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-blue-800 px-2.5 py-1 rounded-lg border border-blue-600 text-amber-300 font-mono">
                  {selectedOrderIds.length} Marked / Selected
                </span>
                <span>মার্ক করা অর্ডারগুলোর জন্য অ্যাকশন সিলেক্ট করুন:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    batchApprovePendingOrders(selectedOrderIds);
                    setSelectedOrderIds([]);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Batch Approve (অ্যাপ্রুভ)</span>
                </button>

                <button
                  onClick={() => {
                    setActiveModule('invoice_print');
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs border border-slate-600"
                >
                  <Printer className="h-4 w-4 text-blue-400" />
                  <span>Batch Print (প্রিন্ট)</span>
                </button>

                <button
                  onClick={() => {
                    batchDeletePendingOrders(selectedOrderIds);
                    setSelectedOrderIds([]);
                  }}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Batch Delete (ডিলেট)</span>
                </button>

                <button
                  onClick={() => setSelectedOrderIds([])}
                  className="text-xs text-blue-200 hover:text-white px-2 py-1 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Order Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <Clock className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Pending Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                সোশ্যাল মিডিয়া বট থেকে নতুন অর্ডার এলে এখানে জমা হবে অথবা বামপাশের ট্যাবে যেয়ে ৩ সেকেন্ডে বট সিমুলেশন টেস্ট করুন!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrders.map((order) => {
                const isPending = order.status === 'Pending';
                const isApproved = order.status === 'Approved';
                const isSelected = selectedOrderIds.includes(order.id);

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col overflow-hidden relative ${
                      isSelected ? 'ring-2 ring-blue-600 border-blue-600' : ''
                    } ${
                      isPending
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : isApproved
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 opacity-75'
                    }`}
                  >
                    {/* Card Top */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Checkbox */}
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedOrderIds(selectedOrderIds.filter((id) => id !== order.id));
                            } else {
                              setSelectedOrderIds([...selectedOrderIds, order.id]);
                            }
                          }}
                          className="p-1 text-slate-600 hover:text-blue-600 cursor-pointer"
                          title="Mark Order"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>

                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                            order.channel === 'WhatsApp'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {order.channel === 'WhatsApp' ? '🟢 WhatsApp' : '🔵 Messenger'}
                        </span>
                        <span className="text-xs font-black font-mono text-slate-800">{order.id}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isPending
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {order.status}
                        </span>

                        {/* Individual Card Delete Button */}
                        <button
                          onClick={() => deletePendingOrder(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Order Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 space-y-3 flex-1">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{order.customerName}</h4>
                        <p className="text-xs font-bold text-blue-700 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.customerPhone}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 flex items-start gap-1 font-sans leading-relaxed">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{order.customerAddress}</span>
                        </p>
                      </div>

                      {/* Items Table */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ordered Products:</div>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-800">
                            <span className="truncate max-w-[180px]">• {item.productName}</span>
                            <span className="font-mono text-slate-900">
                              {item.quantity} × ৳{item.unitPrice.toLocaleString()} = ৳{item.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 pt-1 flex justify-between items-center text-xs font-black text-slate-900">
                          <span>Grand Total (incl. Delivery):</span>
                          <span className="text-blue-900">৳{order.grandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {order.aiNotes && (
                        <div className="bg-amber-50/80 border border-amber-200 text-amber-900 p-2 rounded-lg text-[11px] font-medium leading-relaxed">
                          🤖 <strong>AI Note:</strong> {order.aiNotes}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedChatOrder(order)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                        <span>Chat Log</span>
                      </button>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rejectPendingOrder(order.id)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Approve & Memo</span>
                          </button>
                        </div>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => {
                            setActiveModule('invoice_print');
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print Memo</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'connect_guide' ? (
        /* Connection Guide Tab */
        <div className="space-y-6">
          {/* Top Banner Guide */}
          <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  Meta (Facebook Page & WhatsApp Business) এআই কানেকশন গাইড
                </h2>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  নিচের ওয়েবহুক ইউআরএল (Webhook URL) ও টোকেন মেটা ডেভেলপার পোর্টালে (developers.facebook.com) বসিয়ে দিলেই আপনার বিজনেস পেজ ও হোয়াটসঅ্যাপ সরাসরি এই ERP এর সাথে কানেক্ট হয়ে যাবে।
                </p>
              </div>
            </div>

            {keysSaved && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>মেটা এপিআই কী ও টোকেন সফলভাবে সেভ করা হয়েছে!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WhatsApp Business API Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                    🟢 WhatsApp Business Cloud API
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Ready to Connect
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    1. Webhook Callback URL (developers.facebook.com এ বসান):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={waWebhookUrl}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-800"
                    />
                    <button
                      onClick={() => handleCopy(waWebhookUrl, 'wa_url')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedField === 'wa_url' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    2. Webhook Verify Token:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={waVerifyToken}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-800"
                    />
                    <button
                      onClick={() => handleCopy(waVerifyToken, 'wa_token')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedField === 'wa_token' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      WhatsApp Phone Number ID:
                    </label>
                    <input
                      type="text"
                      value={waPhoneId}
                      onChange={(e) => setWaPhoneId(e.target.value)}
                      placeholder="e.g. 109823746501928"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Permanent Access Token:
                    </label>
                    <input
                      type="password"
                      value={waAccessToken}
                      onChange={(e) => setWaAccessToken(e.target.value)}
                      placeholder="EAAG... (Paste Permanent System User Token)"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Facebook Page Messenger Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-xs">
                    🔵 Facebook Page Messenger Webhook
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Ready to Connect
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    1. Messenger Webhook Callback URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fbWebhookUrl}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-800"
                    />
                    <button
                      onClick={() => handleCopy(fbWebhookUrl, 'fb_url')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedField === 'fb_url' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    2. Webhook Verify Token:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fbVerifyToken}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-800"
                    />
                    <button
                      onClick={() => handleCopy(fbVerifyToken, 'fb_token')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedField === 'fb_token' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Facebook Page Access Token:
                    </label>
                    <input
                      type="password"
                      value={fbPageToken}
                      onChange={(e) => setFbPageToken(e.target.value)}
                      placeholder="EAAX... (Paste Facebook Page Token)"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => {
                    setKeysSaved(true);
                    setTimeout(() => setKeysSaved(false), 4000);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  💾 Save Credentials & Connect
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Step by Step Bengali Instruction */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                WhatsApp Cloud API যুক্ত করার বিস্তারিত গাইড (Step-by-Step Setup Guide):
              </h3>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                ⚡ ৩ মিনিটে সেটআপ করুন
              </span>
            </div>

            {/* Step-by-Step Timeline Cards */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  ১
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    মেটা ডেভেলপার অ্যাকাউন্ট ও অ্যাপ তৈরি (Meta Developer App Creation)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ব্রাউজারে <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">developers.facebook.com</a> এ যান এবং আপনার ফেসবুক আইডিতে লগইন করুন।
                  </p>
                  <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-1">
                    <li>ডান কোণায় <strong>My Apps</strong> &gt; <strong>Create App</strong> বাটন চাপুন।</li>
                    <li>App Type অপশন থেকে <strong>Other</strong> সিলেক্ট করে Next চাপুন।</li>
                    <li>পরের পেজে <strong>Business</strong> সিলেক্ট করুন এবং App Name দিন (যেমন: <em>Hayat Haven Rice Bot</em>)।</li>
                    <li>আপনার মেটা বিজনেস অ্যাকাউন্ট থাকলে সিলেক্ট করুন এবং <strong>Create App</strong> চাপুন।</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  ২
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    WhatsApp প্রোডাক্ট সার্ভিস যোগ করা (Add WhatsApp Product)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    অ্যাপ তৈরি হওয়ার পর App Dashboard চালু হবে:
                  </p>
                  <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-1">
                    <li>নিচে নামলে <strong>Add products to your app</strong> দেখতে পাবেন।</li>
                    <li>সেখান থেকে <strong>WhatsApp</strong> এর পাশের <strong>Set up</strong> বাটনে ক্লিক করুন।</li>
                    <li>আপনার বিজনেস প্রোফাইল লিঙ্ক করতে বলবে, সিলেক্ট করে <strong>Continue</strong> চাপুন।</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="h-8 w-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                  ৩
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
                      ওয়েবহুক কনফিগারেশন (Webhook Setup - ERP Connector)
                    </h4>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      সবচেয়ে গুরুত্বপূর্ণ ধাপ
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    বামপাশের মেনু থেকে <strong>WhatsApp</strong> &gt; <strong>Configuration</strong> এ যান:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-2 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-bold">Callback URL:</span>
                      <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]">
                        <span className="truncate max-w-[280px]">{waWebhookUrl}</span>
                        <button onClick={() => handleCopy(waWebhookUrl, 'wa_url_guide')} className="text-blue-600 text-[10px] font-sans font-bold hover:underline cursor-pointer shrink-0">Copy</button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans font-bold">Verify Token:</span>
                      <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]">
                        <span>{waVerifyToken}</span>
                        <button onClick={() => handleCopy(waVerifyToken, 'wa_token_guide')} className="text-blue-600 text-[10px] font-sans font-bold hover:underline cursor-pointer">Copy</button>
                      </div>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-1">
                    <li><strong>Edit Webhook</strong> চাপুন এবং ওপরের Callback URL ও Verify Token বসিয়ে <strong>Verify and Save</strong> এ ক্লিক করুন।</li>
                    <li>এরপর <strong>Webhook Fields</strong> এর পাশে <strong>Manage</strong> বাটনে চাপুন।</li>
                    <li><code>messages</code> ফিল্ডটির পাশে <strong>Subscribe</strong> টিক চিহ্ন দিন।</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  ৪
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    ফোন নাম্বার আইডি সংগ্রহ ও নিজের নাম্বার যোগ (Phone ID & Business Number)
                  </h4>
                  <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-1">
                    <li>বাম মেনুর <strong>WhatsApp</strong> &gt; <strong>API Setup</strong> এ যান।</li>
                    <li>সেখানে <strong>Phone Number ID</strong> দেখতে পাবেন (যেমন: <code>109823746501928</code>)। এটি কপি করে ওপরের ঘরে বসান।</li>
                    <li>লাইভ বিজনেসের জন্য: নিচে <strong>Add Phone Number</strong> বাটনে ক্লিক করে আপনার হোয়াটসঅ্যাপ নাম্বার যোগ করে SMS OTP দিয়ে ভেরিফাই করুন।</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  ৫
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    স্থায়ী অ্যাক্সেস টোকেন নেওয়া (Permanent Access Token Generation)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    অস্থায়ী টোকেন ২৪ ঘন্টায় মেয়াদ শেষ হয়ে যায়, তাই স্থায়ী টোকেন তৈরি করুন:
                  </p>
                  <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-1">
                    <li><a href="https://business.facebook.com/settings" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">business.facebook.com/settings</a> এ যান।</li>
                    <li>Users &gt; <strong>System Users</strong> এ গিয়ে Add বাটনে চেপে Admin রোলে ইউজার ক্রিয়েট করুন।</li>
                    <li><strong>Add Assets</strong> এ চাপ দিয়ে তৈরি করা App টি অ্যাসাইন করুন।</li>
                    <li><strong>Generate New Token</strong> চাপুন এবং <code>whatsapp_business_messaging</code> টিক দিয়ে টোকেন কপি করে ওপরের স্থায়ী টোকেনের ঘরে বসিয়ে <strong>Save Credentials</strong> এ ক্লিক করুন!</li>
                  </ul>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                <div className="h-8 w-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                  ৬
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    ✅ অটো-মেসেজ টেস্ট করুন! (Live Testing)
                  </h4>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    সব সেটআপ শেষ! এখন আপনার হোয়াটসঅ্যাপ নাম্বারে অন্য যেকোন ফোন থেকে মেসেজ পাঠান (যেমন: <em>"নাজিরশাইল চালের ৫০ কেজি বস্তার দাম কত?"</em>)। এআই বট সঙ্গে সঙ্গে কাস্টমারকে উত্তর দিবে এবং ঠিকানা ও ফোন নাম্বার সংগ্রহ করে এই ERP এর <strong>Pending Orders Queue</strong> তে অটো সেভ করে দেবে!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BOT SETTINGS & PRODUCT KNOWLEDGE TAB CONTENT */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Header & Status Notification */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    🤖 বটের মেসেজ ও প্রোডাক্ট প্রম্পট কনফিগারেশন (AI Bot Prompt & Custom Knowledge)
                  </h2>
                  <p className="text-xs text-slate-600">
                    এখান থেকে আপনি বটের প্রথম স্বাগতম বার্তা (Welcome SMS) এবং বটকে প্রোডাক্টের বিবরণ, কাস্টমাইজেশনের নিয়ম ও দাম শেখাতে পারবেন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {botSavedNotification && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl animate-bounce flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    বটের মেসেজ ও কাস্টম প্রম্পট সেভ হয়েছে!
                  </span>
                )}
                <button
                  onClick={handleSaveBotSettings}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>সেটিং সেভ করুন (Save Bot Settings)</span>
                </button>
              </div>
            </div>

            {/* Form Section 1: Welcome Message */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                ১. বটের প্রথম সালাম ও স্বাগতম বার্তা (Bot Welcome / Greeting Message)
              </label>
              <p className="text-[11px] text-slate-600">
                কাস্টমার হোয়াটসঅ্যাপ বা ফেসবুকে প্রথম মেসেজ পাঠানোর সাথে সাথে বট এই উত্তরটি পাঠাবে।
              </p>
              <textarea
                rows={3}
                value={botWelcomeMsg}
                onChange={(e) => setBotWelcomeMsg(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-hidden bg-white text-slate-900 leading-relaxed"
                placeholder="আসসালামু আলাইকুম! Hayat Haven এ স্বাগতম..."
              />
            </div>

            {/* Form Section 2: Product Knowledge & AI Prompt Instructions */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  ২. বটকে প্রোডাক্ট ও কাস্টমাইজেশন শেখানোর টেক্সট (Product Knowledge Base & AI Instructions)
                </label>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                  Gemini AI Prompt Context
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                এখানে আপনার শপের প্রোডাক্টের বিবরণ, লেজার এনগ্রেভিং / ছবি প্রিন্ট সুবিধা, ক্যাটাগরি, প্রোডাক্ট মূল্য ও অর্ডার নেওয়ার নিয়মাবলী বাংলায় বা ইংরেজিতে সুন্দর করে লিখে দিন। বট কাস্টমারের প্রশ্নের উত্তর দেওয়ার সময় এখান থেকে সঠিক তথ্য নিয়ে সরাসরি রিপ্লাই দেবে।
              </p>
              <textarea
                rows={8}
                value={botProductKnowledge}
                onChange={(e) => setBotProductKnowledge(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono font-medium focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-hidden bg-white text-slate-900 leading-relaxed"
                placeholder="• শপের নাম: Hayat Haven&#10;• প্রোডাক্ট ১: কাস্টমাইজড লেদার ওয়ালেট (৳১,৪৫০)..."
              />
            </div>

            {/* Form Section 3: Delivery Charge & Advance Rules */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                ৩. ডেলিভারি চার্জ ও পেমেন্ট রুলস (Delivery Charge & Payment Instructions)
              </label>
              <p className="text-[11px] text-slate-600">
                ডেলিভারি চার্জ বা এডভান্স পেমেন্ট সম্পর্কিত প্রশ্নের উত্তরে বট যে তথ্যটি ব্যবহার করবে।
              </p>
              <textarea
                rows={2}
                value={botDeliveryInfo}
                onChange={(e) => setBotDeliveryInfo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-hidden bg-white text-slate-900"
                placeholder="ঢাকার ভেতরে ১০০ টাকা, ঢাকার বাইরে ১৫০ টাকা..."
              />
            </div>

            {/* Quick Templates Helper */}
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-purple-950 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                রেডিমেড টেমপ্লেট লোড করুন (Quick Knowledge Presets)
              </h3>
              <p className="text-[11px] text-purple-900">
                নিচের যেকোনো টেমপ্লেটে ক্লিক করলে প্রোডাক্ট জ্ঞান ঘরে অটোমেটিক টেক্সট বসে যাবে:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setBotProductKnowledge(
                      `• শপের নাম: Hayat Haven (হায়াত হেভেন)
• প্রধান প্রোডাক্টসমূহ:
  ১. কাস্টমাইজড ওয়ালেট কম্বো (৳১,৪৫০) - নাম খোদাই সহ প্রিমিয়াম ওয়ালেট ও কি-রিং।
  ২. এক্রিলিক ৩ডি ফটো নাইট ল্যাম্প (৳১,২৫০) - উডেন নিওন স্ট্যান্ডে নিজস্ব ছবি।
  ৩. কালার চেঞ্জিং ম্যাজিক মগ (৳৫৫০) - গরম পানিতে ছবি ভেসে উঠবে।
  ৪. কাস্টমাইজড কাঠের ফটো প্লাক (৳৯৫০) - কাঠের ওপর খোদাই করা ছবি।
• নাম/ছবি কাস্টমাইজেশন সম্পূর্ণ ফ্রি!
• অর্ডার করতে নাম, ফোন, মোবাইল ও টেক্সট পাঠান।`
                    );
                  }}
                  className="px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  🎁 Gift Shop Template
                </button>

                <button
                  onClick={() => {
                    setBotProductKnowledge(
                      `• শপের নাম: Hayat Haven Online Fashion
• প্রোডাক্টস:
  ১. প্রিমিয়াম কটন শার্ট (৳৯৫০) - সাইজ M, L, XL
  ২. ক্যাজুয়াল ডেনিম প্যান্ট (৳১,২০০) - সাইজ ৩০, ৩২, ৩৪, ৩৬
  ৩. এক্সক্লুসিভ জ্যাকেট (৳২,৫০০) - প্রিমিয়াম কোয়ালিটি
• ডেলিভারি সময়: ঢাকার ভেতরে ২৪ ঘন্টা, ঢাকার বাইরে ৪৮ ঘন্টা।`
                    );
                  }}
                  className="px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  👕 Clothing & Fashion Template
                </button>

                <button
                  onClick={() => {
                    setBotProductKnowledge(
                      `• শপের নাম: Hayat Haven Gadgets
• প্রধান গ্যাজেটস:
  ১. ওয়্যারলেস এয়ারপডস ব্লুটুথ (৳১,৮৫০)
  ২. স্মার্ট ওয়াচ আমোলেড ডিসপ্লে (৳২,৪৫০)
  ৩. ১০,০০০mAh পাওয়ার ব্যাংক (৳১,২০০)
• ওয়ারেন্টি: ৬ মাসের ব্র্যান্ড রিপ্লেসমেন্ট ওয়ারেন্টি।`
                    );
                  }}
                  className="px-3 py-1.5 bg-white border border-purple-300 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  🎧 Electronics & Gadgets Template
                </button>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                💡 সেভ করার পর চ্যাট সিমুলেটরে মেসেজ পাঠিয়ে নতুন বটের উত্তর পরীক্ষা করুন।
              </span>
              <button
                onClick={handleSaveBotSettings}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>বটের তথ্য সেভ করুন (Save Bot Rules)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Transcript Modal */}
      {selectedChatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold">Chat Log ({selectedChatOrder.id})</h3>
              </div>
              <button
                onClick={() => setSelectedChatOrder(null)}
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1">
              <p><strong>Customer:</strong> {selectedChatOrder.customerName} ({selectedChatOrder.customerPhone})</p>
              <p><strong>Channel:</strong> {selectedChatOrder.channel}</p>
              <p><strong>Address:</strong> {selectedChatOrder.customerAddress}</p>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-slate-100 custom-scrollbar text-xs">
              {selectedChatOrder.chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      m.sender === 'bot' ? 'bg-white text-slate-800 border border-slate-200' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-[10px] opacity-75 font-bold mb-0.5">{m.sender === 'bot' ? '🤖 AI Bot' : '👤 Customer'} ({m.time})</p>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedChatOrder(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
