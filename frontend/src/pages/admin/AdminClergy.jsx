import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminClergy = () => {
  const [clergy, setClergy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({
    name: '',
    title: '',
    bio: '',
    image_url: '',
    order: 0
  });

  useEffect(() => {
    fetchClergy();
  }, []);

  const fetchClergy = async () => {
    try {
      const res = await api.getClergy(false);
      setClergy(res.data);
    } catch (e) {
      toast.error('Failed to load clergy');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.title || !form.bio) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedItem) {
        await api.updateClergy(selectedItem.id, form);
        toast.success('Clergy updated');
      } else {
        await api.createClergy(form);
        toast.success('Clergy added');
      }
      setDialogOpen(false);
      resetForm();
      fetchClergy();
    } catch (e) {
      toast.error('Failed to save clergy');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      title: item.title,
      bio: item.bio,
      image_url: item.image_url || '',
      order: item.order
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await api.deleteClergy(selectedItem.id);
      toast.success('Clergy deleted');
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchClergy();
    } catch (e) {
      toast.error('Failed to delete clergy');
    }
  };

  const toggleActive = async (item) => {
    try {
      await api.updateClergy(item.id, { is_active: !item.is_active });
      toast.success(item.is_active ? 'Clergy hidden' : 'Clergy visible');
      fetchClergy();
    } catch (e) {
      toast.error('Failed to update clergy');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setForm({ name: '', title: '', bio: '', image_url: '', order: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-clergy">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Clergy & Staff</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage parish clergy profiles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-clergy-btn">
              <Plus size={18} className="mr-2" />
              Add Clergy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl text-church-red">
                {selectedItem ? 'Edit Clergy' : 'Add New Clergy'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-dm-sans">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Full name"
                  className="border-stone-warm-200"
                  data-testid="clergy-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="e.g., Parish Priest, Deacon"
                  className="border-stone-warm-200"
                  data-testid="clergy-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Bio *</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  placeholder="Short biography"
                  rows={4}
                  className="border-stone-warm-200 resize-none"
                  data-testid="clergy-bio-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Photo URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({...form, image_url: e.target.value})}
                  placeholder="https://..."
                  className="border-stone-warm-200"
                  data-testid="clergy-image-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Display Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})}
                  min="0"
                  className="border-stone-warm-200"
                  data-testid="clergy-order-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="clergy-save-btn">
                {selectedItem ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {clergy.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No clergy profiles yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clergy.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
              {item.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-stone-warm-200 flex items-center justify-center">
                  <Users size={48} className="text-stone-warm-400" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{item.name}</h3>
                    <p className="text-church-gold font-dm-sans text-sm">{item.title}</p>
                  </div>
                  {!item.is_active && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Hidden</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-dm-sans line-clamp-3 mb-4">{item.bio}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(item)}
                    data-testid={`clergy-toggle-${item.id}`}
                  >
                    {item.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                    data-testid={`clergy-edit-${item.id}`}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}
                    data-testid={`clergy-delete-${item.id}`}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clergy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItem?.name}'s profile?
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

export default AdminClergy;
