import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../data/mockData';

const STYLES = {
  [ORDER_STATUS.PENDING]: { className: 'badge-pending', dot: 'bg-[#FF9500]' },
  [ORDER_STATUS.PAID]: { className: 'badge-paid', dot: 'bg-[#34C759]' },
  [ORDER_STATUS.CANCELLED]: { className: 'badge-cancelled', dot: 'bg-[#FF3B30]' },
  [ORDER_STATUS.EXPIRED]: { className: 'badge-expired', dot: 'bg-[#86868B]' },
  'checked-in': { className: 'badge-checked-in', dot: 'bg-[#1173d4]' },
};

const FALLBACK = { className: 'badge-neutral', dot: 'bg-[#D1D1D6]' };

/** Satu-satunya sumber tampilan status pesanan — dipakai admin, promotor, dan customer. */
export default function StatusBadge({ status, label }) {
  const key = status?.toLowerCase();
  const style = STYLES[key] || FALLBACK;
  const text = label || ORDER_STATUS_LABEL[key] || status || 'Tidak diketahui';

  return (
    <span className={`badge ${style.className} w-fit`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {text}
    </span>
  );
}
