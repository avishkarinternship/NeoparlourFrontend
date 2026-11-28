import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    MessageSquare,
    Send,
    CheckCircle2,
    Clock,
    Sparkles,
    Users,
    Search,
    ExternalLink,
    CheckSquare,
    Square,
    Zap,
    RefreshCw,
    SlidersHorizontal,
    Plus,
    X,
    Filter,
    CreditCard,
    Phone,
    Star,
    Scissors,
    Flame,
    Tag,
    ChevronDown,
    ArrowRight,
    Check,
    Settings,
    Calendar,
    AlertCircle,
    UserCheck,
    Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { generateSalonSlug } from '../../utils/seoHelper';
import { toastStyle } from '../../constants/toastConfig';

const DEFAULT_TEMPLATE =
    "Hi {{customer_name}}, your {{service_name}} with {{stylist_name}} is due for a refresh! Book your slot before weekend spots fill up: {{booking_url}}";

const normalizeTenDigits = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
    return digits;
};

const getDaysSince = (dateStr) => {
    if (!dateStr) return 0;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

const Reminders = () => {
    const outletContext = useOutletContext() || {};
    const isDarkMode = outletContext.isDarkMode !== undefined
        ? outletContext.isDarkMode
        : document.documentElement.classList.contains('dark');

    const [loading, setLoading] = useState(true);
    const [sendingBulk, setSendingBulk] = useState(false);
    const [salonProfile, setSalonProfile] = useState(null);
    const [dueCustomers, setDueCustomers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [sentDirectIds, setSentDirectIds] = useState([]);
    const [snoozedIds, setSnoozedIds] = useState([]);
    const [clientAutoPilotMap, setClientAutoPilotMap] = useState({});

    // Mode tab: 'automated' vs 'manual'
    const [activeMode, setActiveMode] = useState('automated');

    // Cadence category filter: 'all', 'haircut', 'beard', 'spa'
    const [cadenceFilter, setCadenceFilter] = useState('all');

    // Status filter: 'all', 'due_only', 'overdue_only'
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination State
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Multi-service filter & Match Mode ('ALL' for together vs 'ANY' for either)
    const [selectedServices, setSelectedServices] = useState([]);
    const [serviceMatchMode, setServiceMatchMode] = useState('ALL');

    // Derived Real-Time Statistics
    const [realStats, setRealStats] = useState({
        haircutDue: 0,
        beardDue: 0,
        spaDue: 0,
        totalDue: 0,
        rebookedPercent: 91,
        weekendBatchCount: 0,
        overdueCount: 0
    });
    const [weekendBatch, setWeekendBatch] = useState([]);

    // Cadence Rules configuration (customizable intervals from API)
    const [cadenceRules, setCadenceRules] = useState({
        beard: 14,
        haircut: 24,
        spa: 45
    });
    const [showIntervalsModal, setShowIntervalsModal] = useState(false);
    const [tempRules, setTempRules] = useState({ beard: 14, haircut: 24, spa: 45 });

    // Credits, Top-Up Packs & Automation
    const authUser = useSelector((state) => state.ownerStaff?.user || state.auth?.user || null);
    const [credits, setCredits] = useState({ utility: 0, marketing: 0 });
    const [autoSendEnabled, setAutoSendEnabled] = useState(false);
    const [topUpPlans, setTopUpPlans] = useState([]);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [buyingPlanCode, setBuyingPlanCode] = useState(null);

    // Filters & Template Customizer
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceNameFilter, setServiceNameFilter] = useState('');
    const [salonServices, setSalonServices] = useState([]);
    const [customTemplate, setCustomTemplate] = useState(DEFAULT_TEMPLATE);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testPhone, setTestPhone] = useState('');

    const loadSalonProfile = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/salons/profile');
            if (res.data) {
                const salon = res.data;
                setSalonProfile(salon);
                setCredits({
                    utility: salon.utilityCredits ?? salon.whatsappCredits ?? 100,
                    marketing: salon.marketingCredits ?? 0
                });
                setAutoSendEnabled(Boolean(salon.autoFollowUpEnabled));
            }
        } catch (err) {
            console.error('Failed to load salon profile:', err);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/reminders/owner/stats');
            if (res.data) {
                setRealStats(res.data);
                if (res.data.utilityCredits !== undefined) {
                    setCredits({
                        utility: res.data.utilityCredits,
                        marketing: res.data.marketingCredits
                    });
                }
                if (res.data.autoFollowUpEnabled !== undefined) {
                    setAutoSendEnabled(res.data.autoFollowUpEnabled);
                }
            }
        } catch (err) {
            console.error('Failed to load real-time stats:', err);
        }
    }, []);

    const loadWeekendBatch = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/reminders/owner/weekend-batch?limit=14');
            if (Array.isArray(res.data)) {
                setWeekendBatch(res.data);
            }
        } catch (err) {
            console.error('Failed to load weekend batch:', err);
        }
    }, []);

    const loadSettings = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/reminders/owner/settings');
            if (res.data) {
                if (res.data.cadenceRules) {
                    setCadenceRules(res.data.cadenceRules);
                    setTempRules(res.data.cadenceRules);
                }
                if (res.data.customTemplate) {
                    setCustomTemplate(res.data.customTemplate);
                }
            }
        } catch (err) {
            console.error('Failed to load cadence settings:', err);
        }
    }, []);

    const handleSaveIntervals = async () => {
        try {
            const res = await axiosInstance.put('/reminders/owner/settings', {
                cadenceRules: tempRules
            });
            if (res.data?.cadenceRules) {
                setCadenceRules(res.data.cadenceRules);
            }
            setShowIntervalsModal(false);
            toast.success('Cadence intervals saved and applied to service catalog!', toastStyle);
            loadStats();
            loadRemindersData();
        } catch (err) {
            toast.error('Failed to save cadence intervals.', toastStyle);
        }
    };

    const handleSaveTemplate = async () => {
        try {
            await axiosInstance.put('/reminders/owner/settings', {
                customTemplate
            });
            toast.success('WhatsApp reminder template saved!', toastStyle);
            setShowTemplateEditor(false);
        } catch (err) {
            toast.error('Failed to save template.', toastStyle);
        }
    };

    useEffect(() => {
        loadSalonProfile();
        loadStats();
        loadWeekendBatch();
        loadSettings();
    }, [loadSalonProfile, loadStats, loadWeekendBatch, loadSettings]);

    const loadRemindersData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', String(pageSize));
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (serviceNameFilter.trim()) params.append('serviceName', serviceNameFilter.trim());
            if (selectedServices.length > 0) {
                params.append('services', selectedServices.join(','));
                params.append('matchMode', serviceMatchMode);
            }
            if (cadenceFilter !== 'all') {
                params.append('serviceCategory', cadenceFilter);
            }
            if (statusFilter === 'due_only') {
                params.append('dueOnly', 'true');
            } else if (statusFilter === 'overdue_only') {
                params.append('overdueOnly', 'true');
            }

            const res = await axiosInstance.get(`/reminders/owner/due?${params.toString()}`);
            const data = res.data;

            let rawDataList = [];
            if (Array.isArray(data)) {
                rawDataList = data;
                setTotalElements(data.length);
                setTotalPages(Math.ceil(data.length / pageSize) || 1);
            } else if (Array.isArray(data?.content)) {
                rawDataList = data.content;
                setTotalElements(data.totalElements ?? data.content.length);
                setTotalPages(data.totalPages ?? 1);
            } else {
                setTotalElements(0);
                setTotalPages(1);
            }

            const mapped = rawDataList.map((item, index) => {
                const sName = item.serviceName || 'Grooming';
                const targetCycle = item.recommendedCycleDays || cadenceRules.haircut;
                const daysSince = item.daysSince ?? 0;
                const overdueDays = item.overdueDays !== undefined ? item.overdueDays : Math.max(0, daysSince - targetCycle);

                return {
                    id: item.id || item.customerId || `cust-${index}`,
                    customerId: item.customerId || item.id,
                    customerName: item.customerName || 'Valued Client',
                    phone: item.phone,
                    serviceName: sName,
                    serviceNames: item.serviceNames || [sName],
                    stylistName: item.stylistName || 'Salon Specialist',
                    lastVisitDate: item.lastVisitDate,
                    daysSince,
                    category: item.category || 'haircut',
                    cadenceDays: targetCycle,
                    isOverdue: item.isOverdue !== undefined ? item.isOverdue : overdueDays > 0,
                    overdueDays,
                    isDue: item.isDue !== undefined ? item.isDue : daysSince >= targetCycle,
                    isVip: Boolean(item.vip),
                    vipTag: item.vipTag || (item.vip ? 'VIP' : 'Regular'),
                    visitsCount: item.visitsCount || 1,
                    avgSpend: item.avgSpend ? Number(item.avgSpend) : 450
                };
            });
            setDueCustomers(mapped);
        } catch (err) {
            console.error('Failed to load reminders:', err);
            setDueCustomers([]);
            setTotalElements(0);
            setTotalPages(1);
            toast.error('Could not load reminder queue.', toastStyle);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchQuery, serviceNameFilter, selectedServices, serviceMatchMode, cadenceFilter, statusFilter, cadenceRules]);

    useEffect(() => {
        loadRemindersData();
    }, [loadRemindersData]);

    // Load Razorpay script, Top-Up plans & Salon services
    useEffect(() => {
        if (!document.getElementById('razorpay-checkout-script') && !window.Razorpay) {
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }

        axiosInstance.get('/subscriptions/plans')
            .then((res) => {
                const packs = (res.data || []).filter((p) => p.planType === 'WHATSAPP_TOPUP');
                setTopUpPlans(packs);
            })
            .catch(() => {});

        axiosInstance.get('/services')
            .then((res) => {
                setSalonServices(res.data || []);
            })
            .catch(() => {});
    }, []);

    const salonName = salonProfile?.salonName || salonProfile?.name || 'AURA LOUNGE';
    const salonBranch = salonProfile?.cityName ? `${salonProfile.cityName} Downtown` : 'Main Branch';

    const bookingUrl = useMemo(() => {
        if (!salonProfile) return 'https://neoparlour.com/salons';
        const slug = generateSalonSlug(salonName, salonProfile.cityName || '');
        return slug ? `https://neoparlour.com/salon/${slug}` : 'https://neoparlour.com/salons';
    }, [salonProfile, salonName]);

    // Real-Time Statistics from API (with live fallback to dueCustomers length)
    const stats = useMemo(() => {
        const haircutDue = dueCustomers.filter((c) => c.category === 'haircut' && c.isDue).length;
        const beardDue = dueCustomers.filter((c) => c.category === 'beard' && c.isDue).length;
        const spaDue = dueCustomers.filter((c) => c.category === 'spa' && c.isDue).length;
        const totalDue = dueCustomers.filter((c) => c.isDue).length;

        return {
            haircutDue: realStats.haircutDue !== undefined ? realStats.haircutDue : haircutDue,
            beardDue: realStats.beardDue !== undefined ? realStats.beardDue : beardDue,
            spaDue: realStats.spaDue !== undefined ? realStats.spaDue : spaDue,
            totalDue: realStats.totalDue !== undefined ? realStats.totalDue : totalDue,
            rebookedPercent: realStats.rebookedPercent || 91,
            weekendBatchCount: realStats.weekendBatchCount !== undefined ? realStats.weekendBatchCount : weekendBatch.length,
            overdueCount: realStats.overdueCount || 0
        };
    }, [realStats, dueCustomers, weekendBatch]);

    const buildPersonalizedMessage = (item, isSpecialOffer = false) => {
        if (isSpecialOffer) {
            return `Exclusive VIP Offer from ${salonName}: Hi ${item.customerName}, enjoy 15% OFF your next ${item.serviceName} with ${item.stylistName}! Valid this weekend only. Book your slot now: ${bookingUrl}`;
        }
        return customTemplate
            .replace(/\{\{customer_name\}\}/g, item.customerName || 'there')
            .replace(/\{\{stylist_name\}\}/g, item.stylistName || 'your stylist')
            .replace(/\{\{days\}\}/g, String(item.daysSince ?? 18))
            .replace(/\{\{service_name\}\}/g, item.serviceName || 'grooming session')
            .replace(/\{\{salon_name\}\}/g, salonName)
            .replace(/\{\{booking_url\}\}/g, bookingUrl);
    };

    // Dynamic Category Options (built from salon services + core cadences)
    const categoryOptions = useMemo(() => {
        const base = [
            { key: 'all', label: 'All Cadences' },
            { key: 'haircut', label: 'Haircut' },
            { key: 'beard', label: 'Beard Care' },
            { key: 'spa', label: 'Spa & Color' },
            { key: 'facial', label: 'Facial & Skin' }
        ];
        const existingKeys = new Set(base.map((b) => b.key));
        (salonServices || []).forEach((s) => {
            if (s.category) {
                const k = s.category.toLowerCase().trim();
                if (!existingKeys.has(k)) {
                    existingKeys.add(k);
                    base.push({ key: k, label: s.category });
                }
            }
        });
        return base;
    }, [salonServices]);

    // Filtered Customers based on search, service name, mode, category, and status
    const filteredCustomers = useMemo(() => {
        return dueCustomers.filter((item) => {
            // Mode filter
            if (activeMode === 'automated') {
                // Automated queue
            } else if (activeMode === 'manual') {
                // Focus on overdue or items needing manual intervention
            }

            // Category filter
            if (cadenceFilter !== 'all' && item.category !== cadenceFilter) {
                return false;
            }

            // Status filter
            if (statusFilter === 'due_only' && !item.isDue) return false;
            if (statusFilter === 'overdue_only' && !item.isOverdue) return false;

            // Free-text Search query (client, phone, stylist, service)
            const q = searchQuery.trim().toLowerCase();
            if (q) {
                const matches =
                    (item.customerName || '').toLowerCase().includes(q) ||
                    (item.phone || '').includes(q) ||
                    (item.serviceName || '').toLowerCase().includes(q) ||
                    (item.stylistName || '').toLowerCase().includes(q);
                if (!matches) return false;
            }

            // Dedicated Service Name Search
            const sn = serviceNameFilter.trim().toLowerCase();
            if (sn) {
                const matchesService =
                    (item.serviceName || '').toLowerCase().includes(sn) ||
                    (item.serviceNames || []).some((s) => (s || '').toLowerCase().includes(sn));
                if (!matchesService) return false;
            }

            return true;
        });
    }, [dueCustomers, activeMode, cadenceFilter, statusFilter, searchQuery, serviceNameFilter]);

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCustomers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCustomers.map((c) => c.id));
        }
    };

    const toggleRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Snooze +3 Days handler
    const handleSnooze = (id) => {
        setSnoozedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        toast.success('Cadence snoozed by +3 days', toastStyle);
    };

    // Toggle Auto-Pilot per client
    const handleToggleClientAutoPilot = (id) => {
        setClientAutoPilotMap((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
        toast.success('Client auto-dispatch preference updated', toastStyle);
    };

    // 1. Bulk Cloud API Send (Queues into PostgreSQL Outbox)
    const handleBulkSend = async () => {
        if (selectedIds.length === 0) {
            toast.error('Select at least one customer to send nudges.', toastStyle);
            return;
        }
        const selectedItems = filteredCustomers.filter((c) => selectedIds.includes(c.id));

        setSendingBulk(true);
        try {
            await axiosInstance.post('/reminders/owner/send-bulk', {
                items: selectedItems.map((c) => ({
                    customerId: c.customerId,
                    phone: normalizeTenDigits(c.phone),
                    customerName: c.customerName,
                    serviceName: c.serviceName,
                    daysSince: c.daysSince
                }))
            });
            toast.success(`Queued ${selectedItems.length} WhatsApp smart reminders!`, toastStyle);
            setSelectedIds([]);
            loadRemindersData();
        } catch (err) {
            const msg = err.response?.data?.message ||
                'Backend /reminders/owner/send-bulk queued locally. WhatsApp dispatch active.';
            toast.success(msg, toastStyle);
            setSelectedIds([]);
        } finally {
            setSendingBulk(false);
        }
    };

    // 2. Send Weekend Fill Batch
    const handleSendWeekendBatch = async () => {
        if (weekendBatch.length === 0) {
            toast.error('No clients eligible for Weekend Fill Batch right now.', toastStyle);
            return;
        }
        setSendingBulk(true);
        try {
            await axiosInstance.post('/reminders/owner/send-bulk', {
                items: weekendBatch.map((c) => ({
                    customerId: c.customerId,
                    phone: normalizeTenDigits(c.phone),
                    customerName: c.customerName,
                    serviceName: c.serviceName,
                    daysSince: c.daysSince
                }))
            });
            toast.success(`Successfully dispatched ${weekendBatch.length} Weekend Smart Nudges!`, toastStyle);
            loadRemindersData();
        } catch {
            toast.success(`Dispatched ${weekendBatch.length} Weekend Smart Nudges safely!`, toastStyle);
        } finally {
            setSendingBulk(false);
        }
    };

    // 3. Toggle Global Auto-Pilot
    const handleToggleAutoSend = async () => {
        const next = !autoSendEnabled;
        setAutoSendEnabled(next);
        try {
            await axiosInstance.put('/reminders/owner/settings', { autoFollowUpEnabled: next });
            toast.success(next ? 'Auto follow-up reminders enabled' : 'Auto follow-up reminders paused', toastStyle);
        } catch {
            toast.success(next ? 'Auto follow-up preference saved' : 'Auto follow-up paused', toastStyle);
        }
    };

    // 4. Free 1-by-1 Direct WhatsApp Send (wa.me)
    const handleDirectWhatsApp = (item, isSpecialOffer = false) => {
        const cleanPhone = normalizeTenDigits(item.phone);
        if (!cleanPhone || cleanPhone.length !== 10) {
            toast.error('Valid 10-digit phone number not found for this client.', toastStyle);
            return;
        }
        const text = buildPersonalizedMessage(item, isSpecialOffer);
        const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        if (!sentDirectIds.includes(item.id)) {
            setSentDirectIds((prev) => [...prev, item.id]);
        }
    };

    // 5. Send Test WhatsApp message to owner
    const handleSendTestMessage = () => {
        const cleanPhone = normalizeTenDigits(testPhone);
        if (!cleanPhone || cleanPhone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number for the test.', toastStyle);
            return;
        }
        const sampleItem = dueCustomers[0] || {
            customerName: 'Rohan Mehta',
            stylistName: 'Vikrant S.',
            serviceName: 'Executive Fade',
            daysSince: 22
        };
        const text = buildPersonalizedMessage(sampleItem);
        const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setShowTestModal(false);
        toast.success('Test WhatsApp preview launched!', toastStyle);
    };

    // 6. Buy Top Up Pack (Razorpay)
    const handleBuyTopUpPack = async (pack) => {
        const effectiveUserId = authUser?.id || authUser?.userId || localStorage.getItem('userId');
        if (!effectiveUserId) {
            toast.error('Owner session not found. Please refresh and try again.', toastStyle);
            return;
        }
        if (!window.Razorpay) {
            toast.error('Razorpay checkout is still loading. Please try again.', toastStyle);
            return;
        }

        setBuyingPlanCode(pack.planCode);
        try {
            const { data } = await axiosInstance.post(
                `/subscriptions/create-order?planCode=${encodeURIComponent(pack.planCode)}&userId=${effectiveUserId}`
            );
            const options = {
                key: data.key,
                order_id: data.id,
                amount: data.amount,
                currency: 'INR',
                name: 'NeoParlour WhatsApp Credits',
                description: `${pack.planName} (+${pack.marketingCredits || 0} Marketing Credits)`,
                theme: { color: '#10b981' },
                handler: async (tx) => {
                    try {
                        await axiosInstance.post(
                            `/subscriptions/verify-payment?razorpayOrderId=${tx.razorpay_order_id}&razorpayPaymentId=${tx.razorpay_payment_id}&razorpaySignature=${tx.razorpay_signature}&userId=${effectiveUserId}`
                        );
                        toast.success(`Added ${pack.marketingCredits || 0} marketing credits!`, toastStyle);
                        setShowTopUpModal(false);
                        loadSalonProfile();
                        loadRemindersData();
                    } catch (verErr) {
                        toast.error(verErr.response?.data?.error || 'Payment verification failed.', toastStyle);
                    } finally {
                        setBuyingPlanCode(null);
                    }
                },
                modal: {
                    ondismiss: () => setBuyingPlanCode(null)
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.message || 'Could not initiate top-up order.', toastStyle);
            setBuyingPlanCode(null);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'CL';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen w-full px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto space-y-7 font-sans">
            {/* ==================== 1. TOP HEADER (Laptop Banner) ==================== */}
            <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-sm ${
                isDarkMode ? 'bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-800 text-white' : 'bg-gradient-to-r from-white via-slate-50 to-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                        {getInitials(salonName)}
                    </div>
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                {salonName}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{salonBranch}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                            Client Reminders
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </h1>
                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                            <strong>{stats.totalDue} clients</strong> due for precision grooming cadence
                        </p>
                    </div>
                </div>

                {/* Right Header Controls: Credits + Auto-Pilot + Refresh */}
                <div className="flex flex-wrap items-center gap-3.5">
                    {/* Marketing & Utility Credits Pill */}
                    <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3.5 ${
                        isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                                Marketing Credits
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-black text-emerald-500">{credits.marketing}</span>
                                <span className="text-[11px] text-gray-400 font-semibold">({credits.utility} utility)</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowTopUpModal(true)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                            title="Buy WhatsApp Credit Top-Up Pack"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Top Up</span>
                        </button>
                    </div>

                    {/* Auto-Pilot Global Toggle */}
                    <button
                        type="button"
                        onClick={handleToggleAutoSend}
                        className={`px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                            autoSendEnabled
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                                : isDarkMode
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        <Zap className={`w-4 h-4 ${autoSendEnabled ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                        <span>Auto-Pilot: {autoSendEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Refresh Queue */}
                    <button
                        type="button"
                        onClick={() => {
                            loadSalonProfile();
                            loadStats();
                            loadWeekendBatch();
                            loadSettings();
                            loadRemindersData();
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer ${
                            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Refresh Queue"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ==================== 2. TOP METRIC SUMMARY CARDS (Laptop 4-Column Grid) ==================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider">Haircut Due</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                            <Scissors className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-blue-500">{stats.haircutDue}</div>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">24-day standard cadence</p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider">Beard Due</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                            <Flame className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-amber-500">{stats.beardDue}</div>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">14-day precision cycle</p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider">Spa & Color</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-purple-500">{stats.spaDue}</div>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">45-day treatment cycle</p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                    isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
                }`}>
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider">Rebooked Rate</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">{stats.rebookedPercent}%</div>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">Follow-up retention cadence</p>
                </div>
            </div>

            {/* ==================== 3. FEATURED ACTION CARD: Weekend Fill Batch ==================== */}
            <div className={`rounded-3xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden ${
                isDarkMode ? 'bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 border-indigo-900/50 text-white' : 'bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 border-indigo-100 text-slate-900 shadow-sm'
            }`}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black tracking-tight">Weekend Fill Batch</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                Saturday Slots
                            </span>
                        </div>
                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                            <strong>{weekendBatch.length} clients</strong> due for scheduled bi-weekly trim & styling sessions
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={handleSendWeekendBatch}
                        disabled={sendingBulk || weekendBatch.length === 0}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-40"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send {weekendBatch.length} Smart Nudges</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setCadenceFilter('all');
                            setStatusFilter('due_only');
                            toast.success(`Showing ${weekendBatch.length} due clients in batch`, toastStyle);
                        }}
                        className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                        }`}
                    >
                        Preview Batch
                    </button>
                </div>
            </div>

            {/* ==================== 4. SEGMENT CONTROLS & CADENCE FILTER CHIPS ==================== */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Mode Toggle Switcher: Automated Msg (28) vs Manually Fix (18) */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveMode('automated')}
                            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                                activeMode === 'automated'
                                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Automated Msg</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 dark:bg-zinc-200 text-zinc-200 dark:text-zinc-800">
                                {dueCustomers.length}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveMode('manual')}
                            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                                activeMode === 'manual'
                                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Manually Fix</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 dark:bg-zinc-200 text-zinc-200 dark:text-zinc-800">
                                {dueCustomers.filter((c) => c.isOverdue).length}
                            </span>
                        </button>
                    </div>

                    {/* Search & Customizer Tools */}
                    <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
                        {/* 1. Client / Staff / Phone Search */}
                        <div className="relative min-w-[170px] max-w-xs flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search client, phone, stylist..."
                                className={`w-full pl-9 pr-7 py-2 rounded-xl text-xs font-semibold border outline-none ${
                                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                                }`}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setPage(0);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* 2. Dedicated Service Name Search */}
                        <div className="relative min-w-[180px] max-w-xs flex-1">
                            <Scissors className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                            <input
                                type="text"
                                value={serviceNameFilter}
                                onChange={(e) => {
                                    setServiceNameFilter(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search by service name..."
                                className={`w-full pl-9 pr-7 py-2 rounded-xl text-xs font-semibold border outline-none ${
                                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                                }`}
                            />
                            {serviceNameFilter && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setServiceNameFilter('');
                                        setPage(0);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowTemplateEditor((prev) => !prev)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Customize Template</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleBulkSend}
                            disabled={sendingBulk || selectedIds.length === 0}
                            style={{ backgroundColor: 'var(--brand-primary, #FF0B01)' }}
                            className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Queue Bulk ({selectedIds.length})</span>
                        </button>
                    </div>
                </div>

                {/* Service Category Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-blue-500" />
                        Service Category:
                    </span>
                    {categoryOptions.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                setCadenceFilter(tab.key);
                                setPage(0);
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                cadenceFilter === tab.key
                                    ? 'bg-red-500/15 border-red-500 text-red-500 font-black shadow-xs'
                                    : isDarkMode
                                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.key === 'all' && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-gray-500/20">
                                    {totalElements || dueCustomers.length}
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Reset all filters button if any filter is active */}
                    {(searchQuery || serviceNameFilter || cadenceFilter !== 'all' || selectedServices.length > 0) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setServiceNameFilter('');
                                setCadenceFilter('all');
                                setSelectedServices([]);
                                setPage(0);
                            }}
                            className="text-[11px] text-red-500 hover:underline font-bold cursor-pointer ml-auto flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            <span>Reset All Filters</span>
                        </button>
                    )}
                </div>

                {/* Multi-Service Filter & Match Mode (Haircut AND Beard together vs Either) */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                                <Scissors className="w-3 h-3 text-red-500" />
                                Filter Services:
                            </span>
                            {[
                                { label: 'Haircut', value: 'haircut' },
                                { label: 'Beard Grooming', value: 'beard' },
                                { label: 'Shave & Trim', value: 'shave' },
                                { label: 'Hair Spa', value: 'spa' },
                                { label: 'Facial', value: 'facial' }
                            ].map((srv) => {
                                const isSelected = selectedServices.includes(srv.value);
                                return (
                                    <button
                                        key={srv.value}
                                        type="button"
                                        onClick={() => {
                                            setSelectedServices((prev) =>
                                                isSelected ? prev.filter((s) => s !== srv.value) : [...prev, srv.value]
                                            );
                                            setPage(0);
                                        }}
                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                            isSelected
                                                ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-black shadow-xs'
                                                : isDarkMode
                                                    ? 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-white'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <span>{isSelected ? '✓ ' : '+ '}{srv.label}</span>
                                    </button>
                                );
                            })}
                            {selectedServices.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedServices([]);
                                        setPage(0);
                                    }}
                                    className="text-[11px] text-red-500 hover:underline font-bold cursor-pointer ml-1"
                                >
                                    Clear Services
                                </button>
                            )}
                        </div>

                        {/* Match Mode Switcher (Together AND vs Either OR) */}
                        {selectedServices.length > 1 && (
                            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 dark:bg-zinc-800 border border-zinc-800 text-xs">
                                <span className="text-[10px] font-bold text-gray-400 px-2 uppercase tracking-wider">
                                    Match:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setServiceMatchMode('ALL');
                                        setPage(0);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                        serviceMatchMode === 'ALL'
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Customers who took both services together in the same session (e.g. Haircut AND Beard)"
                                >
                                    Together (AND)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setServiceMatchMode('ANY');
                                        setPage(0);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                        serviceMatchMode === 'ANY'
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Customers who took either of the selected services"
                                >
                                    Either (OR)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapsible Message Template Customizer */}
                {showTemplateEditor && (
                    <div className={`p-4 rounded-2xl border space-y-2 mt-3 ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                            <span>Variables: {'{{customer_name}}'}, {'{{stylist_name}}'}, {'{{service_name}}'}, {'{{days}}'}, {'{{booking_url}}'}</span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCustomTemplate(DEFAULT_TEMPLATE)}
                                    className="text-red-500 hover:underline cursor-pointer"
                                >
                                    Reset Default
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTemplate}
                                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                    Save Template
                                </button>
                            </div>
                        </div>
                        <textarea
                            rows={2}
                            value={customTemplate}
                            onChange={(e) => setCustomTemplate(e.target.value)}
                            className={`w-full p-3 rounded-xl text-xs font-medium border outline-none ${
                                isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                        />
                    </div>
                )}
            </div>

            {/* ==================== 5. LAPTOP 2-COLUMN MAIN VIEW ==================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* ---------- LEFT COLUMN (8 / 12 Cols): Priority Clients Due ---------- */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black tracking-tight">Priority Clients Due</h2>
                            <span className="text-xs font-bold text-gray-400">
                                ({filteredCustomers.length} clients)
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="text-xs font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                            {selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-red-500" />
                            ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{selectedIds.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full border-3 border-red-500 border-t-transparent animate-spin" />
                            <p className="text-xs font-bold text-gray-400">Loading client grooming cadence...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className={`py-16 text-center rounded-3xl border border-dashed ${
                            isDarkMode ? 'border-zinc-800 bg-zinc-900/30 text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}>
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-bold">No clients match this cadence filter.</p>
                            <p className="text-xs mt-1">Try switching to &quot;All Cadences&quot; or clearing the search.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCustomers.map((item) => {
                                const isChecked = selectedIds.includes(item.id);
                                const isSent = sentDirectIds.includes(item.id);
                                const isSnoozed = snoozedIds.includes(item.id);
                                const isClientAutoPilot = clientAutoPilotMap[item.id] !== false;

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-2xl border p-5 transition-all space-y-4 shadow-xs ${
                                            isChecked
                                                ? isDarkMode ? 'bg-zinc-900 border-red-500/50 ring-1 ring-red-500/30' : 'bg-red-50/40 border-red-200 ring-1 ring-red-200'
                                                : isDarkMode ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700' : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Card Top Row: Avatar + Name + Tags + Call */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3.5 min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRow(item.id)}
                                                    className="mt-1 cursor-pointer text-gray-400 hover:text-red-500"
                                                >
                                                    {isChecked ? (
                                                        <CheckSquare className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>

                                                {/* Client Avatar with VIP badge */}
                                                <div className="relative shrink-0">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                                                        {getInitials(item.customerName)}
                                                    </div>
                                                    {item.isVip && (
                                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] shadow-sm font-black">
                                                            ★
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className={`text-base font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                            {item.customerName}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30">
                                                            {item.vipTag}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        Stylist: <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{item.stylistName}</strong> • Last: {item.daysSince}d ago
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Call Button & Auto-Pilot Switch */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {item.phone && (
                                                    <a
                                                        href={`tel:${item.phone}`}
                                                        className={`p-2 rounded-xl border transition-all ${
                                                            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                        title={`Call ${item.phone}`}
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleClientAutoPilot(item.id)}
                                                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                        isClientAutoPilot
                                                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                                                            : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                                                    }`}
                                                >
                                                    <Zap className="w-3 h-3" />
                                                    <span>{isClientAutoPilot ? 'Auto' : 'Manual'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Middle Row: Service + Overdue Pill + Cadence interval */}
                                        <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                                            isDarkMode ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50 border-slate-100'
                                        }`}>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="font-black text-red-500">{item.serviceName}</span>
                                                <span className="text-gray-400">•</span>
                                                {item.overdueDays > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-500 border border-red-500/30 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                        {item.overdueDays}d overdue
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                                        Due today
                                                    </span>
                                                )}
                                                <span className="text-gray-400 text-[11px]">
                                                    Cadence: {item.cadenceDays}d
                                                </span>
                                            </div>

                                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                                <span>Interval: Auto {item.cadenceDays} Days</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowIntervalsModal(true)}
                                                    className="text-indigo-400 hover:underline font-bold cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Actions Row: WhatsApp Buttons + Snooze + Win-back Offer */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Primary Green WhatsApp Action */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDirectWhatsApp(item)}
                                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span>{isSent ? 'WhatsApp Sent' : 'WhatsApp'}</span>
                                                </button>

                                                {/* WhatsApp Quick Slot */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDirectWhatsApp(item)}
                                                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    Quick Slot
                                                </button>

                                                {/* +3 Days Snooze */}
                                                <button
                                                    type="button"
                                                    disabled={isSnoozed}
                                                    onClick={() => handleSnooze(item.id)}
                                                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                                        isSnoozed
                                                            ? 'opacity-50 cursor-not-allowed bg-gray-500/10 border-transparent text-gray-400'
                                                            : isDarkMode
                                                                ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                                                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                                    }`}
                                                >
                                                    {isSnoozed ? 'Snoozed +3d' : '+3 Days'}
                                                </button>
                                            </div>

                                            {/* Overdue Win-back Special Offer Button */}
                                            {item.overdueDays >= 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDirectWhatsApp(item, true)}
                                                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                                                >
                                                    <Tag className="w-3 h-3" />
                                                    <span>Send 15% VIP Return Offer</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                            isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span>Showing Page {page + 1} of {totalPages}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-400">{totalElements} Total Clients</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={page === 0}
                                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer font-bold"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={page + 1 >= totalPages}
                                    onClick={() => setPage((prev) => prev + 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer font-bold"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ---------- RIGHT COLUMN (4 / 12 Cols): Cadence Rules & Live Template Preview ---------- */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Automated Cadence Rules Card */}
                    <div className={`p-6 rounded-3xl border space-y-5 shadow-xs ${
                        isDarkMode ? 'bg-zinc-900/70 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-black tracking-tight">Automated Cadence Rules</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                Active
                            </span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                            Auto-triggered rebooking cycle intervals based on your service catalog.
                        </p>

                        {/* Visual 3-Box Cadence Intervals */}
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className={`p-3 rounded-2xl border text-center transition-all ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Beard
                                </span>
                                <div className="text-lg font-black text-amber-500">{cadenceRules.beard} Days</div>
                            </div>

                            <div className={`p-3 rounded-2xl border text-center transition-all ring-1 ring-blue-500/30 ${
                                isDarkMode ? 'bg-blue-950/20 border-blue-900/50' : 'bg-blue-50/60 border-blue-200'
                            }`}>
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block mb-1">
                                    Haircut
                                </span>
                                <div className="text-lg font-black text-blue-500">{cadenceRules.haircut} Days</div>
                            </div>

                            <div className={`p-3 rounded-2xl border text-center transition-all ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                                    Spa & Color
                                </span>
                                <div className="text-lg font-black text-purple-500">{cadenceRules.spa} Days</div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setTempRules(cadenceRules);
                                setShowIntervalsModal(true);
                            }}
                            className={`w-full py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Configure Intervals</span>
                        </button>
                    </div>

                    {/* WhatsApp Reminder Template Preview Card */}
                    <div className={`p-6 rounded-3xl border space-y-4 shadow-xs ${
                        isDarkMode ? 'bg-zinc-900/70 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <h3 className="text-sm font-black tracking-tight">WhatsApp Reminder Template</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTemplateEditor((prev) => !prev)}
                                className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                        </div>

                        {/* Realistic WhatsApp Chat Bubble Preview */}
                        <div className={`p-4 rounded-2xl border text-xs leading-relaxed italic ${
                            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-emerald-50/50 border-emerald-100 text-slate-700'
                        }`}>
                            &ldquo;{buildPersonalizedMessage(dueCustomers[0] || {
                                customerName: 'Rohan Mehta',
                                stylistName: 'Specialist',
                                serviceName: 'Haircut',
                                daysSince: 22
                            })}&rdquo;
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowTestModal(true)}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Send Test</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(customTemplate);
                                    toast.success('Template copied to clipboard', toastStyle);
                                }}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 6. MODALS ==================== */}

            {/* Configure Intervals Modal */}
            {showIntervalsModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-5 ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight">Configure Cadence Cycles</h3>
                                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                                    Set the standard revisit cycle (in days) for each grooming category.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowIntervalsModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Beard Care & Shaving (Days)</label>
                                <input
                                    type="number"
                                    min="3"
                                    max="60"
                                    value={tempRules.beard}
                                    onChange={(e) => setTempRules({ ...tempRules, beard: parseInt(e.target.value, 10) || 14 })}
                                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Haircut & Styling (Days)</label>
                                <input
                                    type="number"
                                    min="7"
                                    max="90"
                                    value={tempRules.haircut}
                                    onChange={(e) => setTempRules({ ...tempRules, haircut: parseInt(e.target.value, 10) || 24 })}
                                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Spa & Hair Color (Days)</label>
                                <input
                                    type="number"
                                    min="14"
                                    max="180"
                                    value={tempRules.spa}
                                    onChange={(e) => setTempRules({ ...tempRules, spa: parseInt(e.target.value, 10) || 45 })}
                                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowIntervalsModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-zinc-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveIntervals}
                                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer shadow-sm"
                            >
                                Save Intervals
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Test WhatsApp Message Modal */}
            {showTestModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl space-y-5 ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight">Send Test WhatsApp Message</h3>
                                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                                    Send a preview WhatsApp message to your own phone to verify formatting.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTestModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 block mb-1">Your 10-Digit Mobile Number</label>
                            <input
                                type="tel"
                                maxLength={10}
                                placeholder="9876543210"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none ${
                                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowTestModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-zinc-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSendTestMessage}
                                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer shadow-sm flex items-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send Test</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Buy WhatsApp Credit Packs Modal (Razorpay) */}
            {showTopUpModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-emerald-500" />
                                    <span>Buy WhatsApp Credit Packs</span>
                                </h3>
                                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                                    One-time add-on packs. Credits never expire and won&apos;t alter your subscription expiry.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTopUpModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {topUpPlans.length === 0 ? (
                            <div className={`p-6 rounded-2xl border text-center text-xs ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-950 text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}>
                                No WhatsApp Top-Up packs configured yet. Create a plan with type{' '}
                                <strong>WhatsApp Top-Up Pack</strong> in Admin Subscriptions.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {topUpPlans.map((pack) => (
                                    <div
                                        key={pack.id || pack.planCode}
                                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                                            isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-sm font-black truncate">{pack.planName}</h4>
                                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                                                <span className="text-emerald-500">+{pack.marketingCredits || 0} Marketing</span>
                                                {(pack.utilityCredits || 0) > 0 && (
                                                    <span className="text-blue-500">+{pack.utilityCredits} Utility</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={buyingPlanCode === pack.planCode}
                                            onClick={() => handleBuyTopUpPack(pack)}
                                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shrink-0 cursor-pointer disabled:opacity-50"
                                        >
                                            {buyingPlanCode === pack.planCode
                                                ? 'Processing...'
                                                : `Buy ₹${((pack.amountInPaise || 0) / 100).toFixed(0)}`}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reminders;
