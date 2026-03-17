import React, { useState, useEffect } from 'react';
import { Save, Church, Phone, Mail, MapPin, Globe, Image, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res.data);
    } catch (e) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateMassTime = (index, field, value) => {
    const newMassTimes = [...(settings.mass_times || [])];
    newMassTimes[index] = { ...newMassTimes[index], [field]: value };
    updateSetting('mass_times', newMassTimes);
  };

  const addMassTime = () => {
    const newMassTimes = [...(settings.mass_times || []), { day: '', time: '', type: '' }];
    updateSetting('mass_times', newMassTimes);
  };

  const removeMassTime = (index) => {
    const newMassTimes = (settings.mass_times || []).filter((_, i) => i !== index);
    updateSetting('mass_times', newMassTimes);
  };

  const updateConfessionTime = (index, field, value) => {
    const newTimes = [...(settings.confession_times || [])];
    newTimes[index] = { ...newTimes[index], [field]: value };
    updateSetting('confession_times', newTimes);
  };

  const addConfessionTime = () => {
    const newTimes = [...(settings.confession_times || []), { day: '', time: '' }];
    updateSetting('confession_times', newTimes);
  };

  const removeConfessionTime = (index) => {
    const newTimes = (settings.confession_times || []).filter((_, i) => i !== index);
    updateSetting('confession_times', newTimes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-settings">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Settings</h1>
          <p className="text-muted-foreground font-dm-sans mt-1">Manage parish information and website settings</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-church-red hover:bg-church-red-dark font-dm-sans"
          data-testid="save-settings-btn"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-stone-warm-100">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-lg text-church-red flex items-center gap-2">
                <Church size={20} />
                Church Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Church Name</Label>
                  <Input
                    value={settings?.church_name || ''}
                    onChange={(e) => updateSetting('church_name', e.target.value)}
                    className="border-stone-warm-200"
                    data-testid="setting-church-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Tagline</Label>
                  <Input
                    value={settings?.tagline || ''}
                    onChange={(e) => updateSetting('tagline', e.target.value)}
                    className="border-stone-warm-200"
                    data-testid="setting-tagline"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Hero Image URL</Label>
                <Input
                  value={settings?.hero_image_url || ''}
                  onChange={(e) => updateSetting('hero_image_url', e.target.value)}
                  placeholder="https://..."
                  className="border-stone-warm-200"
                  data-testid="setting-hero-image"
                />
                {settings?.hero_image_url && (
                  <div className="mt-2 h-32 rounded-lg overflow-hidden">
                    <img src={settings.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Logo URL</Label>
                <Input
                  value={settings?.logo_url || ''}
                  onChange={(e) => updateSetting('logo_url', e.target.value)}
                  placeholder="https://..."
                  className="border-stone-warm-200"
                  data-testid="setting-logo"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-lg text-church-red flex items-center gap-2">
                <Phone size={20} />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-dm-sans">Address</Label>
                <Textarea
                  value={settings?.address || ''}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  className="border-stone-warm-200 resize-none"
                  rows={2}
                  data-testid="setting-address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Phone</Label>
                  <Input
                    value={settings?.phone || ''}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    className="border-stone-warm-200"
                    data-testid="setting-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Email</Label>
                  <Input
                    type="email"
                    value={settings?.email || ''}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    className="border-stone-warm-200"
                    data-testid="setting-email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-dm-sans">Map Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings?.map_coordinates?.lat || ''}
                    onChange={(e) => updateSetting('map_coordinates', { ...settings?.map_coordinates, lat: parseFloat(e.target.value) })}
                    className="border-stone-warm-200"
                    data-testid="setting-lat"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans">Map Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings?.map_coordinates?.lng || ''}
                    onChange={(e) => updateSetting('map_coordinates', { ...settings?.map_coordinates, lng: parseFloat(e.target.value) })}
                    className="border-stone-warm-200"
                    data-testid="setting-lng"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-dm-sans font-medium">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-dm-sans">Facebook</Label>
                    <Input
                      value={settings?.social_links?.facebook || ''}
                      onChange={(e) => updateSetting('social_links', { ...settings?.social_links, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="border-stone-warm-200"
                      data-testid="setting-facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-dm-sans">Instagram</Label>
                    <Input
                      value={settings?.social_links?.instagram || ''}
                      onChange={(e) => updateSetting('social_links', { ...settings?.social_links, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="border-stone-warm-200"
                      data-testid="setting-instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-dm-sans">YouTube</Label>
                    <Input
                      value={settings?.social_links?.youtube || ''}
                      onChange={(e) => updateSetting('social_links', { ...settings?.social_links, youtube: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="border-stone-warm-200"
                      data-testid="setting-youtube"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-lg text-church-red">Mass Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(settings?.mass_times || []).map((mass, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-stone-warm-50 rounded-lg">
                    <Input
                      value={mass.day}
                      onChange={(e) => updateMassTime(index, 'day', e.target.value)}
                      placeholder="Day (e.g., Sunday)"
                      className="border-stone-warm-200"
                    />
                    <Input
                      value={mass.time}
                      onChange={(e) => updateMassTime(index, 'time', e.target.value)}
                      placeholder="Time (e.g., 10:00 AM)"
                      className="border-stone-warm-200"
                    />
                    <Input
                      value={mass.type || ''}
                      onChange={(e) => updateMassTime(index, 'type', e.target.value)}
                      placeholder="Type (optional)"
                      className="border-stone-warm-200"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => removeMassTime(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addMassTime} className="w-full border-dashed" data-testid="add-mass-time-btn">
                  + Add Mass Time
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-lg text-church-red">Confession Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(settings?.confession_times || []).map((conf, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-stone-warm-50 rounded-lg">
                    <Input
                      value={conf.day}
                      onChange={(e) => updateConfessionTime(index, 'day', e.target.value)}
                      placeholder="Day"
                      className="border-stone-warm-200"
                    />
                    <Input
                      value={conf.time}
                      onChange={(e) => updateConfessionTime(index, 'time', e.target.value)}
                      placeholder="Time"
                      className="border-stone-warm-200"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => removeConfessionTime(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addConfessionTime} className="w-full border-dashed" data-testid="add-confession-time-btn">
                  + Add Confession Time
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-lg text-church-red flex items-center gap-2">
                <Globe size={20} />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-dm-sans">Meta Title</Label>
                <Input
                  value={settings?.meta_title || ''}
                  onChange={(e) => updateSetting('meta_title', e.target.value)}
                  placeholder="Page title for search engines"
                  className="border-stone-warm-200"
                  data-testid="setting-meta-title"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-dm-sans">Meta Description</Label>
                <Textarea
                  value={settings?.meta_description || ''}
                  onChange={(e) => updateSetting('meta_description', e.target.value)}
                  placeholder="Description for search engines (150-160 characters recommended)"
                  className="border-stone-warm-200 resize-none"
                  rows={3}
                  data-testid="setting-meta-description"
                />
                <p className="text-xs text-muted-foreground">
                  {(settings?.meta_description || '').length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
