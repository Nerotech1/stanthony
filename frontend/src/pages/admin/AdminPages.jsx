import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [form, setForm] = useState({
    page_slug: '',
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.getPages();
      setPages(res.data);
    } catch (e) {
      toast.error('Failed to load pages');
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
      if (selectedPage) {
        await api.updatePage(selectedPage.page_slug, { title: form.title, content: form.content });
        toast.success('Page updated successfully');
      } else {
        await api.createPage(form);
        toast.success('Page created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (e) {
      toast.error('Failed to save page');
    }
  };

  const handleEdit = (page) => {
    setSelectedPage(page);
    setForm({
      page_slug: page.page_slug,
      title: page.title,
      content: page.content
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPage) return;
    try {
      await api.deletePage(selectedPage.page_slug);
      toast.success('Page deleted');
      setDeleteDialogOpen(false);
      setSelectedPage(null);
      fetchPages();
    } catch (e) {
      toast.error('Failed to delete page');
    }
  };

  const resetForm = () => {
    setSelectedPage(null);
    setForm({ page_slug: '', title: '', content: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-pages">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Pages</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage website page content</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-church-red hover:bg-church-red-dark font-dm-sans" data-testid="add-page-btn">
              <Plus size={18} className="mr-2" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl text-church-red">
                {selectedPage ? 'Edit Page' : 'Add New Page'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Page Slug *</Label>
                  <Input
                    value={form.page_slug}
                    onChange={(e) => setForm({...form, page_slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    placeholder="about, sacraments, etc."
                    className="border-stone-warm-200"
                    disabled={!!selectedPage}
                    data-testid="page-slug-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="Page title"
                    className="border-stone-warm-200"
                    data-testid="page-title-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Content (HTML supported)</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="<h2>Heading</h2><p>Content...</p>"
                  rows={15}
                  className="border-stone-warm-200 font-mono text-sm"
                  data-testid="page-content-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-church-red hover:bg-church-red-dark" data-testid="page-save-btn">
                {selectedPage ? 'Update' : 'Create'} Page
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {pages.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No pages yet. Create your first page!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className={`hover:shadow-md transition-shadow ${!page.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{page.title}</h3>
                      <span className="text-xs px-2 py-1 bg-stone-warm-100 text-stone-warm-600 rounded">
                        /{page.page_slug}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-dm-sans line-clamp-2">
                      {page.content?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(page)}
                      data-testid={`page-edit-${page.page_slug}`}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => { setSelectedPage(page); setDeleteDialogOpen(true); }}
                      data-testid={`page-delete-${page.page_slug}`}
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
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedPage?.title}" page?
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

export default AdminPages;
