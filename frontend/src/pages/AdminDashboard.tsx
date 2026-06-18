import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Service, Category, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShieldCheck, 
  Settings, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Users, 
  LayoutGrid, 
  Wrench,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ userCount: 0, serviceCount: 0, pendingServices: 0, bookingCount: 0 });
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(false);
  
  // Category Form State
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '', image: '' });
  const [isAddingCat, setIsAddingCat] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [statsRes, pendingRes, catRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/services?status=pending'),
          api.get('/categories'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setPendingServices(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (error: any) {
        console.error('Admin fetch failed', error);
        const message = error.response?.data?.message || 'Admin APIs failed to load';
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user, navigate]);

  const handleCheckCurrentUser = async () => {
    setCheckingAuth(true);
    try {
      const { data } = await api.get('/auth/me');
      setAuthStatus(`Authenticated as ${data.user.displayName} (${data.user.role})`);
      toast.success('Current user is authenticated');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Current user is not authenticated';
      setAuthStatus(message);
      toast.error(message);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleVerifyAdminAccess = async () => {
    setCheckingAuth(true);
    try {
      await api.get('/admin/stats');
      setAuthStatus('Admin access verified');
      toast.success('Admin access verified');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Admin access check failed';
      setAuthStatus(message);
      toast.error(message);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleCheckHealth = async () => {
    setCheckingAuth(true);
    try {
      const response = await fetch('/health');
      const data = await response.json();
      const message = `Server ${data.status}; database ${data.database}`;
      setHealthStatus(message);
      toast.success(message);
    } catch {
      setHealthStatus('Health check failed');
      toast.error('Health check failed');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    const reason = status === 'rejected' ? window.prompt('Reason for rejecting this service?') : '';
    if (status === 'rejected' && !reason?.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await api.patch(`/admin/services/${id}/status`, { status, reason });
      setPendingServices(prev => prev.filter(s => s.id !== id));
      toast.success(`Service ${status}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Moderation failed');
    }
  };

  const handleApproveProvider = async (id: string) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/approve`);
      setUsers(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Provider approved');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Provider approval failed');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service permanently?')) return;
    try {
      await api.delete(`/services/${id}`);
      setPendingServices(prev => prev.filter(s => s.id !== id));
      toast.success('Service deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/categories', catForm);
      setCategories([...categories, data]);
      setCatForm({ name: '', description: '', icon: '', image: '' });
      setIsAddingCat(false);
      toast.success('Category added');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('All services in this category might be affected. Delete?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  if (authLoading || loading) return <div className="p-8">Loading administration panel...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a4d2e] p-2 rounded-xl">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Platform moderation and settings</p>
          </div>
        </div>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {loadError}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Authentication Check</CardTitle>
          <CardDescription>
            Admin routes use the login cookie from `/api/auth/login`; verify the current session before using admin actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email} · {user?.role}</p>
            {authStatus && <p className="text-sm text-[#1a4d2e]">{authStatus}</p>}
            {healthStatus && <p className="text-sm text-muted-foreground">{healthStatus}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCheckCurrentUser} disabled={checkingAuth}>
              Check Current User
            </Button>
            <Button onClick={handleVerifyAdminAccess} disabled={checkingAuth}>
              Verify Admin Access
            </Button>
            <Button variant="outline" onClick={handleCheckHealth} disabled={checkingAuth}>
              Check Server Health
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users /></div>
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold">{stats.userCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><LayoutGrid /></div>
            <div>
              <p className="text-sm text-muted-foreground">Services</p>
              <p className="text-2xl font-bold">{stats.serviceCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><AlertCircle /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingServices}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600"><Wrench /></div>
            <div>
              <p className="text-sm text-muted-foreground">Bookings</p>
              <p className="text-2xl font-bold">{stats.bookingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="users">Users / Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">Service Approval Queue</h2>
          {pendingServices.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              Queue is empty. No services awaiting approval.
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingServices.map(service => (
                <Card key={service.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <img 
                        src={service.image} 
                        className="w-24 h-24 rounded-lg object-cover" 
                        referrerPolicy="no-referrer"
                        alt={service.name}
                      />
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{service.location}</Badge>
                          <Badge variant="outline">₹{service.price}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproval(service.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200"
                        onClick={() => handleApproval(service.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold">Users and Provider Approval</h2>
            <p className="text-sm text-muted-foreground">
              Uses `GET /api/admin/users` and `PATCH /api/admin/users/:id/approve`.
            </p>
          </div>
          <div className="grid gap-4">
            {users.map(item => (
              <Card key={item.id}>
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.displayName}</h3>
                      <Badge variant="outline" className="capitalize">{item.role}</Badge>
                      {item.role === 'provider' && (
                        <Badge variant={item.isApproved ? 'default' : 'secondary'}>
                          {item.isApproved ? 'Approved' : 'Pending approval'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                  </div>
                  {item.role === 'provider' && !item.isApproved && (
                    <Button size="sm" onClick={() => handleApproveProvider(item.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve Provider
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Manage Categories</h2>
            <Button onClick={() => setIsAddingCat(true)} className="bg-[#1a4d2e]">
              <Plus className="h-4 w-4 mr-1" /> New Category
            </Button>
          </div>

          {isAddingCat && (
            <Card className="p-6">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input 
                      value={catForm.name} 
                      onChange={e => setCatForm({...catForm, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input 
                      value={catForm.image} 
                      onChange={e => setCatForm({...catForm, image: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={catForm.description} 
                    onChange={e => setCatForm({...catForm, description: e.target.value})} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddingCat(false)}>Cancel</Button>
                  <Button type="submit">Create Category</Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(cat => (
              <Card key={cat.id}>
                <CardHeader className="p-0">
                  <img 
                    src={cat.image} 
                    className="h-32 w-full object-cover rounded-t-lg" 
                    referrerPolicy="no-referrer"
                    alt={cat.name}
                  />
                </CardHeader>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{cat.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
