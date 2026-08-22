import { useEffect, useMemo, useState } from 'react';
import {
  Shield, ClipboardList, Settings, CheckCircle, XCircle, Eye, Save,
  Image as ImageIcon, AlertTriangle, Inbox, X, Ticket, RotateCcw,
} from 'lucide-react';
import { useAppState, useAppDispatch, clearState } from '../../store/appStore';
import {
  formatRupiah,
  formatDateTime,
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
  { key: 'kelola', label: 'Kelola Event', icon: Settings },
];

/** `datetime-local` hanya menerima format YYYY-MM-DDTHH:mm. */
const toDateTimeLocal = (value) => (value ? value.slice(0, 16) : '');

export default function AdminDashboard() {
  const { event, orders } = useAppState();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState('verifikasi');
  const [toast, setToast] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');

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

  // Semua status disimpan lowercase lewat konstanta ORDER_STATUS. Versi lama
  // membandingkan dengan 'Pending'/'Paid', sehingga tab ini selalu kosong.
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
    // Kuota tidak boleh turun di bawah jumlah yang sudah terjual.
    const invalid = tierForms.find((t) => Number(t.quota) < t.sold);
    if (invalid) {
      showToast(
        `Kuota ${invalid.name} tidak boleh kurang dari ${invalid.sold} tiket yang sudah terjual.`,
        'error'
      );
      return;
    }

    dispatch({ type: 'UPDATE_EVENT', payload: eventForm });
    tierForms.forEach((tier) => {
      dispatch({
        type: 'UPDATE_TIER',
        payload: {
          tierId: tier.id,
          updates: {
            name: tier.name,
            price: Number(tier.price) || 0,
            quota: Number(tier.quota) || 0,
            description: tier.description,
          },
        },
      });
    });
    showToast('Perubahan berhasil disimpan.');
  };

  const handleResetDemo = () => {
    if (!window.confirm('Kembalikan seluruh data demo ke kondisi awal?')) return;
    clearState();
    dispatch({ type: 'RESET' });
    showToast('Data demo dikembalikan ke kondisi awal.');
  };

  if (!eventForm) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-[#86868B] mt-1">Kelola pesanan dan konfigurasi event Karcix</p>
          </div>
          <button
            onClick={handleResetDemo}
            className="btn-outline inline-flex items-center gap-2 self-start"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data Demo
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-[#1173d4] text-[#1173d4]'
                  : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.key === 'verifikasi' && pendingOrders.length > 0 && (
                <span className="ml-1 bg-[#1173d4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: verifikasi */}
        {activeTab === 'verifikasi' &&
          (pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#86868B]">
              <Inbox className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Tidak ada pesanan yang perlu diverifikasi</p>
              <p className="text-sm mt-1">
                Pesanan muncul di sini setelah pembeli mengunggah bukti transfer.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#1173d4]" />
                  Menunggu Verifikasi
                </h2>
                <span className="bg-blue-50 text-[#1173d4] px-3 py-1 rounded-full text-sm font-medium">
                  {pendingOrders.length} Pesanan
                </span>
              </div>

              <div className="glass-card z-depth-1 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table w-full text-left">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Nama</th>
                        <th>Tier</th>
                        <th>Total</th>
                        <th>Waktu</th>
                        <th className="text-center">Bukti</th>
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-mono text-[#1173d4]">{order.id}</td>
                          <td>
                            <div>{order.buyerName}</div>
                            <div className="text-xs text-[#86868B]">{order.email}</div>
                          </td>
                          <td>
                            <div>{order.tierName}</div>
                            <div className="text-xs text-[#86868B]">{order.qty} tiket</div>
                          </td>
                          <td className="font-medium">
                            {formatRupiah(order.totalAmount)}
                            <div className="text-xs text-[#86868B]">
                              kode unik {order.uniqueCode}
                            </div>
                          </td>
                          <td className="text-[#86868B]">{formatDateTime(order.timestamp)}</td>
                          <td className="text-center">
                            <button
                              onClick={() => setReceiptModal(order.receiptUrl)}
                              className="w-10 h-14 rounded bg-gray-50 hover:ring-2 hover:ring-[#1173d4] transition-all flex items-center justify-center mx-auto overflow-hidden relative group"
                              title="Lihat bukti transfer"
                            >
                              <img
                                src={order.receiptUrl}
                                alt="Bukti transfer"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </span>
                            </button>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApprove(order.id)}
                                className="p-2 rounded-lg bg-green-100 text-[#137333] hover:bg-green-200 transition-colors"
                                title="Setujui"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(order.id)}
                                className="p-2 rounded-lg bg-red-100 text-[#C5221F] hover:bg-red-200 transition-colors"
                                title="Tolak"
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
            </div>
          ))}

        {/* Tab: riwayat */}
        {activeTab === 'riwayat' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-[#1173d4]" />
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        historyFilter === f.key
                          ? 'bg-[#1173d4] text-white'
                          : 'bg-white text-[#86868B] hover:text-[#1D1D1F] border border-black/5'
                      }`}
                    >
                      {f.label}
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
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

            <div className="glass-card z-depth-1 overflow-hidden">
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
                          <td className="font-mono text-[#1173d4]">{order.id}</td>
                          <td>
                            <div className="font-medium">{order.buyerName}</div>
                            <div className="text-xs text-[#86868B]">{order.email}</div>
                          </td>
                          <td>
                            <div>{order.tierName}</div>
                            <div className="text-xs text-[#86868B]">{order.qty} tiket</div>
                          </td>
                          <td className="font-medium">{formatRupiah(order.totalAmount)}</td>
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

        {/* Tab: kelola */}
        {activeTab === 'kelola' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#1173d4]" />
                Kelola Event
              </h2>
              <button onClick={handleSaveEvent} className="btn-primary inline-flex items-center gap-2">
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>

            <div className="glass-card z-depth-1 p-6">
              <h3 className="text-lg font-medium mb-4 border-b border-gray-200 pb-2">
                Informasi Utama
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'title', label: 'Judul Event' },
                  { key: 'subtitle', label: 'Subjudul / Artis' },
                  { key: 'location', label: 'Lokasi / Venue' },
                  { key: 'date', label: 'Tanggal & Waktu', type: 'datetime-local' },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label htmlFor={field.key} className="text-sm font-medium text-[#86868B]">
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      type={field.type || 'text'}
                      value={eventForm[field.key]}
                      onChange={(e) =>
                        setEventForm((f) => ({ ...f, [field.key]: e.target.value }))
                      }
                      className="input-field"
                    />
                  </div>
                ))}

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium text-[#86868B]">
                    Alamat Lengkap
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={eventForm.address}
                    onChange={(e) => setEventForm((f) => ({ ...f, address: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium text-[#86868B]">
                    Deskripsi Event
                  </label>
                  <textarea
                    id="description"
                    rows="4"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#1173d4]" />
                Manajemen Tier Tiket
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tierForms.map((tier, index) => {
                  const quota = Number(tier.quota) || 0;
                  const percentage = quota > 0 ? Math.min(100, (tier.sold / quota) * 100) : 0;
                  const belowSold = quota < tier.sold;

                  return (
                    <div key={tier.id} className="glass-card z-depth-1 p-5 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ backgroundColor: tier.color || '#1173d4' }}
                      />

                      <div className="space-y-4 mt-2">
                        <div className="space-y-1">
                          <label className="text-xs text-[#86868B]">Nama Tier</label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                            className="input-field py-1.5 px-3 text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-[#86868B]">Harga (Rp)</label>
                          <input
                            type="number"
                            min="0"
                            value={tier.price}
                            onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                            className="input-field py-1.5 px-3 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-[#86868B]">Kuota Total</label>
                            <input
                              type="number"
                              min={tier.sold}
                              value={tier.quota}
                              onChange={(e) => handleTierChange(index, 'quota', e.target.value)}
                              className={`input-field py-1.5 px-3 text-sm ${
                                belowSold ? 'border-[#FF3B30]' : ''
                              }`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-[#86868B]">Terjual</label>
                            <div className="input-field py-1.5 px-3 text-sm bg-gray-50 border-dashed flex items-center">
                              {tier.sold} / {quota}
                            </div>
                          </div>
                        </div>

                        {belowSold && (
                          <p className="text-xs text-[#FF3B30]">
                            Kuota lebih kecil dari jumlah terjual.
                          </p>
                        )}

                        <div className="pt-2">
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-1.5"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: tier.color || '#1173d4',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2 z-depth-2 px-4 py-3 rounded-xl border ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
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
            className="relative max-w-lg w-full bg-white rounded-2xl z-depth-3 overflow-hidden border border-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#1173d4]" />
                Bukti Pembayaran
              </h3>
              <button
                onClick={() => setReceiptModal(null)}
                aria-label="Tutup"
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={receiptModal}
              alt="Bukti transfer"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
