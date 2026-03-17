import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { api } from '../lib/api';

const ContactPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res.data);
      } catch (e) {
        console.error('Error fetching settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      await api.sendMessage(form);
      toast.success('Your message has been sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  const mapCoords = settings?.map_coordinates || { lat: 6.6656, lng: 3.2908 };

  return (
    <div className="grain-overlay" data-testid="contact-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1765146567664-cf0c0d987da9"
            alt="Candles" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Get in Touch</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out with any questions, prayer requests, or to learn more about our parish.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-playfair text-2xl font-semibold text-church-red mb-6">Parish Office</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <MapPin className="text-church-red" size={24} />
                    </div>
                    <div>
                      <h3 className="font-dm-sans font-medium text-stone-warm-800">Address</h3>
                      <p className="text-muted-foreground font-dm-sans">{settings?.address || 'AIT Road, Alagbado, Lagos State, Nigeria'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <Phone className="text-church-red" size={24} />
                    </div>
                    <div>
                      <h3 className="font-dm-sans font-medium text-stone-warm-800">Phone</h3>
                      <a href={`tel:${settings?.phone}`} className="text-muted-foreground font-dm-sans hover:text-church-red transition-colors">
                        {settings?.phone || '+234 XXX XXX XXXX'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <Mail className="text-church-red" size={24} />
                    </div>
                    <div>
                      <h3 className="font-dm-sans font-medium text-stone-warm-800">Email</h3>
                      <a href={`mailto:${settings?.email}`} className="text-muted-foreground font-dm-sans hover:text-church-red transition-colors">
                        {settings?.email || 'info@stanthonychurch.org'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <Clock className="text-church-red" size={24} />
                    </div>
                    <div>
                      <h3 className="font-dm-sans font-medium text-stone-warm-800">Office Hours</h3>
                      <p className="text-muted-foreground font-dm-sans">Monday - Friday: 9:00 AM - 5:00 PM</p>
                      <p className="text-muted-foreground font-dm-sans">Saturday: 9:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-lg overflow-hidden shadow-lg h-[300px]">
                <iframe
                  title="Church Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.01}%2C${mapCoords.lat - 0.01}%2C${mapCoords.lng + 0.01}%2C${mapCoords.lat + 0.01}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lng}`}
                />
              </div>
            </div>

            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="font-playfair text-2xl font-semibold text-church-red mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-dm-sans">Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        placeholder="Your name"
                        className="border-stone-warm-200 focus:border-church-gold"
                        data-testid="contact-name-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-dm-sans">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        placeholder="Your email"
                        className="border-stone-warm-200 focus:border-church-gold"
                        data-testid="contact-email-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-dm-sans">Subject</Label>
                    <Input
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm({...form, subject: e.target.value})}
                      placeholder="Message subject"
                      className="border-stone-warm-200 focus:border-church-gold"
                      data-testid="contact-subject-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-dm-sans">Message *</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({...form, message: e.target.value})}
                      placeholder="Your message..."
                      rows={5}
                      className="border-stone-warm-200 focus:border-church-gold resize-none"
                      data-testid="contact-message-input"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-church-red hover:bg-church-red-dark font-cinzel uppercase tracking-wider py-6"
                    disabled={sending}
                    data-testid="contact-submit-btn"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={18} />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
