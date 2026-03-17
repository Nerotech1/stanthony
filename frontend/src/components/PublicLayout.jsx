import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cross, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../lib/api';

export const PublicLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res.data);
      } catch (e) {
        console.error('Error fetching settings:', e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/mass-sacraments', label: 'Mass & Sacraments' },
    { path: '/sermons', label: 'Sermons' },
    { path: '/events', label: 'Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact' },
    { path: '/donate', label: 'Donate' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-warm-50">
      {/* Top Bar */}
      <div className="bg-church-red text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href={`tel:${settings?.phone || ''}`} className="flex items-center gap-2 hover:text-church-gold transition-colors">
              <Phone size={14} />
              <span>{settings?.phone || '+234 XXX XXX XXXX'}</span>
            </a>
            <a href={`mailto:${settings?.email || ''}`} className="flex items-center gap-2 hover:text-church-gold transition-colors">
              <Mail size={14} />
              <span>{settings?.email || 'info@stanthonychurch.org'}</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            {settings?.social_links?.facebook && (
              <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-church-gold transition-colors">
                <Facebook size={16} />
              </a>
            )}
            {settings?.social_links?.instagram && (
              <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-church-gold transition-colors">
                <Instagram size={16} />
              </a>
            )}
            {settings?.social_links?.youtube && (
              <a href={settings.social_links.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-church-gold transition-colors">
                <Youtube size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-md' : 'bg-white/80 backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <Cross className="h-10 w-10 text-church-red" />
              <div className="hidden sm:block">
                <h1 className="font-cinzel text-lg font-bold text-church-red leading-tight">
                  {settings?.church_name || 'St. Anthony Catholic Church'}
                </h1>
                <p className="text-xs text-church-gold font-dm-sans">{settings?.tagline || 'AIT Alagbado, Lagos State'}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-4 py-2 text-sm font-dm-sans font-medium transition-colors rounded-md ${
                    location.pathname === link.path
                      ? 'text-church-red bg-church-red/10'
                      : 'text-stone-warm-800 hover:text-church-red hover:bg-stone-warm-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Admin Link */}
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/admin" data-testid="admin-link">
                <Button variant="outline" size="sm" className="border-church-gold text-church-red hover:bg-church-gold/10">
                  Admin
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-church-red"
              data-testid="mobile-menu-btn"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-warm-200 animate-fade-in">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-4 py-3 text-sm font-dm-sans font-medium rounded-md ${
                    location.pathname === link.path
                      ? 'text-church-red bg-church-red/10'
                      : 'text-stone-warm-800 hover:text-church-red hover:bg-stone-warm-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/admin" className="px-4 py-3 text-sm font-dm-sans font-medium text-church-gold">
                Admin Panel
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-stone-warm-900 text-stone-warm-100">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Cross className="h-8 w-8 text-church-gold" />
                <h3 className="font-cinzel text-lg font-bold text-white">
                  {settings?.church_name || 'St. Anthony Catholic Church'}
                </h3>
              </div>
              <p className="text-sm text-stone-warm-200 font-dm-sans leading-relaxed">
                A welcoming Catholic community dedicated to worship, service, and spreading the Gospel of Jesus Christ.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-cinzel text-sm font-bold text-church-gold uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 font-dm-sans text-sm">
                {navLinks.slice(0, 5).map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-stone-warm-200 hover:text-church-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mass Times */}
            <div>
              <h4 className="font-cinzel text-sm font-bold text-church-gold uppercase tracking-wider mb-4">Mass Times</h4>
              <ul className="space-y-2 font-dm-sans text-sm text-stone-warm-200">
                {(settings?.mass_times || []).slice(0, 4).map((mass, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{mass.day}</span>
                    <span className="text-white">{mass.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-cinzel text-sm font-bold text-church-gold uppercase tracking-wider mb-4">Contact Us</h4>
              <ul className="space-y-3 font-dm-sans text-sm">
                <li className="flex items-start gap-3 text-stone-warm-200">
                  <MapPin size={18} className="text-church-gold flex-shrink-0 mt-0.5" />
                  <span>{settings?.address || 'AIT Road, Alagbado, Lagos State, Nigeria'}</span>
                </li>
                <li>
                  <a href={`tel:${settings?.phone}`} className="flex items-center gap-3 text-stone-warm-200 hover:text-church-gold transition-colors">
                    <Phone size={18} className="text-church-gold" />
                    <span>{settings?.phone || '+234 XXX XXX XXXX'}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings?.email}`} className="flex items-center gap-3 text-stone-warm-200 hover:text-church-gold transition-colors">
                    <Mail size={18} className="text-church-gold" />
                    <span>{settings?.email || 'info@stanthonychurch.org'}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-warm-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-stone-warm-200 font-dm-sans">
              &copy; {new Date().getFullYear()} {settings?.church_name || 'St. Anthony Catholic Church'}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {settings?.social_links?.facebook && (
                <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-stone-warm-200 hover:text-church-gold transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {settings?.social_links?.instagram && (
                <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-warm-200 hover:text-church-gold transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {settings?.social_links?.youtube && (
                <a href={settings.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-stone-warm-200 hover:text-church-gold transition-colors">
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
