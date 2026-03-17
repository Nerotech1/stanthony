import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import MassSacramentsPage from "./pages/MassSacramentsPage";
import SermonsPage from "./pages/SermonsPage";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPages from "./pages/admin/AdminPages";
import AdminSections from "./pages/admin/AdminSections";
import AdminSermons from "./pages/admin/AdminSermons";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminClergy from "./pages/admin/AdminClergy";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminSettings from "./pages/admin/AdminSettings";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-warm-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/mass-sacraments" element={<PublicLayout><MassSacramentsPage /></PublicLayout>} />
            <Route path="/sermons" element={<PublicLayout><SermonsPage /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/donate" element={<PublicLayout><DonatePage /></PublicLayout>} />

            {/* Admin Login - No protection needed */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pages" element={
              <ProtectedRoute>
                <AdminLayout><AdminPages /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/sections" element={
              <ProtectedRoute>
                <AdminLayout><AdminSections /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/sermons" element={
              <ProtectedRoute>
                <AdminLayout><AdminSermons /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute>
                <AdminLayout><AdminEvents /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/gallery" element={
              <ProtectedRoute>
                <AdminLayout><AdminGallery /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/messages" element={
              <ProtectedRoute>
                <AdminLayout><AdminMessages /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
              <ProtectedRoute>
                <AdminLayout><AdminAnnouncements /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/clergy" element={
              <ProtectedRoute>
                <AdminLayout><AdminClergy /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/donations" element={
              <ProtectedRoute>
                <AdminLayout><AdminDonations /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminLayout><AdminSettings /></AdminLayout>
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
