import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, Calendar, Bell, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { api } from '../lib/api';

const HomePage = () => {
  const [settings, setSettings] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Seed data first
        await api.seedData();
        
        const [settingsRes, announcementsRes, eventsRes] = await Promise.all([
          api.getSettings(),
          api.getAnnouncements(),
          api.getEvents()
        ]);
        setSettings(settingsRes.data);
        setAnnouncements(announcementsRes.data);
        setEvents(eventsRes.data.slice(0, 3));
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grain-overlay" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings?.hero_image_url || 'https://images.unsplash.com/photo-1693854448297-29a0f9a3ac9a'}
            alt="Church Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-warm-900/90 via-stone-warm-900/70 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <p className="text-church-gold font-cormorant italic text-lg md:text-xl mb-4">
              Welcome to
            </p>
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {settings?.church_name || 'St. Anthony Catholic Church'}
            </h1>
            <p className="font-playfair text-xl md:text-2xl text-stone-warm-200 mb-8">
              {settings?.tagline || 'AIT Alagbado, Lagos State'}
            </p>
            <p className="font-dm-sans text-stone-warm-200 mb-8 max-w-lg leading-relaxed">
              A welcoming community of faith, dedicated to worship, service, and spreading the Gospel of Jesus Christ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/mass-sacraments" data-testid="hero-mass-times-btn">
                <Button className="bg-church-red hover:bg-church-red-dark text-white font-cinzel uppercase tracking-wider px-8 py-6">
                  Mass Times
                  <ChevronRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/about" data-testid="hero-about-btn">
                <Button variant="outline" className="border-church-gold text-white hover:bg-church-gold/20 font-cinzel uppercase tracking-wider px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mass Times Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-church-gold font-cormorant italic text-lg mb-2">Join Us in Prayer</p>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">Mass Schedule</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(settings?.mass_times || []).map((mass, index) => (
              <Card 
                key={index} 
                className="bg-stone-warm-50 border-l-4 border-church-red hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Clock className="text-church-gold flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{mass.day}</h3>
                      <p className="text-2xl font-cinzel font-bold text-church-red mt-1">{mass.time}</p>
                      {mass.type && <p className="text-sm text-muted-foreground font-dm-sans mt-1">{mass.type}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/mass-sacraments" data-testid="view-all-mass-times-btn">
              <Button variant="outline" className="border-church-gold text-church-red hover:bg-church-gold/10 font-cinzel uppercase tracking-wider">
                View All Schedules
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="py-16 md:py-24 bg-stone-warm-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-church-gold font-cormorant italic text-lg mb-2">Stay Informed</p>
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">Parish Announcements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {announcements.slice(0, 4).map((announcement, index) => (
                <Card 
                  key={announcement.id} 
                  className="bg-white hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-church-red/10 rounded-lg">
                        <Bell className="text-church-red" size={24} />
                      </div>
                      <div>
                        <h3 className="font-playfair font-semibold text-lg text-stone-warm-800 mb-2">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground font-dm-sans leading-relaxed">{announcement.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-church-gold font-cormorant italic text-lg mb-2">Mark Your Calendar</p>
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">Upcoming Events</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {events.map((event, index) => (
                <Card 
                  key={event.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {event.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-church-gold text-sm font-dm-sans mb-3">
                      <Calendar size={16} />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h3 className="font-playfair font-semibold text-xl text-stone-warm-800 mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground font-dm-sans mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>{event.time}</span>
                      <span className="mx-2">|</span>
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/events" data-testid="view-all-events-btn">
                <Button variant="outline" className="border-church-gold text-church-red hover:bg-church-gold/10 font-cinzel uppercase tracking-wider">
                  View All Events
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-church-red relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 0v60M0 30h60%22 stroke=%22%23fff%22 stroke-width=%221%22 fill=%22none%22/%3E%3C/svg%3E')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">Join Our Parish Family</h2>
          <p className="font-dm-sans text-lg text-stone-warm-200 max-w-2xl mx-auto mb-8">
            Whether you're new to the area or returning to the faith, we welcome you with open arms. Come experience the warmth of our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" data-testid="cta-contact-btn">
              <Button className="bg-white text-church-red hover:bg-stone-warm-100 font-cinzel uppercase tracking-wider px-8 py-6">
                Contact Us
              </Button>
            </Link>
            <Link to="/donate" data-testid="cta-donate-btn">
              <Button variant="outline" className="border-church-gold text-white hover:bg-church-gold/20 font-cinzel uppercase tracking-wider px-8 py-6">
                Support Our Parish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
