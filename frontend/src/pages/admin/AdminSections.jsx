import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, GripVertical, Eye, EyeOff } from 'lucide-react';
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

const AdminSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filterPage, setFilterPage] = useState('all');
  const [form, setForm] = useState({
    page_slug: '',
    section_type: 'text',
    title: '',
    content: '',
    order: 0
  });

  const sectionTypes = [
    { value: 'text', label: 'Text Block' },
    { value: 'hero', label: 'Hero Section' },
    { value: 'cta', label: 'Call to Action' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'feature', label: 'Feature Block' }
  ];

  const pageOptions = ['home', 'about', 'sacraments', 'sermons', 'events', 'gallery', 'contact', 'donate'];

  useEffect(() => {
    fetchSections();
  }, [filterPage]);

  const fetchSections = async () => {
    try {
      const pageSlug = filterPage !== 'all' ? filterPage : null;
      const res = await api.getSections(pageSlug);
      setSections(res.data);
    } catch (e) {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.page_slug || !form.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedSection) {
        await api.updateSection(selectedSection.id, form);
        toast.success('Section updated');
      } else {
        await api.createSection(form);
        toast.success('Section created');
      }
      setDialogOpen(false);
      resetForm();
      fetchSections();
    } catch (e) {
      toast.error('Failed to save section');
    }
  };

  const handleEdit = (section) => {
    setSelectedSection(section);
    setForm({
      page_slug: section.page_slug,
      section_type: section.section_type,
      title: section.title,
      content: section.content,
      order: section.order
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSection) return;
    try {
      await api.deleteSection(selectedSection.id);
      toast.success('Section deleted');
      setDeleteDialogOpen(false);
      setSelectedSection(null);
      fetchSections();
    } catch (e) {
      toast.error('Failed to delete section');
    }
  };

  const toggleVisibility = async (section) => {
    try {
      await api.updateSection(section.id, { is_visible: !section.is_visible });
      toast.success(section.is_visible ? 'Section hidden' : 'Section visible');
      fetchSections();
    } catch (e) {
      toast.error('Failed to update section');
    }
  };

  const resetForm = () => {
    setSelectedSection(null);
    setForm({ page_slug: '', section_type: 'text', title: '', content: '', order: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-sections">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Sections</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage page sections and blocks</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterPage} onValueChange={setFilterPage}>
            <SelectTrigger className="w-40" data-testid="section-filter">
              <SelectValue placeholder="Filter by page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              {pageOptions.map(page => (
                <SelectItem key={page} value={page}>{page}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-section-btn">
                <Plus size={18} className="mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-playfair text-xl text-church-red">
                  {selectedSection ? 'Edit Section' : 'Add New Section'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-dm-sans">Page *</Label>
                    <Select value={form.page_slug} onValueChange={(value) => setForm({...form, page_slug: value})}>
                      <SelectTrigger data-testid="section-page-select">
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageOptions.map(page => (
                          <SelectItem key={page} value={page}>{page}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-dm-sans">Section Type</Label>
                    <Select value={form.section_type} onValueChange={(value) => setForm({...form, section_type: value})}>
                      <SelectTrigger data-testid="section-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-dm-sans">Title *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      placeholder="Section title"
                      className="border-stone-warm-200"
                      data-testid="section-title-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-dm-sans">Order</Label>
                    <Input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})}
                      min="0"
                      className="border-stone-warm-200"
                      data-testid="section-order-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Content (HTML supported)</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    placeholder="Section content..."
                    rows={6}
                    className="border-stone-warm-200 font-mono text-sm"
                    data-testid="section-content-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="section-save-btn">
                  {selectedSection ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card className="p-12 text-center">
          <Layers className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No sections yet. Add your first section!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className={`hover:shadow-md transition-shadow ${!section.is_visible ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 cursor-move text-muted-foreground">
                      <GripVertical size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{section.title}</h3>
                        <span className="text-xs px-2 py-1 bg-church-gold/20 text-church-gold rounded">
                          {section.section_type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-stone-warm-100 text-stone-warm-600 rounded">
                          {section.page_slug}
                        </span>
                        {!section.is_visible && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Hidden</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-dm-sans line-clamp-2">
                        {section.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(section)}
                      data-testid={`section-toggle-${section.id}`}
                    >
                      {section.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(section)}
                      data-testid={`section-edit-${section.id}`}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { setSelectedSection(section); setDeleteDialogOpen(true); }}
                      data-testid={`section-delete-${section.id}`}
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
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSection?.title}"?
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

export default AdminSections;
