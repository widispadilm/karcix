import { useMemo, useState } from 'react';
import { Ticket, Wallet, Package, Download, Search, Users, BarChart3, UserCheck } from 'lucide-react';
import { useAppState } from '../../store/appStore';
import { formatRupiah, ORDER_STATUS } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

/** Bungkus nilai untuk CSV: gandakan tanda kutip dan hindari formula injection. */
function csvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function PromotorDashboard() {
  const { event, orders } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');

  const paidOrders = useMemo(
    () => orders.filter((o) => o.status === ORDER_STATUS.PAID),
    [orders]
  );

  const ticketsSold = paidOrders.reduce((sum, order) => sum + order.qty, 0);
  const grossRevenue = paidOrders.reduce(
    (sum, order) => sum + order.unitPrice * order.qty,
    0
  );
  const checkedIn = paidOrders.filter((o) => o.checkedIn).length;

  const remainingQuota = useMemo(
    () => event.tiers.reduce((sum, tier) => sum + (tier.quota - tier.sold), 0),
    [event.tiers]
  );

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return paidOrders;
    const lower = searchTerm.toLowerCase();
    return paidOrders.filter(
      (o) =>
        o.buyerName.toLowerCase().includes(lower) || o.email.toLowerCase().includes(lower)
    );
  }, [paidOrders, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Nama', 'Email', 'WhatsApp', 'Tier', 'Qty', 'Total', 'Status', 'Check-in'];
    const rows = paidOrders.map((o) =>
      [
        o.id,
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

    // BOM supaya Excel membaca karakter non-ASCII dengan benar.
    const blob = new Blob(['﻿' + [headers.map(csvCell).join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'karcix-buyers-export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // versi lama membiarkan object URL menggantung
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
          <p className="text-[#86868B]">Overview &amp; analytics untuk {event.title}</p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary inline-flex items-center gap-2 self-start">
          <Download size={18} />
          Export CSV
        </button>
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
          Performa Tiket per Kategori
        </h2>
        <div className="space-y-6">
          {event.tiers?.map((tier) => {
            const percentage = tier.quota > 0 ? (tier.sold / tier.quota) * 100 : 0;
            return (
              <div key={tier.id}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tier.color }}
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
                <div className="h-2 bg-gray-200 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: tier.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data pembeli */}
      <div className="glass-card z-depth-1 p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} className="text-[#1173d4]" />
            Data Pembeli
          </h2>
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="search"
              placeholder="Cari nama atau email..."
              aria-label="Cari pembeli"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full text-left">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Tier</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.buyerName}</td>
                    <td className="text-[#86868B] text-sm">{order.email}</td>
                    <td className="text-[#86868B] text-sm">{order.whatsapp}</td>
                    <td className="text-[#86868B] text-sm">{order.tierName}</td>
                    <td className="text-[#86868B]">{order.qty}</td>
                    <td>
                      <StatusBadge
                        status={order.checkedIn ? 'checked-in' : order.status}
                        label={order.checkedIn ? 'Checked In' : undefined}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#86868B]">
                    {paidOrders.length === 0
                      ? 'Belum ada pesanan yang lunas.'
                      : 'Tidak ada data pembeli yang sesuai pencarian.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
