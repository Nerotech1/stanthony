import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { api } from '../lib/api';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('list');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getEvents();
        setEvents(res.data);
      } catch (e) {
        console.error('Error fetching events:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const eventDates = events.map(e => new Date(e.date));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grain-overlay" data-testid="events-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1693854448297-29a0f9a3ac9a"
            alt="Church gathering" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Join Our Community</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">Parish Events</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            Stay connected with our parish community through various events, celebrations, and gatherings.
          </p>
        </div>
      </section>

      {/* View Toggle */}
      <section className="py-8 bg-white border-b border-stone-warm-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2">
            <Button 
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
              className={view === 'list' ? 'bg-church-red hover:bg-church-red-dark' : 'border-church-gold text-church-red hover:bg-church-gold/10'}
              data-testid="events-list-view-btn"
            >
              List View
            </Button>
            <Button 
              variant={view === 'calendar' ? 'default' : 'outline'}
              onClick={() => setView('calendar')}
              className={view === 'calendar' ? 'bg-church-red hover:bg-church-red-dark' : 'border-church-gold text-church-red hover:bg-church-gold/10'}
              data-testid="events-calendar-view-btn"
            >
              Calendar View
            </Button>
          </div>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-16 md:py-24 bg-stone-warm-50">
        <div className="container mx-auto px-4">
          {view === 'calendar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Calendar */}
              <Card className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md"
                  modifiers={{
                    hasEvent: eventDates
                  }}
                  modifiersStyles={{
                    hasEvent: { backgroundColor: '#721121', color: 'white', borderRadius: '50%' }
                  }}
                />
              </Card>

              {/* Selected Date Events */}
              <div>
                <h3 className="font-playfair text-xl font-semibold text-stone-warm-800 mb-6">
                  Events on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-4">
                    {getEventsForDate(selectedDate).map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <h4 className="font-playfair font-semibold text-lg text-stone-warm-800 mb-2">{event.title}</h4>
                          <p className="text-sm text-muted-foreground font-dm-sans mb-4">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={14} className="text-church-gold" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-church-gold" />
                              {event.location}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground font-dm-sans">No events scheduled for this date.</p>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            // List View
            <div className="max-w-4xl mx-auto">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-dm-sans">No upcoming events at the moment. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <Card 
                      key={event.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                      data-testid={`event-card-${index}`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Date Column */}
                        <div className="bg-church-red text-white p-6 flex flex-col items-center justify-center min-w-[120px]">
                          <span className="text-sm font-dm-sans uppercase">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-4xl font-cinzel font-bold">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-sm font-dm-sans">
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          {event.is_featured && (
                            <span className="inline-block px-3 py-1 bg-church-gold/20 text-church-gold text-xs font-dm-sans font-medium rounded-full mb-3">
                              Featured
                            </span>
                          )}
                          <h3 className="font-playfair font-semibold text-xl text-stone-warm-800 mb-2">{event.title}</h3>
                          <p className="text-muted-foreground font-dm-sans mb-4">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={14} className="text-church-gold" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-church-gold" />
                              {event.location}
                            </span>
                          </div>
                        </div>

                        {/* Image */}
                        {event.image_url && (
                          <div className="hidden lg:block w-48 overflow-hidden">
                            <img 
                              src={event.image_url} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
