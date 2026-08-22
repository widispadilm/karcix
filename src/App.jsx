import { HashRouter, Routes, Route, Navigate } from 'react-router';
import Navbar from './components/Navbar';
import StaffGate from './components/StaffGate';
import EventPage from './pages/customer/EventPage';
import EventDetailPage from './pages/customer/EventDetailPage';
import SearchPage from './pages/customer/SearchPage';
import ProfilePage from './pages/customer/ProfilePage';
import HelpCenterPage from './pages/customer/HelpCenterPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import PaymentPage from './pages/customer/PaymentPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PromotorDashboard from './pages/promotor/PromotorDashboard';
import GateScannerPage from './pages/gate/GateScannerPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-pattern">
        {/* Navbar dirender sekali di sini; komponennya menyembunyikan diri
            pada halaman fokus (checkout, pembayaran, dashboard internal). */}
        <Navbar />

        <main>
          <Routes>
            {/* Customer */}
            <Route path="/" element={<EventPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/checkout/:tierId" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/status" element={<OrderStatusPage />} />
            <Route path="/confirmation" element={<OrderConfirmationPage />} />

            {/* Internal — dilindungi kode akses panitia */}
            <Route
              path="/admin"
              element={
                <StaffGate role="admin">
                  <AdminDashboard />
                </StaffGate>
              }
            />
            <Route
              path="/promotor"
              element={
                <StaffGate role="promotor">
                  <PromotorDashboard />
                </StaffGate>
              }
            />
            <Route
              path="/gate"
              element={
                <StaffGate role="gate">
                  <GateScannerPage />
                </StaffGate>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
