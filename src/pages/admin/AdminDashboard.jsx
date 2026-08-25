import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Shield,
  ClipboardList,
  Settings,
  CheckCircle,
  XCircle,
  Eye,
  Save,
  Image as ImageIcon,
  AlertTriangle,
  Inbox,
  X,
  Ticket,
  Users,
  UserPlus,
  KeyRound,
  Ban,
  Search,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Plus,
  CalendarPlus,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Layers,
  LogOut,
  Home,
} from 'lucide-react';
import { useAppState, useAppDispatch } from '../../store/appStore';
import { useAuth } from '../../context/AuthContext';
import {
  formatRupiah,
  formatDateTime,
  formatDate,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  INITIAL_EVENTS,
} from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

const HISTORY_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: ORDER_STATUS.PENDING, label: ORDER_STATUS_LABEL[ORDER_STATUS.PENDING] },
  { key: ORDER_STATUS.PAID, label: ORDER_STATUS_LABEL[ORDER_STATUS.PAID] },
  { key: ORDER_STATUS.EXPIRED, label: ORDER_STATUS_LABEL[ORDER_STATUS.EXPIRED] },
  { key: ORDER_STATUS.CANCELLED, label: ORDER_STATUS_LABEL[ORDER_STATUS.CANCELLED] },
];

const TABS = [
  { key: 'verifikasi', label: 'Verifikasi Pembayaran', icon: Shield },
  { key: 'riwayat', label: 'Riwayat Pesanan', icon: ClipboardList },
  { key: 'pengguna', label: 'Kelola Pengguna', icon: Users },
  { key: 'kelola', label: 'Kelola Event', icon: Settings },
];

/** `datetime-local` hanya menerima format YYYY-MM-DDTHH:mm. */
const toDateTimeLocal = (value) => (value ? value.slice(0, 16) : '');

