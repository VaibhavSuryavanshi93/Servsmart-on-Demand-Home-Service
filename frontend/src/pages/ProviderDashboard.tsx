import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Check, X, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Chat } from '../components/Chat';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export const ProviderDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (user && user.role !== 'provider') {
      toast.error('Access denied. Provider role required.');
      navigate('/dashboard');
    } else if (!user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get('/bookings/provider');
      setBookings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch bookings', error);
      const message = error.response?.data?.message || 'Failed to fetch provider bookings';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user?.role === 'provider') {
      fetchBookings();
    } else if (!user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleStatusUpdate = async (id: string, status: string) => {
    const reason = status === 'rejected' ? window.prompt('Reason for rejecting this booking?') : '';
    if (status === 'rejected' && !reason?.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await api.patch(`/bookings/${id}/status`, { status, reason });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (authLoading || loading) return <div className="container mx-auto p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-muted-foreground">Manage incoming service requests</p>
        </div>
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {loadError}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {Array.isArray(bookings) && bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{booking.serviceName}</h3>
                      <Badge variant={booking.status === 'pending' ? 'outline' : 'default'}>
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Customer: {booking.userName}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {format(new Date(booking.date), 'PPP')} at {booking.time}
                      </div>
                      <div className="flex items-center md:col-span-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {booking.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" /> Chat
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-0 border-none max-w-md">
                        <Chat
                          bookingId={booking.id}
                          receiverId={booking.userId}
                          receiverName={booking.userName}
                        />
                      </DialogContent>
                    </Dialog>

                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                        >
                          <Check className="h-4 w-4 mr-2" /> Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'outline'}>
                        Payment: {booking.paymentStatus}
                      </Badge>
                    )}
                    {booking.status === 'rejected' && booking.rejectionReason && (
                      <p className="max-w-xs text-sm text-red-600">{booking.rejectionReason}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            No bookings found.
          </Card>
        )}
      </div>
    </div>
  );
};
