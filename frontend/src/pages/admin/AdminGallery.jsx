import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image, Eye, EyeOff, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [imagesRes, categoriesRes] = await Promise.all([
        api.getGallery(null),
        api.getGalleryCategories()
      ]);
      setImages(imagesRes.data);
      setCategories(categoriesRes.data);
    } catch (e) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.image_url || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedImage) {
        await api.updateGalleryImage(selectedImage.id, form);
        toast.success('Image updated successfully');
      } else {
        await api.createGalleryImage(form);
        toast.success('Image added successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (e) {
      toast.error('Failed to save image');
    }
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setForm({
      title: image.title,
      description: image.description || '',
      image_url: image.image_url,
      category: image.category
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedImage) return;
    try {
      await api.deleteGalleryImage(selectedImage.id);
      toast.success('Image deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedImage(null);
      fetchData();
    } catch (e) {
      toast.error('Failed to delete image');
    }
  };

  const togglePublish = async (image) => {
    try {
      await api.updateGalleryImage(image.id, { is_published: !image.is_published });
      toast.success(image.is_published ? 'Image hidden' : 'Image visible');
      fetchData();
    } catch (e) {
      toast.error('Failed to update image');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setForm({
      title: '',
      description: '',
      image_url: '',
      category: ''
    });
  };

  const filteredImages = filterCategory === 'all' 
    ? images 
    : images.filter(img => img.category === filterCategory);

  const defaultCategories = ['Church', 'Events', 'Art', 'Community', 'Liturgy'];
  const allCategories = [...new Set([...categories, ...defaultCategories])];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-gallery">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Gallery</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage parish photos and images</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40" data-testid="gallery-filter">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-image-btn">
                <Plus size={18} className="mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-playfair text-xl text-church-red">
                  {selectedImage ? 'Edit Image' : 'Add New Image'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="Image title"
                    className="border-stone-warm-200"
                    data-testid="image-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Image URL *</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({...form, image_url: e.target.value})}
                    placeholder="https://..."
                    className="border-stone-warm-200"
                    data-testid="image-url-input"
                  />
                  {form.image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden h-32">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Category *</Label>
                  <Select value={form.category} onValueChange={(value) => setForm({...form, category: value})}>
                    <SelectTrigger data-testid="image-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Description (optional)</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Image description"
                    rows={2}
                    className="border-stone-warm-200 resize-none"
                    data-testid="image-description-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="image-save-btn">
                  {selectedImage ? 'Update' : 'Add'} Image
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No images yet. Add your first image!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className={`overflow-hidden group ${!image.is_published ? 'opacity-60' : ''}`}>
              <div className="relative aspect-square">
                <img 
                  src={image.image_url} 
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => togglePublish(image)}
                    data-testid={`gallery-toggle-${image.id}`}
                  >
                    {image.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleEdit(image)}
                    data-testid={`gallery-edit-${image.id}`}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => { setSelectedImage(image); setDeleteDialogOpen(true); }}
                    data-testid={`gallery-delete-${image.id}`}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-dm-sans font-medium text-sm text-stone-warm-800 truncate">{image.title}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <FolderOpen size={12} />
                  <span>{image.category}</span>
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
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedImage?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" data-testid="confirm-delete-image">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGallery;
