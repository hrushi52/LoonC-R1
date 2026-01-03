import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LogOut, Plus, Edit, Trash2, Home, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Property {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  price: string;
  is_active: boolean;
  is_top_selling: boolean;
  rating: number;
  images: any[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.list();
      setProperties(response.data || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleToggle = async (id: number, field: 'is_active' | 'is_top_selling', currentValue: boolean) => {
    try {
      await propertiesAPI.toggleStatus(id, field, !currentValue);
      toast.success('Status updated successfully');
      fetchProperties();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await propertiesAPI.delete(deleteId);
      toast.success('Property deleted successfully');
      setDeleteId(null);
      fetchProperties();
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'camping': return 'bg-green-100 text-green-800';
      case 'cottage': return 'bg-blue-100 text-blue-800';
      case 'villa': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-lg font-display font-bold text-primary-foreground">LC</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold">LoonCamp Admin</h1>
              <p className="text-xs text-muted-foreground">Property Management</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-semibold mb-2">Properties</h2>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <Button onClick={() => navigate('/admin/property/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        <div className="grid gap-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{properties.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {properties.filter(p => p.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Selling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {properties.filter(p => p.is_top_selling).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">
                  {properties.filter(p => !p.is_active).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4">
          {properties.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
                <p className="text-muted-foreground mb-6">Get started by adding your first property</p>
                <Button onClick={() => navigate('/admin/property/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            properties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].image_url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold mb-1 truncate">{property.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getCategoryColor(property.category)}>
                              {property.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{property.location}</span>
                            <span className="text-sm font-medium text-primary">{property.price}</span>
                            {property.is_top_selling && (
                              <Badge variant="default" className="bg-primary">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Top Selling
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/property/edit/${property.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(property.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={property.is_active}
                            onCheckedChange={() => handleToggle(property.id, 'is_active', property.is_active)}
                          />
                          <span className="text-sm font-medium">
                            {property.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={property.is_top_selling}
                            onCheckedChange={() => handleToggle(property.id, 'is_top_selling', property.is_top_selling)}
                          />
                          <span className="text-sm font-medium">Top Selling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
