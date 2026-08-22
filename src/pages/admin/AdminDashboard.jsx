import { useEffect, useMemo, useState } from 'react';
import {
  Shield, ClipboardList, Settings, CheckCircle, XCircle, Eye, Save,
  Image as ImageIcon, AlertTriangle, Inbox, X, Ticket, RotateCcw,
  Users, UserPlus, KeyRound, Ban, Search, Edit3, Trash2, Phone, Mail,
} from 'lucide-react';
import { useAppState, useAppDispatch, clearState } from '../../store/appStore';
import { useAuth } from '../../context/AuthContext';
import {
  formatRupiah,
  formatDateTime,
  formatDate,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
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

export default function AdminDashboard() {
  const { event, orders } = useAppState();
  const dispatch = useAppDispatch();
  const {
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

  const [eventForm, setEventForm] = useState(null);
  const [tierForms, setTierForms] = useState([]);

  useEffect(() => {
    if (!event) return;
    setEventForm({
      title: event.title || '',
      subtitle: event.subtitle || '',
      location: event.location || '',
      address: event.address || '',
      date: toDateTimeLocal(event.date),
      description: event.description || '',
    });
    setTierForms(event.tiers?.map((t) => ({ ...t })) || []);
  }, [event]);

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
      .map((c) => {
        const userOrders = orders.filter((o) => o.email?.toLowerCase() === c.email?.toLowerCase());
        const totalTickets = userOrders.reduce((sum, o) => sum + (o.status === 'paid' ? o.qty : 0), 0);
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.status === 'paid' ? o.totalAmount : 0), 0);
        return {
          ...c,
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

  const handleSaveEvent = () => {
    const invalid = tierForms.find((t) => Number(t.quota) < t.sold);
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
        title: eventForm.title,
        subtitle: eventForm.subtitle,
        location: eventForm.location,
        address: eventForm.address,
        date: eventForm.date ? new Date(eventForm.date).toISOString() : event.date,
        description: eventForm.description,
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

    showToast('Perubahan event dan kuota berhasil disimpan.');
  };

  const handleResetData = () => {
    if (!window.confirm('Kembalikan semua data pesanan ke kondisi awal demo?')) return;
    clearState();
    dispatch({ type: 'RESET' });
    showToast('Data demo berhasil di-reset.');
  };

  // Customer Management Handlers
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCustomerByAdmin({
        name: newCustName,
        email: newCustEmail,
        whatsapp: newCustWhatsapp,
        password: newCustPassword || 'password123',
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
    if (!resetPwdModal || !newPasswordVal) return;
    resetCustomerPassword(resetPwdModal.id, newPasswordVal);
    showToast(`Password untuk ${resetPwdModal.name} berhasil diubah.`);
    setResetPwdModal(null);
    setNewPasswordVal('');
  };

  const handleToggleStatus = (cust) => {
    const action = cust.status === 'active' ? 'nonaktifkan / blokir' : 'aktifkan kembali';
    if (!window.confirm(`Yakin ingin ${action} akun ${cust.name}?`)) return;
    toggleCustomerStatus(cust.id);
    showToast(`Status akun ${cust.name} diperbarui.`);
  };

  const handleDeleteCust = (cust) => {
    if (!window.confirm(`Hapus akun ${cust.name} (${cust.email}) secara permanen?`)) return;
    deleteCustomer(cust.id);
    showToast(`Akun ${cust.name} berhasil dihapus.`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Admin Dashboard</h1>
            <p className="text-[#86868B] text-sm mt-1">
              Kelola pesanan, verifikasi pembayaran, data pengguna, dan event Karcix
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] border border-black/5 rounded-full shadow-sm hover:shadow transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Demo
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-black/5 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-[#1173d4] text-white shadow-md'
                    : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.key === 'verifikasi' && pendingOrders.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white text-[#1173d4]' : 'bg-[#1173d4] text-white'
                    }`}
                  >
                    {pendingOrders.length}
                  </span>
                )}
                {t.key === 'pengguna' && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#86868B]'
                    }`}
                  >
                    {customers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab: Verifikasi Pembayaran */}
        {activeTab === 'verifikasi' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1173d4]" />
                Menunggu Verifikasi
              </h2>
              <span className="text-xs font-semibold text-[#86868B]">
                {pendingOrders.length} Pesanan
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="bg-white border border-black/5 rounded-2xl p-12 text-center text-[#86868B] shadow-sm">
                <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-[#1D1D1F]">Tidak ada pesanan menunggu verifikasi</p>
                <p className="text-xs mt-1">
                  Pesanan baru dengan bukti transfer akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="data-table w-full text-left">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Nama & Kontak</th>
                        <th>Tier</th>
                        <th>Total</th>
                        <th>Waktu</th>
                        <th>Bukti</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-mono text-xs font-semibold text-[#1173d4]">
                            {order.id}
                          </td>
                          <td>
                            <p className="font-semibold text-sm text-[#1D1D1F]">{order.buyerName}</p>
                            <p className="text-xs text-[#86868B]">{order.email}</p>
                          </td>
                          <td>
                            <span className="font-medium text-xs text-[#1D1D1F]">{order.tierName}</span>
                            <span className="text-xs text-[#86868B] block">{order.qty} tiket</span>
                          </td>
                          <td>
                            <p className="font-semibold text-sm text-[#1D1D1F]">
                              {formatRupiah(order.totalAmount)}
                            </p>
                            <p className="text-[11px] text-[#86868B]">kode unik {order.uniqueCode}</p>
                          </td>
                          <td className="text-xs text-[#86868B]">
                            {formatDateTime(order.timestamp)}
                          </td>
                          <td>
                            {order.receiptUrl ? (
                              <button
                                onClick={() => setReceiptModal(order.receiptUrl)}
                                className="px-2.5 py-1.5 bg-blue-50 text-[#1173d4] hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Lihat
                              </button>
                            ) : (
                              <span className="text-xs text-[#86868B]">-</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(order.id)}
                                className="p-2 rounded-xl bg-green-50 text-[#22c55e] hover:bg-green-100 transition-colors"
                                title="Setujui dan Terbitkan E-Ticket"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(order.id)}
                                className="p-2 rounded-xl bg-red-50 text-[#FF3B30] hover:bg-red-100 transition-colors"
                                title="Tolak Pesanan"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Riwayat Pesanan */}
        {activeTab === 'riwayat' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#1173d4]" />
                Riwayat Pesanan
              </h2>
              <div className="flex flex-wrap gap-2">
                {HISTORY_FILTERS.map((f) => {
                  const count =
                    f.key === 'all'
                      ? orders.length
                      : orders.filter((o) => o.status === f.key).length;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setHistoryFilter(f.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        historyFilter === f.key
                          ? 'bg-[#1173d4] text-white shadow-sm'
                          : 'bg-white text-[#86868B] hover:text-[#1D1D1F] border border-black/5'
                      }`}
                    >
                      {f.label}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                          historyFilter === f.key ? 'bg-white/20' : 'bg-black/5'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="data-table w-full text-left">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Pelanggan</th>
                      <th>Tier &amp; Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#86868B]">
                          Tidak ada data pesanan
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-mono text-xs font-semibold text-[#1173d4]">{order.id}</td>
                          <td>
                            <div className="font-semibold text-sm text-[#1D1D1F]">{order.buyerName}</div>
                            <div className="text-xs text-[#86868B]">{order.email}</div>
                          </td>
                          <td>
                            <div className="text-xs font-medium text-[#1D1D1F]">{order.tierName}</div>
                            <div className="text-xs text-[#86868B]">{order.qty} tiket</div>
                          </td>
                          <td className="font-semibold text-sm text-[#1D1D1F]">
                            {formatRupiah(order.totalAmount)}
                          </td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="text-[#86868B] text-xs">
                            {formatDateTime(order.timestamp)}
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

        {/* Tab: Kelola Pengguna (User Management) [NEW!] */}
        {activeTab === 'pengguna' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase">Total Pengguna</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1173d4] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1D1D1F] mt-2">{customers.length}</p>
                <p className="text-xs text-[#86868B] mt-1">Pelanggan terdaftar</p>
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
                <p className="text-xs text-[#86868B] mt-1">Bisa login & beli tiket</p>
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
                  className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
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
                      <th>Nama & Email</th>
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
                              {/* Edit Modal */}
                              <button
                                onClick={() => setEditCustomerModal({ ...cust })}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1D1D1F] transition-colors"
                                title="Edit Data Pengguna"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setResetPwdModal(cust);
                                  setNewPasswordVal('password123');
                                }}
                                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1173d4] transition-colors"
                                title="Reset Kata Sandi"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Toggle Block / Unblock */}
                              <button
                                onClick={() => handleToggleStatus(cust)}
                                className={`p-2 rounded-xl transition-colors ${
                                  cust.status === 'active'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                                    : 'bg-green-50 hover:bg-green-100 text-green-600'
                                }`}
                                title={cust.status === 'active' ? 'Blokir Akun' : 'Aktifkan Akun'}
                              >
                                <Ban className="w-4 h-4" />
                              </button>

                              {/* Delete Account */}
                              <button
                                onClick={() => handleDeleteCust(cust)}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#FF3B30] transition-colors"
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

        {/* Tab: Kelola Event */}
        {activeTab === 'kelola' && eventForm && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#1173d4]" />
                Konfigurasi Event &amp; Kuota Tiket
              </h2>
              <button
                onClick={handleSaveEvent}
                className="btn-primary py-2 px-4 text-xs sm:text-sm flex items-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Info Event */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider">
                  Informasi Dasar Event
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1">
                    Judul Event
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="input-field py-2 text-sm"
                  />
                </div>

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
                      Waktu Mulai
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
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
                    className="input-field py-2 text-sm resize-none"
                  />
                </div>
              </div>

              {/* Form Tier & Kuota */}
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider">
                  Kategori Tiket, Harga & Kuota
                </h3>

                <div className="space-y-4">
                  {tierForms.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="p-4 rounded-xl bg-[#F5F5F7] border border-black/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1D1D1F]">{tier.name}</span>
                        <span className="text-xs text-[#86868B]">Terjual: {tier.sold} tiket</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#86868B] mb-1">
                            Harga (Rp)
                          </label>
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                            className="input-field py-1.5 px-3 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#86868B] mb-1">
                            Total Kuota
                          </label>
                          <input
                            type="number"
                            value={tier.quota}
                            onChange={(e) => handleTierChange(idx, 'quota', e.target.value)}
                            className="input-field py-1.5 px-3 text-sm bg-white"
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
                          onChange={(e) => handleTierChange(idx, 'description', e.target.value)}
                          className="input-field py-1.5 px-3 text-sm bg-white"
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

      {/* Modal Tambah Pelanggan */}
      {addCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
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

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Contoh: Rina Anggraini"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="rina@gmail.com"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
                  Nomor WhatsApp *
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
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
                  Kata Sandi Awal
                </label>
                <input
                  type="text"
                  value={newCustPassword}
                  onChange={(e) => setNewCustPassword(e.target.value)}
                  placeholder="Default: password123"
                  className="input-field py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
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

      {/* Modal Edit Pelanggan */}
      {editCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
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

            <form onSubmit={handleEditCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
                  Email (Tidak dapat diubah)
                </label>
                <input
                  type="text"
                  disabled
                  value={editCustomerModal.email}
                  className="input-field py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
                  Nama Lengkap *
                </label>
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
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={editCustomerModal.whatsapp || ''}
                  onChange={(e) =>
                    setEditCustomerModal({ ...editCustomerModal, whatsapp: e.target.value })
                  }
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase mb-1">
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
                  placeholder="Kata sandi baru"
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
