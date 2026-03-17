import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Megaphone, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 0
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getAnnouncements(false);
      setAnnouncements(res.data);
    } catch (e) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedItem) {
        await api.updateAnnouncement(selectedItem.id, form);
        toast.success('Announcement updated');
      } else {
        await api.createAnnouncement(form);
        toast.success('Announcement created');
      }
      setDialogOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (e) {
      toast.error('Failed to save announcement');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({
      title: item.title,
      content: item.content,
      priority: item.priority
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await api.deleteAnnouncement(selectedItem.id);
      toast.success('Announcement deleted');
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchAnnouncements();
    } catch (e) {
      toast.error('Failed to delete announcement');
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.updateAnnouncement(item.id, { is_active: !item.is_active });
      toast.success(item.is_active ? 'Announcement hidden' : 'Announcement visible');
      fetchAnnouncements();
    } catch (e) {
      toast.error('Failed to update announcement');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setForm({ title: '', content: '', priority: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-announcements">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Announcements</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage parish announcements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-announcement-btn">
              <Plus size={18} className="mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl text-church-red">
                {selectedItem ? 'Edit Announcement' : 'Add New Announcement'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-dm-sans">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Announcement title"
                  className="border-stone-warm-200"
                  data-testid="announcement-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Content *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Announcement content"
                  rows={4}
                  className="border-stone-warm-200 resize-none"
                  data-testid="announcement-content-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Priority (higher = more important)</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({...form, priority: parseInt(e.target.value) || 0})}
                  min="0"
                  max="10"
                  className="border-stone-warm-200"
                  data-testid="announcement-priority-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="announcement-save-btn">
                {selectedItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No announcements yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card key={item.id} className={`hover:shadow-md transition-shadow ${!item.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{item.title}</h3>
                      {item.priority > 0 && (
                        <span className="text-xs px-2 py-1 bg-church-gold/20 text-church-gold rounded-full">
                          Priority: {item.priority}
                        </span>
                      )}
                      {!item.is_active && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Hidden</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-dm-sans">{item.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(item)}
                      data-testid={`announcement-toggle-${item.id}`}
                    >
                      {item.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                      data-testid={`announcement-edit-${item.id}`}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}
                      data-testid={`announcement-delete-${item.id}`}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAnnouncements;
