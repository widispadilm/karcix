import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin } from 'lucide-react';
import { formatDate } from '../data/mockData';
import StatusBadge from './StatusBadge';

export default function ETicket({ order, event }) {
  if (!order || !event) return null;

  return (
    <div className="eticket-card p-6 max-w-sm mx-auto animate-scale-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-bold text-lg text-[#1D1D1F]">{event.title}</h2>
        <p className="text-sm text-[#86868B]">{event.subtitle}</p>
      </div>

      <div className="border-t border-dashed border-gray-200 my-4" />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[#86868B] text-xs mb-1">Nama</p>
          <p className="text-[#1D1D1F] font-medium">{order.buyerName}</p>
        </div>
        <div>
          <p className="text-[#86868B] text-xs mb-1">Tier</p>
          <p className="text-[#1D1D1F] font-medium">{order.tierName}</p>
        </div>
        <div>
          <p className="text-[#86868B] text-xs mb-1">Jumlah</p>
          <p className="text-[#1D1D1F] font-medium">{order.qty} tiket</p>
        </div>
        <div>
          <p className="text-[#86868B] text-xs mb-1">Order ID</p>
          <p className="text-[#1D1D1F] font-mono text-xs truncate" title={order.id}>
            {order.id}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="bg-gray-50 p-4 rounded-xl mb-2">
          <QRCodeSVG
            value={order.ticketId || order.id}
            size={140}
            bgColor="transparent"
            fgColor="#1D1D1F"
            level="Q"
          />
        </div>
        <p className="font-mono text-sm text-[#1173d4]">{order.ticketId || '—'}</p>
      </div>

      {/* Check-in status */}
      <div className="flex justify-center mb-6">
        <StatusBadge
          status={order.checkedIn ? 'checked-in' : order.status}
          label={order.checkedIn ? 'Checked In' : 'Belum Check-In'}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-[#86868B]">
          <Calendar size={14} />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#86868B]">
          <MapPin size={14} />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );
}
