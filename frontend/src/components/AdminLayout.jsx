import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Image, Layers, MessageSquare, 
  Video, CalendarDays, Settings, LogOut, Menu, X, Cross, ChevronDown,
  Users, Megaphone, DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/pages', label: 'Pages', icon: FileText },
    { path: '/admin/sections', label: 'Sections', icon: Layers },
    { path: '/admin/sermons', label: 'Sermons', icon: Video },
    { path: '/admin/events', label: 'Events', icon: CalendarDays },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
    { path: '/admin/clergy', label: 'Clergy', icon: Users },
    { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/donations', label: 'Donations', icon: DollarSign },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-warm-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-warm-100 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-stone-warm-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-stone-warm-200">
          <Link to="/" className="flex items-center gap-3" data-testid="admin-logo">
            <Cross className="h-8 w-8 text-church-red flex-shrink-0" />
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-cinzel text-sm font-bold text-church-red leading-tight truncate">
                  St. Anthony
                </h1>
                <p className="text-xs text-church-gold font-dm-sans">Admin Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`admin-nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm-sans font-medium transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-church-red text-white'
                  : 'text-stone-warm-800 hover:bg-stone-warm-100'
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-stone-warm-200">
          {isSidebarOpen && (
            <div className="mb-3 px-3">
              <p className="text-sm font-dm-sans font-medium text-stone-warm-800 truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-church-red hover:bg-church-red/10"
            data-testid="logout-btn"
          >
            <LogOut size={20} className="mr-2" />
            {isSidebarOpen && 'Logout'}
          </Button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 m-4 rounded-lg bg-stone-warm-100 hover:bg-stone-warm-200 text-stone-warm-800"
          data-testid="toggle-sidebar-btn"
        >
          <ChevronDown className={`transform transition-transform ${isSidebarOpen ? 'rotate-90' : '-rotate-90'}`} size={20} />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-warm-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cross className="h-8 w-8 text-church-red" />
          <span className="font-cinzel text-sm font-bold text-church-red">Admin</span>
        </Link>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-church-red"
          data-testid="mobile-admin-menu-btn"
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-stone-warm-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cross className="h-8 w-8 text-church-red" />
            <span className="font-cinzel text-sm font-bold text-church-red">Admin Panel</span>
          </div>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 text-stone-warm-800">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm-sans font-medium transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-church-red text-white'
                  : 'text-stone-warm-800 hover:bg-stone-warm-100'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-warm-200">
          <div className="mb-3 px-3">
            <p className="text-sm font-dm-sans font-medium text-stone-warm-800">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-church-red hover:bg-church-red/10"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
