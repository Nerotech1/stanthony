import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Video, Calendar, User, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminSermons = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    preacher: '',
    date: '',
    video_url: '',
    video_type: 'youtube',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const res = await api.getSermons(false);
      setSermons(res.data);
    } catch (e) {
      toast.error('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.preacher || !form.date || !form.video_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedSermon) {
        await api.updateSermon(selectedSermon.id, form);
        toast.success('Sermon updated successfully');
      } else {
        await api.createSermon(form);
        toast.success('Sermon created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchSermons();
    } catch (e) {
      toast.error('Failed to save sermon');
    }
  };

  const handleEdit = (sermon) => {
    setSelectedSermon(sermon);
    setForm({
      title: sermon.title,
      description: sermon.description,
      preacher: sermon.preacher,
      date: sermon.date,
      video_url: sermon.video_url,
      video_type: sermon.video_type,
      thumbnail_url: sermon.thumbnail_url || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSermon) return;
    try {
      await api.deleteSermon(selectedSermon.id);
      toast.success('Sermon deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedSermon(null);
      fetchSermons();
    } catch (e) {
      toast.error('Failed to delete sermon');
    }
  };

  const togglePublish = async (sermon) => {
    try {
      await api.updateSermon(sermon.id, { is_published: !sermon.is_published });
      toast.success(sermon.is_published ? 'Sermon unpublished' : 'Sermon published');
      fetchSermons();
    } catch (e) {
      toast.error('Failed to update sermon');
    }
  };

  const resetForm = () => {
    setSelectedSermon(null);
    setForm({
      title: '',
      description: '',
      preacher: '',
      date: '',
      video_url: '',
      video_type: 'youtube',
      thumbnail_url: ''
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
    <div data-testid="admin-sermons">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Sermons</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage sermon videos and recordings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-sermon-btn">
              <Plus size={18} className="mr-2" />
              Add Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl text-church-red">
                {selectedSermon ? 'Edit Sermon' : 'Add New Sermon'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-dm-sans">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Sermon title"
                  className="border-stone-warm-200"
                  data-testid="sermon-title-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Preacher *</Label>
                  <Input
                    value={form.preacher}
                    onChange={(e) => setForm({...form, preacher: e.target.value})}
                    placeholder="Preacher name"
                    className="border-stone-warm-200"
                    data-testid="sermon-preacher-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Date *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="border-stone-warm-200"
                    data-testid="sermon-date-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Sermon description"
                  rows={3}
                  className="border-stone-warm-200 resize-none"
                  data-testid="sermon-description-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Video Type *</Label>
                  <Select value={form.video_type} onValueChange={(value) => setForm({...form, video_type: value})}>
                    <SelectTrigger data-testid="sermon-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Video URL *</Label>
                  <Input
                    value={form.video_url}
                    onChange={(e) => setForm({...form, video_url: e.target.value})}
                    placeholder="https://youtube.com/..."
                    className="border-stone-warm-200"
                    data-testid="sermon-url-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Thumbnail URL (optional)</Label>
                <Input
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({...form, thumbnail_url: e.target.value})}
                  placeholder="https://..."
                  className="border-stone-warm-200"
                  data-testid="sermon-thumbnail-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="sermon-save-btn">
                {selectedSermon ? 'Update' : 'Create'} Sermon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sermons List */}
      {sermons.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No sermons yet. Add your first sermon!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className={`hover:shadow-md transition-shadow ${!sermon.is_published ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{sermon.title}</h3>
                      {!sermon.is_published && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-dm-sans">Draft</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-dm-sans mb-3 line-clamp-2">{sermon.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {sermon.preacher}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(sermon.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video size={14} />
                        {sermon.video_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(sermon)}
                      title={sermon.is_published ? 'Unpublish' : 'Publish'}
                      data-testid={`sermon-toggle-${sermon.id}`}
                    >
                      {sermon.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sermon)}
                      data-testid={`sermon-edit-${sermon.id}`}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { setSelectedSermon(sermon); setDeleteDialogOpen(true); }}
                      data-testid={`sermon-delete-${sermon.id}`}
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
            <AlertDialogTitle>Delete Sermon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSermon?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" data-testid="confirm-delete-sermon">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSermons;
