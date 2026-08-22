import React, { useState, useEffect } from 'react';
import { ScanLine, CheckCircle2, XCircle, AlertOctagon, Keyboard, Zap, Users, Ticket, Shield } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../store/appStore';

const GateScannerPage = () => {
  const { event, orders } = useAppState();
  const dispatch = useAppDispatch();
  
  const [manualTicketId, setManualTicketId] = useState('');
  const [scanResult, setScanResult] = useState(null); // { type: 'valid' | 'used' | 'invalid', order?: object }

  // Auto-dismiss result overlay
  useEffect(() => {
    let timer;
    if (scanResult) {
      timer = setTimeout(() => {
        setScanResult(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [scanResult]);

  const handleScan = (e) => {
    e.preventDefault();
    const inputId = manualTicketId.trim();
    if (!inputId) return;

    // Search order ignoring case
    const foundOrder = orders.find(o => o.ticketId?.toLowerCase() === inputId.toLowerCase());

    if (foundOrder && foundOrder.status === 'paid') {
      if (!foundOrder.checkedIn) {
        // Valid & Not checked in
        dispatch({ type: 'CHECK_IN', payload: { ticketId: foundOrder.ticketId } });
        setScanResult({ type: 'valid', order: foundOrder });
      } else {
        // Already checked in
        setScanResult({ type: 'used', order: foundOrder });
      }
    } else {
      // Not found or not paid
      setScanResult({ type: 'invalid' });
    }

    setManualTicketId('');
  };

  const totalPaid = orders.filter(o => o.status === 'paid').length;
  const totalCheckedIn = orders.filter(o => o.checkedIn === true).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] p-4 flex flex-col max-w-md mx-auto relative animate-fade-in">
      
      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center justify-center gap-2">
          <span className="text-[#202124]">Karci</span><span className="text-[#1a73e8]">x</span>
          <span className="bg-blue-50 text-[#1a73e8] text-xs px-2 py-0.5 border border-blue-200">GATE</span>
        </h1>
        <p className="text-sm text-[#5f6368] truncate px-4">{event?.name}</p>
      </div>

      {/* Scanner Viewfinder */}
      <div className="scanner-viewfinder mx-auto w-64 h-64 border-2 border-gray-300 relative overflow-hidden bg-white mb-8 flex items-center justify-center z-depth-1">
        {/* Animated Scan Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#1a73e8] animate-scan-line shadow-[0_0_8px_rgba(26,115,232,0.8)] z-10"></div>
        
        {/* Corner Decorators via CSS typically, but we can do inline if CSS class is minimal */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1a73e8] m-2"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1a73e8] m-2"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1a73e8] m-2"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1a73e8] m-2"></div>
        
        <p className="text-[#5f6368] text-sm font-medium z-0 flex flex-col items-center gap-2">
          <ScanLine size={32} className="opacity-50" />
          Arahkan ke QR Code
        </p>
      </div>

      {/* Manual Input */}
      <div className="glass-card bg-white z-depth-1 p-5 mt-auto mb-6">
        <label className="block text-sm text-[#5f6368] mb-3 flex items-center gap-2">
          <Keyboard size={16} />
          Atau masukkan Ticket ID manual:
        </label>
        <form onSubmit={handleScan} className="flex gap-3">
          <input 
            type="text" 
            value={manualTicketId}
            onChange={(e) => setManualTicketId(e.target.value)}
            placeholder="Contoh: TKX-12345"
            className="input-field flex-1 text-center font-mono uppercase tracking-wider"
            autoComplete="off"
          />
          <button type="submit" className="btn-accent px-6 font-semibold whitespace-nowrap shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            Verifikasi
          </button>
        </form>
      </div>

      {/* Stats Footer */}
      <div className="glass-card bg-white z-depth-1 p-3 flex justify-between items-center text-sm border-t border-gray-200 mt-auto">
        <div className="flex items-center gap-2 text-[#5f6368]">
          <Users size={16} className="text-[#1a73e8]" />
          <span>Checked In: <strong className="text-[#202124]">{totalCheckedIn}</strong> / {totalPaid}</span>
        </div>
        <div className="flex items-center gap-2 text-[#5f6368]">
          <Zap size={14} />
          <span>Live</span>
        </div>
      </div>

      {/* Overlays */}
      {scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          {scanResult.type === 'valid' && (
            <div className="bg-green-50/95 absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
              <CheckCircle2 size={100} className="text-green-500 animate-bounce-in mb-6" />
              <h2 className="text-5xl font-black text-green-700 tracking-tight mb-2 drop-shadow-md">VALID</h2>
              <div className="bg-white px-6 py-4 text-center border border-green-300 z-depth-3 min-w-[280px]">
                <p className="text-2xl font-bold text-green-900 mb-1">{scanResult.order.buyerName}</p>
                <div className="flex items-center justify-center gap-2 text-green-700 mb-4 bg-green-100 py-1 px-3 inline-flex">
                  <Ticket size={16} />
                  <span className="font-semibold">{scanResult.order.tierName}</span>
                </div>
                <h3 className="text-3xl font-extrabold text-[#1a73e8] mt-4 tracking-wide uppercase">
                  SELAMAT DATANG!
                </h3>
              </div>
            </div>
          )}

          {scanResult.type === 'used' && (
            <div className="bg-amber-50/95 absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
              <AlertOctagon size={100} className="text-amber-500 animate-shake mb-6" />
              <h2 className="text-4xl font-black text-amber-700 tracking-tight mb-2 text-center drop-shadow-md leading-none">SUDAH<br/>CHECK-IN</h2>
              <div className="bg-white px-6 py-5 text-center border border-amber-300 z-depth-3 mt-4 min-w-[280px]">
                <p className="text-xl font-bold text-amber-900 mb-1">{scanResult.order.buyerName}</p>
                <p className="text-amber-700 mt-2 font-medium flex items-center justify-center gap-2">
                  <Shield size={18} />
                  Tiket sudah digunakan
                </p>
              </div>
            </div>
          )}

          {scanResult.type === 'invalid' && (
            <div className="bg-red-50/95 absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
              <XCircle size={100} className="text-red-500 animate-shake mb-6" />
              <h2 className="text-4xl font-black text-red-700 tracking-tight mb-2 drop-shadow-md">TIDAK VALID</h2>
              <div className="bg-white px-6 py-4 text-center border border-red-300 z-depth-3 mt-4 min-w-[280px]">
                <p className="text-red-700 font-medium text-lg">Tiket tidak ditemukan</p>
                <p className="text-red-600 text-sm mt-1">atau pembayaran belum lunas</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GateScannerPage;
