import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Keyboard,
  Zap,
  Users,
  Ticket,
  Shield,
  Camera,
  RefreshCw,
  SwitchCamera,
  Volume2,
  VolumeX,
  Clock,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useAppState, useAppDispatch } from '../../store/appStore';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router';

// Audio feedback using Web Audio API
function playSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'valid') {
      // Happy double high beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'used') {
      // Warning double tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Low buzz for invalid
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Ignore audio error
  }
}

export default function GateScannerPage() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const { event, orders } = useAppState();
  const dispatch = useAppDispatch();

  const [manualTicketId, setManualTicketId] = useState('');
  const [scanResult, setScanResult] = useState(null); // { type: 'valid' | 'used' | 'invalid', order?: object, code?: string }
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [recentScans, setRecentScans] = useState([]);

  const scannerRef = useRef(null);
  const isProcessingScanRef = useRef(false);

  const processTicketCode = useCallback(
    (code) => {
      if (!code) return;
      const cleanCode = code.trim();

      // Search order by ticketId or id
      const foundOrder = orders.find(
        (o) =>
          o.ticketId?.toLowerCase() === cleanCode.toLowerCase() ||
          o.id?.toLowerCase() === cleanCode.toLowerCase()
      );

      let result = null;
      if (foundOrder && foundOrder.status === 'paid') {
        if (!foundOrder.checkedIn) {
          // Valid & Not checked in yet
          dispatch({ type: 'CHECK_IN', payload: { ticketId: foundOrder.ticketId || foundOrder.id } });
          result = { type: 'valid', order: foundOrder, code: cleanCode, time: new Date() };
          if (soundEnabled) playSound('valid');
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
          // Already checked in
          result = { type: 'used', order: foundOrder, code: cleanCode, time: new Date() };
          if (soundEnabled) playSound('used');
          if (navigator.vibrate) navigator.vibrate(200);
        }
      } else {
        // Not found or not paid
        result = { type: 'invalid', code: cleanCode, time: new Date() };
        if (soundEnabled) playSound('invalid');
        if (navigator.vibrate) navigator.vibrate([300]);
      }

      setScanResult(result);
      setRecentScans((prev) => [result, ...prev.slice(0, 4)]);
    },
    [orders, dispatch, soundEnabled]
  );

  // Auto dismiss result modal after 3 seconds
  useEffect(() => {
    let timer;
    if (scanResult) {
      isProcessingScanRef.current = true;
      timer = setTimeout(() => {
        setScanResult(null);
        isProcessingScanRef.current = false;
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [scanResult]);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore
        }
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      };

      await html5QrCode.start(
        { facingMode },
        config,
        (decodedText) => {
          if (!isProcessingScanRef.current) {
            isProcessingScanRef.current = true;
            processTicketCode(decodedText);
          }
        },
        () => {
          // Continuous frame parsing error, ignore
        }
      );

      setCameraActive(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda.'
          : 'Tidak dapat mengakses kamera perangkat Anda.'
      );
    }
  }, [facingMode, processTicketCode]);

  // Stop Camera
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize camera on mount, cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    stopCamera().then(() => {
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    });
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim()) return;
    processTicketCode(manualTicketId.trim());
    setManualTicketId('');
  };

  const totalPaid = orders.filter((o) => o.status === 'paid').length;
  const totalCheckedIn = orders.filter((o) => o.checkedIn === true).length;
  const percentage = totalPaid > 0 ? Math.round((totalCheckedIn / totalPaid) * 100) : 0;

  if (!currentUser || (currentUser.role !== 'gate' && currentUser.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#141416] text-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
          <ScanLine className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Akses Gate Scanner Terbatas</h1>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          Halaman ini khusus untuk staf Petugas Gate Karcix. Silakan masuk terlebih dahulu menggunakan akun staf Anda.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-outline text-xs sm:text-sm py-2.5 px-5 bg-white/5 border-white/10 text-white hover:bg-white/10">
            Kembali ke Beranda
          </Link>
          <Link to="/staff" className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
            <ScanLine className="w-4 h-4" /> Masuk Portal Staff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141416] text-white p-4 sm:p-6 flex flex-col max-w-lg mx-auto relative animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/staff"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Portal Staff
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            title="Keluar dari akun staff"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleCameraFacing}
            className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Ganti Kamera (Depan/Belakang)"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white transition-colors"
            title={cameraActive ? 'Jeda Kamera' : 'Mulai Kamera'}
          >
            <RefreshCw className={`w-4 h-4 ${cameraActive ? 'text-emerald-400' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>GATE SCANNER AKTIF</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">{event?.title || 'Karcix Gate'}</h1>
        <p className="text-xs text-gray-400 truncate px-4">{event?.location || 'Gate Pintu Masuk'}</p>
      </div>

      {/* Scanner Viewfinder Box */}
      <div className="relative mx-auto w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl mb-5 flex items-center justify-center">
        {/* Live Camera Container */}
        <div
          id="qr-reader-container"
          className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
        />

        {/* Scan Animation Overlay */}
        {cameraActive && !cameraError && (
          <>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 animate-scan-line shadow-[0_0_12px_rgba(52,211,153,0.9)] z-10 pointer-events-none" />
            <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg pointer-events-none z-10" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg pointer-events-none z-10" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg pointer-events-none z-10" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg pointer-events-none z-10" />
          </>
        )}

        {/* Camera Off / Error Fallback */}
        {(!cameraActive || cameraError) && (
          <div className="absolute inset-0 bg-[#1C1C1E] flex flex-col items-center justify-center p-6 text-center z-20">
            <Camera className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-sm font-semibold text-gray-200">
              {cameraError || 'Kamera sedang dinonaktifkan'}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Pastikan Anda mengizinkan akses kamera browser.
            </p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Aktifkan Kamera
            </button>
          </div>
        )}
      </div>

      {/* Manual Input Form */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 mb-4 shadow-lg">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-blue-400" />
          Atau Masukkan Ticket ID Manual:
        </label>
        <form onSubmit={handleManualScan} className="flex gap-2">
          <input
            type="text"
            value={manualTicketId}
            onChange={(e) => setManualTicketId(e.target.value)}
            placeholder="Contoh: TKX-12345"
            className="flex-1 bg-[#2C2C2E] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase tracking-wider focus:outline-none focus:border-blue-500"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            Verifikasi
          </button>
        </form>
      </div>

      {/* Stats Counter */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Check-In</p>
            <p className="text-lg font-bold text-white">
              {totalCheckedIn}{' '}
              <span className="text-xs font-normal text-gray-400">/ {totalPaid} Tiket</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-400">{percentage}%</span>
          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Scans Log */}
      {recentScans.length > 0 && (
        <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Riwayat Scan Terakhir
          </p>
          <div className="space-y-2">
            {recentScans.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-2 truncate">
                  {s.type === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {s.type === 'used' && <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />}
                  {s.type === 'invalid' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className="font-medium text-white truncate">
                    {s.order?.buyerName || s.code}
                  </span>
                  {s.order?.tierName && (
                    <span className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
                      {s.order.tierName}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    s.type === 'valid'
                      ? 'text-emerald-400'
                      : s.type === 'used'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {s.type === 'valid' ? 'VALID' : s.type === 'used' ? 'SUDAH MASUK' : 'TIDAK VALID'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Overlay Feedback */}
      {scanResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setScanResult(null)}
        >
          {scanResult.type === 'valid' && (
            <div className="bg-emerald-950/95 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-4 animate-bounce-in" />
              <h2 className="text-3xl font-black text-emerald-400 tracking-tight mb-2">
                TIKET VALID
              </h2>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 my-4 text-left">
                <p className="text-xs text-gray-400">Nama Pengunjung</p>
                <p className="text-lg font-bold text-white mb-2">{scanResult.order.buyerName}</p>

                <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                  <span className="text-gray-400">Kategori:</span>
                  <span className="font-semibold text-emerald-400">{scanResult.order.tierName}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">Jumlah:</span>
                  <span className="font-semibold text-white">{scanResult.order.qty} Tiket</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">Kode:</span>
                  <span className="font-mono text-gray-300">{scanResult.code}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                ✓ Silakan Masuk!
              </p>
            </div>
          )}

          {scanResult.type === 'used' && (
            <div className="bg-amber-950/95 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
              <AlertOctagon className="w-20 h-20 text-amber-400 mx-auto mb-4 animate-shake" />
              <h2 className="text-2xl font-black text-amber-400 tracking-tight mb-2">
                SUDAH CHECK-IN
              </h2>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 my-4 text-left">
                <p className="text-xs text-gray-400">Atas Nama</p>
                <p className="text-base font-bold text-white mb-1">{scanResult.order.buyerName}</p>
                <p className="text-xs text-amber-400 flex items-center gap-1 mt-2">
                  <Shield className="w-3.5 h-3.5" /> Tiket ini sudah pernah di-scan sebelumnya.
                </p>
              </div>
              <p className="text-xs text-gray-400">Tolak masuk atau periksa identitas.</p>
            </div>
          )}

          {scanResult.type === 'invalid' && (
            <div className="bg-red-950/95 border border-red-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4 animate-shake" />
              <h2 className="text-2xl font-black text-red-400 tracking-tight mb-2">
                TIDAK VALID
              </h2>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 my-4 text-center">
                <p className="text-sm text-red-300 font-semibold">Tiket tidak ditemukan</p>
                <p className="text-xs text-gray-400 mt-1">atau status pembayaran belum lunas.</p>
                <p className="font-mono text-xs text-gray-400 mt-2 bg-black/40 py-1 px-2 rounded">
                  {scanResult.code}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