const DEFAULT_CATEGORIES = ['Konser', 'Festival', 'Electronic', 'Jazz & Blues', 'Teater', 'Olahraga'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { events, event, orders } = useAppState();
  const dispatch = useAppDispatch();
  const {
    currentUser,
    isAuthenticated,
    logout,
    customers,
    addCustomerByAdmin,
    updateCustomerData,
    toggleCustomerStatus,
    resetCustomerPassword,
    deleteCustomer,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('verifikasi');
  const [toast, setToast] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');

  // Customer Management state
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'active' | 'suspended'
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [editCustomerModal, setEditCustomerModal] = useState(null);
  const [resetPwdModal, setResetPwdModal] = useState(null);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustWhatsapp, setNewCustWhatsapp] = useState('');
  const [newCustPassword, setNewCustPassword] = useState('');

  // Reset Password State
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Multi-Event State
  const allEvents = useMemo(() => {
    return events && events.length > 0 ? events : (event ? [event] : INITIAL_EVENTS);
  }, [events, event]);

  const [selectedEventId, setSelectedEventId] = useState(allEvents[0]?.id || 'evt-001');
  const [addEventModal, setAddEventModal] = useState(false);

  // Selected Event Form State
  const currentSelectedEvent = useMemo(() => {
    return allEvents.find((e) => e.id === selectedEventId) || allEvents[0];
  }, [allEvents, selectedEventId]);

  const [eventForm, setEventForm] = useState(null);
  const [tierForms, setTierForms] = useState([]);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventSubtitle, setNewEventSubtitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Konser');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventAddress, setNewEventAddress] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventOrganizer, setNewEventOrganizer] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventTiers, setNewEventTiers] = useState([
    { name: 'Presale', price: 50000, quota: 100, description: 'Early bird tiket harga spesial', color: '#22c55e' },
    { name: 'Regular', price: 75000, quota: 250, description: 'Tiket reguler standing area', color: '#3b82f6' },
    { name: 'VIP', price: 150000, quota: 50, description: 'VIP Lounge + Free Merchandise', color: '#a855f7' },
  ]);

  useEffect(() => {
    if (!currentSelectedEvent) return;
    setEventForm({
      id: currentSelectedEvent.id,
      title: currentSelectedEvent.title || '',
      subtitle: currentSelectedEvent.subtitle || '',
      category: currentSelectedEvent.category || 'Konser',
      location: currentSelectedEvent.location || '',
      address: currentSelectedEvent.address || '',
      date: toDateTimeLocal(currentSelectedEvent.date),
      endDate: toDateTimeLocal(currentSelectedEvent.endDate),
      organizer: currentSelectedEvent.organizer || '',
      description: currentSelectedEvent.description || '',
    });
    setTierForms(currentSelectedEvent.tiers?.map((t) => ({ ...t })) || []);
  }, [currentSelectedEvent]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === ORDER_STATUS.PENDING && o.receiptUrl),
    [orders]
  );

  const filteredOrders = useMemo(
    () =>
      orders
        .filter((o) => historyFilter === 'all' || o.status === historyFilter)
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)),
    [orders, historyFilter]
  );

  // Filtered customers with order stats
  const filteredCustomers = useMemo(() => {
    return (customers || [])
      .filter((c) => {
        if (userFilter !== 'all' && c.status !== userFilter) return false;
        if (!userSearch.trim()) return true;
        const q = userSearch.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.whatsapp?.includes(q)
        );
      })
      .map((cust) => {
        const userOrders = orders.filter(
          (o) => o.email?.toLowerCase() === cust.email?.toLowerCase()
        );
        const totalTickets = userOrders
          .filter((o) => o.status === 'paid')
          .reduce((sum, o) => sum + (o.qty || 0), 0);
        const totalSpent = userOrders
          .filter((o) => o.status === 'paid')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return {
          ...cust,
          orderCount: userOrders.length,
          totalTickets,
          totalSpent,
        };
      });
  }, [customers, orders, userSearch, userFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleApprove = (orderId) => {
    dispatch({ type: 'APPROVE_ORDER', payload: { orderId } });
    showToast('Pesanan disetujui, e-ticket diterbitkan.');
  };

  const handleReject = (orderId) => {
    if (!window.confirm('Tolak pesanan ini? Kuota tiketnya akan dikembalikan.')) return;
    dispatch({ type: 'REJECT_ORDER', payload: { orderId } });
    showToast('Pesanan ditolak dan kuota dikembalikan.');
  };

  const handleTierChange = (index, field, value) => {
    setTierForms((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier))
    );
  };

  const handleAddTierRow = () => {
    const newTierId = `tier-${currentSelectedEvent?.id || 'evt'}-${Date.now().toString().slice(-4)}`;
    setTierForms((prev) => [
      ...prev,
      {
        id: newTierId,
        name: 'Kategori Baru',
        price: 50000,
        quota: 100,
        sold: 0,
        description: 'Deskripsi paket tiket baru',
        color: '#3b82f6',
      },
    ]);
  };

  const handleRemoveTierRow = (index) => {
    if (tierForms.length <= 1) {
      showToast('Event harus memiliki minimal 1 paket tiket.', 'error');
      return;
    }
    const target = tierForms[index];
    if (target.sold > 0) {
      showToast(`Tidak bisa menghapus tier ${target.name} karena sudah ada ${target.sold} tiket terjual.`, 'error');
      return;
    }
    setTierForms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEvent = () => {
    const invalid = tierForms.find((t) => Number(t.quota) < (t.sold || 0));
    if (invalid) {
      showToast(
        `Kuota ${invalid.name} tidak boleh kurang dari ${invalid.sold} tiket yang sudah terjual.`,
        'error'
      );
      return;
    }

    dispatch({
      type: 'UPDATE_EVENT',
      payload: {
        id: eventForm.id || selectedEventId,
        title: eventForm.title,
        subtitle: eventForm.subtitle,
        category: eventForm.category,
        location: eventForm.location,
        address: eventForm.address,
        date: eventForm.date ? new Date(eventForm.date).toISOString() : currentSelectedEvent.date,
        endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : currentSelectedEvent.endDate,
        organizer: eventForm.organizer,
        description: eventForm.description,
        tiers: tierForms.map((t) => ({
          ...t,
          price: Number(t.price),
          quota: Number(t.quota),
        })),
      },
    });

    tierForms.forEach((t) => {
      dispatch({
        type: 'UPDATE_TIER',
        payload: {
          tierId: t.id,
          updates: {
            name: t.name,
            price: Number(t.price),
            quota: Number(t.quota),
            description: t.description,
          },
        },
      });
    });

    showToast(`Perubahan untuk "${eventForm.title}" berhasil disimpan!`);
  };

  const handleDeleteEvent = (evt) => {
    if (allEvents.length <= 1) {
      showToast('Tidak dapat menghapus satu-satunya event yang ada.', 'error');
      return;
    }
    if (!window.confirm(`Hapus event "${evt.title}" secara permanen? Semua data paket tiketnya akan ikut terhapus.`)) {
      return;
    }

    dispatch({ type: 'DELETE_EVENT', payload: { eventId: evt.id } });
    const nextEvent = allEvents.find((e) => e.id !== evt.id);
    if (nextEvent) {
      setSelectedEventId(nextEvent.id);
    }
    showToast(`Event "${evt.title}" berhasil dihapus.`);
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventLocation.trim() || !newEventDate) {
      showToast('Mohon lengkapi judul, lokasi, dan tanggal event.', 'error');
      return;
    }

    const newId = `evt-${Date.now().toString().slice(-4)}`;
    const newCreatedEvent = {
      id: newId,
      title: newEventTitle.trim(),
      subtitle: newEventSubtitle.trim(),
      category: newEventCategory,
      location: newEventLocation.trim(),
      address: newEventAddress.trim(),
      date: new Date(newEventDate).toISOString(),
      endDate: newEventEndDate ? new Date(newEventEndDate).toISOString() : new Date(newEventDate).toISOString(),
      organizer: newEventOrganizer.trim() || 'Karcix Official',
      description: newEventDescription.trim() || 'Deskripsi event baru.',
      lineup: ['Guest Star 1', 'Guest Star 2'],
      badge: 'Baru',
      rating: '5.0',
      isActive: true,
      tiers: newEventTiers.map((t, idx) => ({
        id: `tier-${newId}-${idx + 1}`,
        eventId: newId,
        name: t.name,
        price: Number(t.price),
        quota: Number(t.quota),
        sold: 0,
        description: t.description,
        color: t.color || '#3b82f6',
      })),
    };

    dispatch({ type: 'ADD_EVENT', payload: newCreatedEvent });
    setSelectedEventId(newId);
    setAddEventModal(false);

    // Reset form
    setNewEventTitle('');
    setNewEventSubtitle('');
    setNewEventLocation('');
    setNewEventAddress('');
    setNewEventDate('');
    setNewEventEndDate('');
    setNewEventOrganizer('');
    setNewEventDescription('');

    showToast(`Event "${newCreatedEvent.title}" berhasil dibuat dan aktif di beranda!`);
  };

  // Customer Management Handlers
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCustomerByAdmin({
        name: newCustName,
        email: newCustEmail,
        whatsapp: newCustWhatsapp,
        password: newCustPassword || 'password123456',
        status: 'active',
      });
      showToast(`Pelanggan ${newCustName} berhasil ditambahkan.`);
      setAddCustomerModal(false);
      setNewCustName('');
      setNewCustEmail('');
      setNewCustWhatsapp('');
      setNewCustPassword('');
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan pelanggan.', 'error');
    }
  };

  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    if (!editCustomerModal) return;
    updateCustomerData(editCustomerModal.id, {
      name: editCustomerModal.name,
      whatsapp: editCustomerModal.whatsapp,
      status: editCustomerModal.status,
    });
    showToast('Data pelanggan berhasil diperbarui.');
    setEditCustomerModal(null);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetPwdModal || !newPasswordVal.trim()) return;
    if (newPasswordVal.length < 12) {
      showToast('Kata sandi harus minimal 12 karakter.', 'error');
      return;
    }
    resetCustomerPassword(resetPwdModal.id, newPasswordVal.trim());
    showToast(`Kata sandi untuk ${resetPwdModal.name} berhasil direset.`);
    setResetPwdModal(null);
    setNewPasswordVal('');
  };

  const handleToggleStatus = (cust) => {
    toggleCustomerStatus(cust.id);
    showToast(`Status akun ${cust.name} diperbarui.`);
  };

  const handleDeleteCust = (cust) => {
    if (!window.confirm(`Hapus akun ${cust.name} (${cust.email}) secara permanen?`)) return;
    deleteCustomer(cust.id);
    showToast(`Akun ${cust.name} berhasil dihapus.`);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-[#1173d4] flex items-center justify-center mb-4 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">Akses Administrator Terbatas</h1>
        <p className="text-sm text-[#86868B] max-w-md mb-6">
          Halaman ini khusus untuk staf Administrator Karcix. Silakan masuk terlebih dahulu menggunakan akun staf Anda.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-outline text-xs sm:text-sm py-2.5 px-5">
            Kembali ke Beranda
          </Link>
          <Link to="/staff" className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Masuk Portal Staff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Admin Dashboard</h1>
            <p className="text-[#86868B] text-sm mt-1">
              Kelola pesanan, verifikasi pembayaran, data pengguna, dan multi-event Karcix
            </p>
          </div>

          {/* Admin Profile & Logout Bar */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#1D1D1F]">{currentUser?.name || 'Administrator'}</span>
              <span className="text-[10px] font-bold text-[#1173d4] bg-blue-50 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>

            <Link
              to="/"
              className="px-3 py-2 bg-white text-xs font-semibold text-[#1D1D1F] hover:bg-gray-50 border border-black/5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#86868B]" />
              <span className="hidden sm:inline">Ke Beranda</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#FF3B30] border border-red-200 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Keluar dari Akun Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-black/5 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1173d4] text-white shadow-md'
                    : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.key === 'verifikasi' && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : pendingOrders.length > 0
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {pendingOrders.length}
                  </span>
                )}
                {tab.key === 'riwayat' && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
                {tab.key === 'pengguna' && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {customers.length}
                  </span>
                )}
                {tab.key === 'kelola' && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {allEvents.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Verifikasi Pembayaran */}
        {activeTab === 'verifikasi' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1173d4]" />
              Antrean Verifikasi ({pendingOrders.length})
            </h2>

            {pendingOrders.length === 0 ? (
              <div className="bg-white border border-black/5 rounded-3xl p-10 sm:p-16 text-center shadow-sm flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-[#1173d4] flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-[#1D1D1F] mb-1">
                  Antrean Verifikasi Pembayaran Kosong
                </h3>
                <p className="text-xs text-[#86868B] max-w-md leading-relaxed mb-4">
                  Saat ini tidak ada pesanan tiket yang menunggu verifikasi pembayaran. Pesanan baru dari pembeli yang mengunggah bukti bayar QRIS/Transfer akan otomatis masuk di sini.
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F5F5F7] border border-black/5 rounded-full text-[11px] font-semibold text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Sistem Verifikasi Realtime Aktif</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono text-[#86868B] block mb-1 font-bold">
                          {order.id}
                        </span>
                        <h3 className="font-bold text-[#1D1D1F] text-base">{order.buyerName}</h3>
                        <p className="text-xs text-[#86868B]">{order.email}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="bg-[#F5F5F7] p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#86868B]">Event:</span>
                        <span className="font-semibold text-[#1D1D1F] truncate max-w-[160px]">
                          {order.eventTitle || currentSelectedEvent?.title || 'PENSI FEST 2026'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#86868B]">Tiket:</span>
                        <span className="font-semibold text-[#1D1D1F]">
                          {order.tierName} × {order.qty}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-black/5 pt-1.5">
                        <span>Total Tagihan:</span>
                        <span className="text-[#1173d4] text-sm">
                          {formatRupiah(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {order.receiptUrl ? (
                      <button
                        onClick={() => setReceiptModal(order.receiptUrl)}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-[#1173d4] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Lihat Bukti Pembayaran
                      </button>
                    ) : (
                      <div className="text-center p-2 text-xs text-amber-600 bg-amber-50 rounded-xl">
                        Belum ada bukti pembayaran
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleReject(order.id)}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-red-200 text-[#FF3B30] hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(order.id)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" /> Setujui &amp; Terbitkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Riwayat Pesanan */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#1173d4]" />
                Semua Pesanan ({filteredOrders.length})
              </h2>

              <div className="flex bg-white p-1 rounded-xl border border-black/5 overflow-x-auto text-xs">
                {HISTORY_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setHistoryFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      historyFilter === f.key
                        ? 'bg-[#1173d4] text-white shadow-sm'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="data-table w-full text-left">
                  <thead>
                    <tr>
                      <th>ID Pesanan</th>
                      <th>Event &amp; Pembeli</th>
                      <th>Kategori &amp; Qty</th>
                      <th>Total Tagihan</th>
                      <th>Status</th>
                      <th>Waktu</th>
                      <th>Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center mb-3 shadow-sm">
                              <Inbox className="w-7 h-7" />
                            </div>
                            <h4 className="font-bold text-base text-[#1D1D1F] mb-1">
                              {historyFilter === 'all'
                                ? 'Belum Ada Data Pesanan'
                                : `Tidak Ada Pesanan Berstatus "${historyFilter.toUpperCase()}"`}
                            </h4>
                            <p className="text-xs text-[#86868B] leading-relaxed mb-4">
                              {historyFilter === 'all'
                                ? 'Seluruh transaksi pesanan tiket yang dibuat oleh pembeli akan muncul di tabel riwayat ini.'
                                : 'Tidak ditemukan transaksi yang cocok dengan filter status yang Anda pilih.'}
                            </p>
                            {historyFilter !== 'all' && (
                              <button
                                onClick={() => setHistoryFilter('all')}
                                className="px-3.5 py-1.5 bg-[#F5F5F7] hover:bg-gray-200 text-[#1D1D1F] border border-black/5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Tampilkan Semua Pesanan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="font-mono text-xs font-bold text-[#1D1D1F]">{o.id}</td>
                          <td>
                            <p className="font-semibold text-sm text-[#1D1D1F]">{o.buyerName}</p>
                            <p className="text-xs text-[#86868B]">{o.email}</p>
                            {o.eventTitle && (
                              <span className="inline-block text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                                {o.eventTitle}
                              </span>
                            )}
                          </td>
                          <td className="text-xs">
                            <span className="font-semibold text-[#1D1D1F]">{o.tierName}</span>
                            <span className="text-[#86868B]"> • {o.qty} Tiket</span>
                          </td>
                          <td className="font-bold text-sm text-[#1D1D1F]">
                            {formatRupiah(o.totalAmount)}
                          </td>
                          <td>
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="text-xs text-[#86868B]">{formatDateTime(o.timestamp)}</td>
                          <td>
                            {o.receiptUrl ? (
                              <button
                                onClick={() => setReceiptModal(o.receiptUrl)}
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1173d4] transition-colors cursor-pointer"
                                title="Lihat Bukti"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Kelola Pengguna */}
        {activeTab === 'pengguna' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase">Total Pengguna</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1173d4] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1D1D1F] mt-2">{customers.length}</p>
                <p className="text-xs text-[#86868B] mt-1">Pembeli terdaftar di Karcix</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase">Akun Aktif</span>
                  <div className="w-8 h-8 rounded-xl bg-green-50 text-[#22c55e] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1D1D1F] mt-2">
                  {customers.filter((c) => c.status === 'active').length}
                </p>
                <p className="text-xs text-[#86868B] mt-1">Bisa login &amp; beli tiket</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase">Akun Diblokir</span>
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-[#FF3B30] flex items-center justify-center">
                    <Ban className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1D1D1F] mt-2">
                  {customers.filter((c) => c.status === 'suspended').length}
                </p>
                <p className="text-xs text-[#86868B] mt-1">Akses dinonaktifkan</p>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama, email, atau nomor WA..."
                  className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:border-[#1173d4]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <div className="flex bg-[#F5F5F7] p-1 rounded-xl border border-black/5 text-xs">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      userFilter === 'all' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setUserFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      userFilter === 'active' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => setUserFilter('suspended')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      userFilter === 'suspended' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'
                    }`}
                  >
                    Diblokir
                  </button>
                </div>

                <button
                  onClick={() => setAddCustomerModal(true)}
                  className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Pengguna</span>
                </button>
              </div>
            </div>

            {/* Customers Data Table */}
            <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="data-table w-full text-left">
                  <thead>
                    <tr>
                      <th>Nama &amp; Email</th>
                      <th>Nomor WhatsApp</th>
                      <th>Total Tiket / Belanja</th>
                      <th>Status Akun</th>
                      <th>Terdaftar</th>
                      <th className="text-right">Aksi Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#86868B]">
                          Tidak ada data pengguna yang cocok
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id}>
                          <td>
                            <p className="font-semibold text-sm text-[#1D1D1F]">{cust.name}</p>
                            <p className="text-xs text-[#86868B]">{cust.email}</p>
                          </td>
                          <td className="text-xs font-mono text-[#1D1D1F]">
                            {cust.whatsapp || '-'}
                          </td>
                          <td>
                            <p className="text-xs font-semibold text-[#1D1D1F]">
                              {cust.totalTickets} Tiket
                            </p>
                            <p className="text-[11px] text-[#86868B]">
                              {formatRupiah(cust.totalSpent)} ({cust.orderCount} pesanan)
                            </p>
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                cust.status === 'active'
                                  ? 'bg-green-50 text-[#22c55e] border border-green-200'
                                  : 'bg-red-50 text-[#FF3B30] border border-red-200'
                              }`}
                            >
                              {cust.status === 'active' ? '● Aktif' : '● Diblokir'}
                            </span>
                          </td>
                          <td className="text-xs text-[#86868B]">
                            {cust.created_at ? formatDate(cust.created_at) : '-'}
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditCustomerModal({ ...cust })}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1D1D1F] transition-colors cursor-pointer"
                                title="Edit Data Pengguna"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setResetPwdModal(cust);
                                  setNewPasswordVal('password123456');
                                }}
                                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1173d4] transition-colors cursor-pointer"
                                title="Reset Kata Sandi"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(cust)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                  cust.status === 'active'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                                    : 'bg-green-50 hover:bg-green-100 text-green-600'
                                }`}
                                title={cust.status === 'active' ? 'Blokir Akun' : 'Aktifkan Akun'}
                              >
                                <Ban className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteCust(cust)}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#FF3B30] transition-colors cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Kelola Multi-Event */}
        {activeTab === 'kelola' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Multi-Event Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#1173d4]" />
                  Kelola Daftar Event &amp; Paket Tiket
                </h2>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Pilih event untuk mengedit rincian dan kuota tiket, atau tambah event baru.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddEventModal(true)}
                  className="btn-primary py-2.5 px-4 text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Tambah Event Baru</span>
                </button>
              </div>
            </div>

            {/* Event Selector Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {allEvents.map((evt) => {
                const isSelected = evt.id === selectedEventId;
                const totalQuota = evt.tiers?.reduce((sum, t) => sum + Number(t.quota || 0), 0) || 0;
                const totalSold = evt.tiers?.reduce((sum, t) => sum + Number(t.sold || 0), 0) || 0;

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#1173d4] shadow-md ring-2 ring-[#1173d4]/20'
                        : 'bg-white border-black/5 hover:border-black/15 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#1173d4]">
                          {evt.category || 'Konser'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-gray-500">
                          {evt.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1D1D1F] line-clamp-1">{evt.title}</h4>
                      <p className="text-xs text-[#86868B] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {evt.location}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-xs">
                      <span className="text-[#86868B]">
                        Terjual: <strong className="text-[#1D1D1F]">{totalSold}/{totalQuota}</strong>
                      </span>
                      <span className="text-[#1173d4] font-semibold">
                        {evt.tiers?.length || 0} Tier Tiket
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event Edit Section */}
            {eventForm && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                  <div>
                    <span className="text-xs font-semibold text-[#86868B] uppercase">
                      Sedang Mengedit
                    </span>
                    <h3 className="text-lg font-bold text-[#1D1D1F]">{eventForm.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {allEvents.length > 1 && (
                      <button
                        onClick={() => handleDeleteEvent(currentSelectedEvent)}
                        className="py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus Event
                      </button>
                    )}
                    <button
                      onClick={handleSaveEvent}
                      className="btn-primary py-2 px-4 text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Info Event */}
                  <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider">
                      Informasi Dasar Event
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-[#86868B] mb-1">
                        Judul Event <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="input-field py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#86868B] mb-1">
                          Sub-judul / Tagline
                        </label>
                        <input
                          type="text"
                          value={eventForm.subtitle}
                          onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                          className="input-field py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#86868B] mb-1">
                          Kategori
                        </label>
                        <select
                          value={eventForm.category}
                          onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                          className="input-field py-2 text-sm bg-white"
                        >
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#86868B] mb-1">Lokasi</label>
                        <input
                          type="text"
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className="input-field py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#86868B] mb-1">
                          Penyelenggara (Organizer)
                        </label>
                        <input
                          type="text"
                          value={eventForm.organizer}
                          onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                          className="input-field py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#86868B] mb-1">
                          Waktu Mulai
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="input-field py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#86868B] mb-1">
                          Waktu Selesai
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.endDate}
                          onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                          className="input-field py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#86868B] mb-1">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        value={eventForm.address}
                        onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                        className="input-field py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#86868B] mb-1">
                        Deskripsi Event
                      </label>
                      <textarea
                        rows={4}
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="input-field py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Form Kuota & Kategori Tiket */}
                  <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider">
                        Kategori Tiket, Harga &amp; Kuota
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddTierRow}
                        className="text-xs text-[#1173d4] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Paket Tiket
                      </button>
                    </div>

                    <div className="space-y-4">
                      {tierForms.map((tier, index) => (
                        <div
                          key={tier.id || index}
                          className="p-4 bg-[#F5F5F7] rounded-xl border border-black/5 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: tier.color || '#3b82f6' }}
                              />
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                                className="font-bold text-sm text-[#1D1D1F] bg-transparent border-b border-transparent hover:border-gray-400 focus:border-[#1173d4] focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#86868B]">
                                Terjual: <strong className="text-[#1D1D1F]">{tier.sold || 0}</strong> tiket
                              </span>
                              {tierForms.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTierRow(index)}
                                  className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                                  title="Hapus Tier"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#86868B] mb-1">
                                Harga (Rp)
                              </label>
                              <input
                                type="number"
                                value={tier.price}
                                onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                                className="w-full bg-white border border-black/5 rounded-lg p-2 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#86868B] mb-1">
                                Total Kuota
                              </label>
                              <input
                                type="number"
                                value={tier.quota}
                                onChange={(e) => handleTierChange(index, 'quota', e.target.value)}
                                className="w-full bg-white border border-black/5 rounded-lg p-2 text-xs font-semibold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#86868B] mb-1">
                              Deskripsi Tier
                            </label>
                            <input
                              type="text"
                              value={tier.description}
                              onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                              className="w-full bg-white border border-black/5 rounded-lg p-2 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Tambah Event Baru */}
      {addEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div
            className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5 my-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-[#1173d4]" />
                  Tambah Event Baru
                </h3>
                <p className="text-xs text-[#86868B]">
                  Event baru akan otomatis muncul di Beranda dan bisa dibeli tiketnya
                </p>
              </div>
              <button
                onClick={() => setAddEventModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                    Judul Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bandung Rock Fest 2026"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="input-field py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                    Kategori Event
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="input-field py-2 text-xs sm:text-sm bg-white"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                    Tagline / Sub-judul
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: The Ultimate Stage"
                    value={newEventSubtitle}
                    onChange={(e) => setNewEventSubtitle(e.target.value)}
                    className="input-field py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                    Penyelenggara (Organizer)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rock Nation Promo"
                    value={newEventOrganizer}
                    onChange={(e) => setNewEventOrganizer(e.target.value)}
                    className="input-field py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                    Lokasi / Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lapangan Gasibu Bandung"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="input-field py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                    Waktu Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="input-field py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan tentang keseruan acara ini..."
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className="input-field py-2 text-xs sm:text-sm"
                />
              </div>

              {/* Tiers Config */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-[#1D1D1F] uppercase mb-2">
                  Paket Tiket Awal (Harga &amp; Kuota)
                </label>
                <div className="space-y-2">
                  {newEventTiers.map((t, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-black/5">
                      <input
                        type="text"
                        placeholder="Nama Tier"
                        value={t.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewEventTiers((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        className="w-1/3 bg-white p-2 rounded-lg text-xs font-semibold border border-black/5"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Harga (Rp)"
                        value={t.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNewEventTiers((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                          );
                        }}
                        className="w-1/3 bg-white p-2 rounded-lg text-xs font-semibold border border-black/5"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Kuota"
                        value={t.quota}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNewEventTiers((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, quota: val } : item))
                          );
                        }}
                        className="w-1/3 bg-white p-2 rounded-lg text-xs font-semibold border border-black/5"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setAddEventModal(false)}
                  className="btn-outline flex-1 text-xs py-2.5 cursor-pointer"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1 text-xs py-2.5 font-bold cursor-pointer">
                  Simpan &amp; Publikasikan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna */}
      {addCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1173d4]" />
                Tambah Pengguna Baru
              </h3>
              <button
                onClick={() => setAddCustomerModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={newCustWhatsapp}
                  onChange={(e) => setNewCustWhatsapp(e.target.value)}
                  placeholder="081234567890"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Kata Sandi Awal (Min. 12 Karakter)
                </label>
                <input
                  type="text"
                  value={newCustPassword}
                  onChange={(e) => setNewCustPassword(e.target.value)}
                  placeholder="password123456"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddCustomerModal(false)}
                  className="btn-outline flex-1 text-xs py-2.5"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1 text-xs py-2.5">
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pengguna */}
      {editCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#1173d4]" />
                Edit Data Pengguna
              </h3>
              <button
                onClick={() => setEditCustomerModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={editCustomerModal.name}
                  onChange={(e) =>
                    setEditCustomerModal({ ...editCustomerModal, name: e.target.value })
                  }
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Email (Tidak bisa diubah)
                </label>
                <input
                  type="email"
                  disabled
                  value={editCustomerModal.email}
                  className="input-field py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={editCustomerModal.whatsapp || ''}
                  onChange={(e) =>
                    setEditCustomerModal({ ...editCustomerModal, whatsapp: e.target.value })
                  }
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1">
                  Status Akun
                </label>
                <select
                  value={editCustomerModal.status}
                  onChange={(e) =>
                    setEditCustomerModal({ ...editCustomerModal, status: e.target.value })
                  }
                  className="input-field py-2 text-sm bg-white"
                >
                  <option value="active">Aktif (Bisa Login)</option>
                  <option value="suspended">Diblokir / Dinonaktifkan</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCustomerModal(null)}
                  className="btn-outline flex-1 text-xs py-2.5"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1 text-xs py-2.5">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetPwdModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#1173d4]" />
                Reset Kata Sandi
              </h3>
              <button
                onClick={() => setResetPwdModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#86868B] mb-4">
              Masukkan kata sandi baru untuk <strong>{resetPwdModal.name}</strong> ({resetPwdModal.email}):
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Kata sandi baru (min 12 char)"
                  className="input-field py-2 text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPwdModal(null)}
                  className="btn-outline flex-1 text-xs py-2.5"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1 text-xs py-2.5">
                  Ubah Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2 z-depth-2 px-4 py-3 rounded-2xl border shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-[#137333]'
              : 'bg-amber-50 border-amber-200 text-[#B06000]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#137333]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#B06000]" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Modal bukti transfer */}
      {receiptModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setReceiptModal(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl z-depth-3 overflow-hidden border border-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#1173d4]" />
                Bukti Pembayaran
              </h3>
              <button
                onClick={() => setReceiptModal(null)}
                aria-label="Tutup"
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={receiptModal}
              alt="Bukti transfer"
              className="w-full h-auto max-h-[80vh] object-contain p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
