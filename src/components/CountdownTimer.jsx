import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * @param {object} props
 * @param {number} [props.minutes]   durasi awal
 * @param {'card'|'inline'} [props.variant]  `card` = kartu dengan lingkaran progres,
 *                                           `inline` = teks mm:ss untuk disisipkan dalam kalimat
 * @param {string} [props.className] kelas tambahan (dipakai pada kedua varian)
 * @param {() => void} [props.onExpired]
 */
export default function CountdownTimer({
  minutes = 15,
  variant = 'card',
  className = '',
  onExpired,
}) {
  const [totalSeconds, setTotalSeconds] = useState(minutes * 60);

  // Simpan callback di ref supaya interval tidak perlu dibuat ulang tiap detik.
  const onExpiredRef = useRef(onExpired);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  useEffect(() => {
    setTotalSeconds(minutes * 60);
    const interval = setInterval(() => {
      setTotalSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [minutes]);

  useEffect(() => {
    if (totalSeconds === 0) onExpiredRef.current?.();
  }, [totalSeconds]);

  const displayMinutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const displaySeconds = (totalSeconds % 60).toString().padStart(2, '0');
  const timeString = `${displayMinutes}:${displaySeconds}`;

  let textColorClass = 'text-[#1D1D1F]';
  if (totalSeconds === 0) textColorClass = 'text-[#FF3B30]';
  else if (totalSeconds <= 60) textColorClass = 'text-[#FF3B30] animate-pulse';
  else if (totalSeconds <= 300) textColorClass = 'text-[#FF9500]';

  if (variant === 'inline') {
    return (
      <span className={`font-mono tabular-nums ${textColorClass} ${className}`}>
        {totalSeconds > 0 ? timeString : '00:00'}
      </span>
    );
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (totalSeconds / (minutes * 60)) * circumference;

  let strokeClass = 'stroke-[#1173d4]';
  if (totalSeconds <= 60) strokeClass = 'stroke-[#FF3B30]';
  else if (totalSeconds <= 300) strokeClass = 'stroke-[#FF9500]';

  return (
    <div className={`flex flex-col items-center justify-center p-6 glass-card relative ${className}`}>
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
          <circle cx="64" cy="64" r={radius} className="stroke-black/5 fill-none" strokeWidth="4" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-linear ${strokeClass}`}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col items-center justify-center z-10">
          <Clock size={24} className={`mb-1 ${textColorClass}`} />
          {totalSeconds > 0 ? (
            <span className={`text-2xl font-mono font-bold tabular-nums ${textColorClass}`}>
              {timeString}
            </span>
          ) : (
            <span className={`text-sm font-bold ${textColorClass} text-center leading-tight px-2`}>
              Waktu Habis!
            </span>
          )}
        </div>
      </div>

      <p className="text-[#86868B] text-sm text-center max-w-[200px]">
        {totalSeconds > 0
          ? 'Selesaikan pembayaran sebelum waktu habis'
          : 'Waktu pembayaran telah melewati batas'}
      </p>
    </div>
  );
}
