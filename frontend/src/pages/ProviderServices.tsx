import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Service } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, MapPin, IndianRupee, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ManageServiceDialog } from '../components/ManageServiceDialog';

export const ProviderServices = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    if (authLoading) return;

    if (!user || (user.role !== 'provider' && user.role !== 'admin')) {
      navigate('/');
      return;
    }
    fetchServices();
  }, [authLoading, user, navigate]);

  const fetchServices = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get('/services/provider/dashboard');
      setServices(Array.isArray(data.services) ? data.services : []);
      setStats(data.stats || { total: 0, approved: 0, pending: 0, rejected: 0 });
    } catch (error: any) {
      console.error('Failed to fetch services', error);
      const message = error.response?.data?.message || 'Failed to fetch services';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('Service deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" /> Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (authLoading || loading) return <div className="p-8 text-center text-muted-foreground">Loading your services...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground">Create and manage your professional service listings</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedService(null);
            setIsDialogOpen(true);
          }}
          className="bg-[#1a4d2e] hover:bg-[#143d24]"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Service
        </Button>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {loadError}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total', stats.total],
          ['Approved', stats.approved],
          ['Pending', stats.pending],
          ['Rejected', stats.rejected]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 ? (
        <Card className="p-16 text-center space-y-4 border-dashed">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-xl font-bold">No services yet</h3>
            <p className="text-muted-foreground">Create your first service listing to start receiving bookings from customers.</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
          >
            Create First Service
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-64 h-48 flex-shrink-0">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between pt-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#1a4d2e] transition-colors">
                            {service.name}
                          </h3>
                          <div className="flex items-center text-[#1a4d2e] font-medium mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {service.location || 'Global'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              setSelectedService(service);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                      {service.status === 'rejected' && service.rejectionReason && (
                        <p className="text-sm text-red-600">
                          Rejection reason: {service.rejectionReason}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center text-gray-700">
                          <IndianRupee className="h-4 w-4 mr-1 text-[#1a4d2e]" />
                          <span className="font-bold text-lg">₹{service.price}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ManageServiceDialog
        isOpen={isDialogOpen}
        service={selectedService}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchServices}
      />
    </div>
  );
};
