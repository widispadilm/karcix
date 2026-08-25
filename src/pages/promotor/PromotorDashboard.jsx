import { useMemo, useState } from 'react';
import { Ticket, Wallet, Package, Download, Search, Users, BarChart3, UserCheck, Layers } from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatRupiah, ORDER_STATUS, INITIAL_EVENTS } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

/** Bungkus nilai untuk CSV: gandakan tanda kutip dan hindari formula injection. */
function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function PromotorDashboard() {
  const { events, event, orders } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');

  const allEvents = useMemo(() => {
    return events && events.length > 0 ? events : (event ? [event] : INITIAL_EVENTS);
  }, [events, event]);

  const activeEvent = useMemo(() => {
    if (selectedEventId === 'all') return null;
    return allEvents.find((e) => e.id === selectedEventId) || allEvents[0];
  }, [allEvents, selectedEventId]);

  const relevantOrders = useMemo(() => {
    if (selectedEventId === 'all') return orders;
    return orders.filter((o) => {
      if (o.eventId) return o.eventId === selectedEventId;
      // Match by tier
      return activeEvent?.tiers?.some((t) => t.id === o.tierId);
    });
  }, [orders, selectedEventId, activeEvent]);

  const paidOrders = useMemo(
    () => relevantOrders.filter((o) => o.status === ORDER_STATUS.PAID),
    [relevantOrders]
  );

  const ticketsSold = paidOrders.reduce((sum, order) => sum + order.qty, 0);
  const grossRevenue = paidOrders.reduce(
    (sum, order) => sum + (order.unitPrice || 0) * (order.qty || 1),
    0
  );
  const checkedIn = paidOrders.filter((o) => o.checkedIn).length;

  const remainingQuota = useMemo(() => {
    if (activeEvent) {
      return activeEvent.tiers?.reduce((sum, tier) => sum + (tier.quota - tier.sold), 0) || 0;
    }
    return allEvents.reduce((totalSum, evt) => {
      return totalSum + (evt.tiers?.reduce((sum, tier) => sum + (tier.quota - tier.sold), 0) || 0);
    }, 0);
  }, [activeEvent, allEvents]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return paidOrders;
    const lower = searchTerm.toLowerCase();
    return paidOrders.filter(
      (o) =>
        o.buyerName?.toLowerCase().includes(lower) || o.email?.toLowerCase().includes(lower)
    );
  }, [paidOrders, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Event', 'Nama', 'Email', 'WhatsApp', 'Tier', 'Qty', 'Total', 'Status', 'Check-in'];
    const rows = paidOrders.map((o) =>
      [
        o.id,
        o.eventTitle || activeEvent?.title || 'PENSI FEST 2026',
        o.buyerName,
        o.email,
        o.whatsapp,
        o.tierName,
        o.qty,
        o.totalAmount,
        o.status,
        o.checkedIn ? 'Ya' : 'Belum',
      ]
        .map(csvCell)
        .join(',')
    );

    const blob = new Blob(['\uFEFF' + [headers.map(csvCell).join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `karcix-buyers-${selectedEventId === 'all' ? 'all' : activeEvent?.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Tiket Terjual', value: ticketsSold, icon: Ticket, accent: 'border-l-[#34C759]', tint: 'bg-green-100 text-[#137333]' },
    { label: 'Pendapatan Kotor', value: formatRupiah(grossRevenue), icon: Wallet, accent: 'border-l-[#FF9500]', tint: 'bg-amber-100 text-[#B06000]' },
    { label: 'Sisa Kuota', value: remainingQuota, icon: Package, accent: 'border-l-[#1173d4]', tint: 'bg-blue-100 text-[#1173d4]' },
    { label: 'Sudah Check-In', value: `${checkedIn} / ${paidOrders.length}`, icon: UserCheck, accent: 'border-l-[#a855f7]', tint: 'bg-purple-100 text-[#7e22ce]' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen pb-20 animate-fade-in bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Promotor Dashboard</h1>
          <p className="text-[#86868B]">
            Overview &amp; analytics penjualan tiket {activeEvent ? activeEvent.title : 'Semua Event'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Event Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm text-xs font-semibold">
            <Layers className="w-4 h-4 text-[#1173d4]" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Event ({allEvents.length})</option>
              {allEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleExportCSV} className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-3.5 shadow-sm cursor-pointer">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card z-depth-1 p-6 flex items-center border-l-4 ${stat.accent} animate-slide-up`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`p-4 rounded-xl mr-4 ${stat.tint}`}>
              <stat.icon size={28} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#86868B] mb-1">{stat.label}</p>
              <p className="text-2xl font-bold truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Per tier */}
      <div className="glass-card z-depth-1 p-6 mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-[#1173d4]" />
          Performa Tiket per Kategori {activeEvent ? `(${activeEvent.title})` : ''}
        </h2>
        <div className="space-y-6">
          {(activeEvent ? activeEvent.tiers : allEvents.flatMap((e) => e.tiers || []))?.map((tier, idx) => {
            const percentage = tier.quota > 0 ? (tier.sold / tier.quota) * 100 : 0;
            return (
              <div key={tier.id || idx}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tier.color || '#3b82f6' }}
                    />
                    <span className="font-medium">{tier.name}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-[#86868B]">
                      {tier.sold} / {tier.quota} terjual
                    </span>
                    <span className="font-medium w-12 text-right tabular-nums">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#E5E5EA] h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: tier.color || '#1173d4',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daftar Pembeli */}
      <div className="glass-card z-depth-1 p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} className="text-[#1173d4]" />
            Daftar Pembeli Tiket Lunas ({filteredOrders.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1173d4] w-full sm:w-64 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F5F7] text-[#86868B] uppercase text-[11px] font-semibold border-b border-black/5">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Pembeli</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Check-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#86868B]">
                    Tidak ada data pembeli yang cocok
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#1173d4]">{o.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1D1D1F]">{o.buyerName}</p>
                      <p className="text-xs text-[#86868B]">{o.email}</p>
                    </td>
                    <td className="py-3 px-4 font-medium">{o.tierName}</td>
                    <td className="py-3 px-4 tabular-nums">{o.qty}</td>
                    <td className="py-3 px-4 font-bold">{formatRupiah(o.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          o.checkedIn
                            ? 'bg-green-100 text-[#137333]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {o.checkedIn ? 'Sudah' : 'Belum'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
