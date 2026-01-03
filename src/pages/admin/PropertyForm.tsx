import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'camping' as 'camping' | 'cottage' | 'villa',
    location: '',
    price: '',
    price_note: '',
    capacity: 4,
    max_capacity: 0,
    rating: 4.5,
    is_top_selling: false,
    is_active: true,
    check_in_time: '2:00 PM',
    check_out_time: '11:00 AM',
    contact: '+91 8669505727',
    address: '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [policies, setPolicies] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const [newItem, setNewItem] = useState({
    amenity: '',
    highlight: '',
    activity: '',
    policy: '',
    image: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getById(Number(id));
      const property = response.data;

      setFormData({
        title: property.title || '',
        description: property.description || '',
        category: property.category || 'camping',
        location: property.location || '',
        price: property.price || '',
        price_note: property.price_note || '',
        capacity: property.capacity || 4,
        max_capacity: property.max_capacity || 0,
        rating: property.rating || 4.5,
        is_top_selling: property.is_top_selling || false,
        is_active: property.is_active !== false,
        check_in_time: property.check_in_time || '2:00 PM',
        check_out_time: property.check_out_time || '11:00 AM',
        contact: property.contact || '+91 8669505727',
        address: property.address || '',
      });

      setAmenities(Array.isArray(property.amenities) ? property.amenities : JSON.parse(property.amenities || '[]'));
      setHighlights(Array.isArray(property.highlights) ? property.highlights : JSON.parse(property.highlights || '[]'));
      setActivities(Array.isArray(property.activities) ? property.activities : JSON.parse(property.activities || '[]'));
      setPolicies(Array.isArray(property.policies) ? property.policies : JSON.parse(property.policies || '[]'));
      setImages(property.images?.map((img: any) => img.image_url) || []);
    } catch (error) {
      toast.error('Failed to load property');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        amenities,
        highlights,
        activities,
        policies,
        images,
      };

      if (isEdit && id) {
        await propertiesAPI.update(Number(id), propertyData);
        toast.success('Property updated successfully');
      } else {
        await propertiesAPI.create(propertyData);
        toast.success('Property created successfully');
      }

      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'amenity' | 'highlight' | 'activity' | 'policy' | 'image') => {
    const value = newItem[type].trim();
    if (!value) return;

    switch (type) {
      case 'amenity':
        setAmenities([...amenities, value]);
        break;
      case 'highlight':
        setHighlights([...highlights, value]);
        break;
      case 'activity':
        setActivities([...activities, value]);
        break;
      case 'policy':
        setPolicies([...policies, value]);
        break;
      case 'image':
        setImages([...images, value]);
        break;
    }

    setNewItem({ ...newItem, [type]: '' });
  };

  const removeItem = (type: 'amenity' | 'highlight' | 'activity' | 'policy' | 'image', index: number) => {
    switch (type) {
      case 'amenity':
        setAmenities(amenities.filter((_, i) => i !== index));
        break;
      case 'highlight':
        setHighlights(highlights.filter((_, i) => i !== index));
        break;
      case 'activity':
        setActivities(activities.filter((_, i) => i !== index));
        break;
      case 'policy':
        setPolicies(policies.filter((_, i) => i !== index));
        break;
      case 'image':
        setImages(images.filter((_, i) => i !== index));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-display font-semibold">
              {isEdit ? 'Edit Property' : 'Add New Property'}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camping">Camping</SelectItem>
                      <SelectItem value="cottage">Cottage</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    placeholder="₹7,499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_note">Price Note</Label>
                  <Input
                    id="price_note"
                    placeholder="per person with meal"
                    value={formData.price_note}
                    onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_capacity">Max Capacity</Label>
                  <Input
                    id="max_capacity"
                    type="number"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check-in & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in_time">Check-in Time</Label>
                  <Input
                    id="check_in_time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check_out_time">Check-out Time</Label>
                  <Input
                    id="check_out_time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('image'))}
                />
                <Button type="button" onClick={() => addItem('image')} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={image} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem('image', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {['amenities', 'highlights', 'activities', 'policies'].map((type) => {
            const items = type === 'amenities' ? amenities : type === 'highlights' ? highlights : type === 'activities' ? activities : policies;
            const key = type.slice(0, -1) as keyof typeof newItem;

            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize">{type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Enter ${type.slice(0, -1)}`}
                      value={newItem[key]}
                      onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(key as any))}
                    />
                    <Button type="button" onClick={() => addItem(key as any)} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                        <span className="text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeItem(key as any, index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-muted-foreground">Property is visible on the website</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_top_selling">Top Selling</Label>
                  <p className="text-sm text-muted-foreground">Mark as featured property</p>
                </div>
                <Switch
                  id="is_top_selling"
                  checked={formData.is_top_selling}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_top_selling: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/admin')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Property' : 'Create Property'}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
