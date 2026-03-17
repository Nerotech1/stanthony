import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, Clock, MapPin, Star, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image_url: '',
    is_featured: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.getEvents(false);
      setEvents(res.data);
    } catch (e) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.time || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedEvent) {
        await api.updateEvent(selectedEvent.id, form);
        toast.success('Event updated successfully');
      } else {
        await api.createEvent(form);
        toast.success('Event created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (e) {
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image_url: event.image_url || '',
      is_featured: event.is_featured
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await api.deleteEvent(selectedEvent.id);
      toast.success('Event deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (e) {
      toast.error('Failed to delete event');
    }
  };

  const togglePublish = async (event) => {
    try {
      await api.updateEvent(event.id, { is_published: !event.is_published });
      toast.success(event.is_published ? 'Event unpublished' : 'Event published');
      fetchEvents();
    } catch (e) {
      toast.error('Failed to update event');
    }
  };

  const resetForm = () => {
    setSelectedEvent(null);
    setForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      image_url: '',
      is_featured: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-events">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Events</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage parish events and activities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-event-btn">
              <Plus size={18} className="mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl text-church-red">
                {selectedEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-dm-sans">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Event title"
                  className="border-stone-warm-200"
                  data-testid="event-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Event description"
                  rows={3}
                  className="border-stone-warm-200 resize-none"
                  data-testid="event-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Date *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="border-stone-warm-200"
                    data-testid="event-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Time *</Label>
                  <Input
                    value={form.time}
                    onChange={(e) => setForm({...form, time: e.target.value})}
                    placeholder="e.g., 9:00 AM - 12:00 PM"
                    className="border-stone-warm-200"
                    data-testid="event-time-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Location *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  placeholder="Event location"
                  className="border-stone-warm-200"
                  data-testid="event-location-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Image URL (optional)</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({...form, image_url: e.target.value})}
                  placeholder="https://..."
                  className="border-stone-warm-200"
                  data-testid="event-image-input"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(checked) => setForm({...form, is_featured: checked})}
                  data-testid="event-featured-switch"
                />
                <Label className="font-dm-sans">Featured Event</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="event-save-btn">
                {selectedEvent ? 'Update' : 'Create'} Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No events yet. Create your first event!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className={`hover:shadow-md transition-shadow ${!event.is_published ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{event.title}</h3>
                      {event.is_featured && (
                        <Star className="text-church-gold fill-church-gold" size={16} />
                      )}
                      {!event.is_published && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-dm-sans">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-dm-sans mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(event)}
                      title={event.is_published ? 'Unpublish' : 'Publish'}
                      data-testid={`event-toggle-${event.id}`}
                    >
                      {event.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(event)}
                      data-testid={`event-edit-${event.id}`}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { setSelectedEvent(event); setDeleteDialogOpen(true); }}
                      data-testid={`event-delete-${event.id}`}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" data-testid="confirm-delete-event">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEvents;
