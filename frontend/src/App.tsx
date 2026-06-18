import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ServiceList } from './pages/ServiceList';
import { ServiceDetail } from './pages/ServiceDetail';
import { Dashboard } from './pages/Dashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderServices } from './pages/ProviderServices';
import { AdminDashboard } from './pages/AdminDashboard';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { Footer } from './components/Footer';

const RoleDashboard = () => {
  const { user, loading } = useAuth();
  const role = user?.role?.toLowerCase();

  if (loading) {
    return <div className="container mx-auto p-8">Loading dashboard...</div>;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'provider') {
    return <ProviderDashboard />;
  }

  return <Dashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServiceList />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/dashboard" element={<RoleDashboard />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/services" element={<ProviderServices />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}
