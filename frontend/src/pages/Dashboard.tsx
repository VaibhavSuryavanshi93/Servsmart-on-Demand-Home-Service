import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Booking, Service } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Timer, MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Chat } from '../components/Chat';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AdminDashboard } from './AdminDashboard';

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [recommendations, setRecommendations] = useState<Service[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
    }
  }, [authLoading, user, navigate]);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const { data } = await api.get('/services/recommendations');
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || user.role === 'admin') return;
    fetchBookings();
    fetchRecommendations();
  }, [authLoading, user]);

  const handleReviewSubmit = async (booking: Booking) => {
    try {
      await api.post('/reviews', {
        bookingId: booking.id,
        serviceId: typeof booking.serviceId === 'string' ? booking.serviceId : (booking.serviceId as any).id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      toast.success('Review submitted');
      setReviewForm({ rating: '5', comment: '' });
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Timer className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'accepted': return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Accepted</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'rejected': return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || !user || user.role === 'admin') {
    return user?.role === 'admin' ? <AdminDashboard /> : <div className="container mx-auto p-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.displayName}</h1>
          <p className="text-muted-foreground">Manage your service bookings and account</p>
        </div>
        <Badge size="lg" className="px-4 py-1 text-sm capitalize">{user?.role}</Badge>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="recommendations">Recommended</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>
        
            <TabsContent value="bookings" className="mt-6">
          {loading ? (
            <p>Loading bookings...</p>
          ) : (Array.isArray(bookings) && bookings.length > 0) ? (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{booking.serviceName}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(booking.date), 'PPP')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.address}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Provider:</span>{' '}
                            <span className="font-medium">{booking.providerName}</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <MessageSquare className="h-3 w-3 mr-1" /> Chat
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 border-none max-w-md">
                              <Chat
                                bookingId={booking.id}
                                receiverId={booking.providerId}
                                receiverName={booking.providerName}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                         <div className="font-bold text-lg">
                          ₹{booking.totalAmount}
                        </div>
                      </div>

                      {booking.rejectionReason && (
                        <p className="text-sm text-red-600">Reason: {booking.rejectionReason}</p>
                      )}

                      {booking.paymentStatus !== 'paid' && booking.status === 'accepted' && (
                        <div className="flex justify-end pt-2">
                          <Button 
                            className="bg-indigo-600 hover:bg-indigo-700" 
                            size="sm"
                            onClick={async () => {
                              try {
                                const { data } = await api.post('/payments/create-checkout-session', { bookingId: booking.id });
                                if (data.url) window.location.href = data.url;
                              } catch (err: any) {
                                toast.error(err.response?.data?.message || 'Payment failed to initialize');
                              }
                            }}
                          >
                            Pay Now
                          </Button>
                        </div>
                      )}

                      {booking.paymentStatus === 'paid' && (
                        <div className="grid gap-2 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={reviewForm.rating}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, rating: e.target.value }))}
                              className="w-20"
                            />
                            <Input
                              placeholder="Share your review"
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            />
                            <Button size="sm" onClick={() => handleReviewSubmit(booking)}>
                              Review
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center space-y-4">
              <p className="text-muted-foreground">You haven't booked any services yet.</p>
              <Button asChild>
                <Link to="/services">Browse Services</Link>
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {recommendationsLoading ? (
            <p>Loading recommendations...</p>
          ) : recommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4 space-y-3">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800'}
                      alt={service.name}
                      className="h-36 w-full rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">₹{service.price}</Badge>
                      <Button asChild size="sm">
                        <Link to={`/services/${service.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center space-y-4">
              <p className="text-muted-foreground">No recommendations are available yet.</p>
              <Button variant="outline" onClick={fetchRecommendations}>Refresh Recommendations</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                <span className="text-lg">{user?.displayName}</span>
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-muted-foreground">Email Address</span>
                <span className="text-lg">{user?.email}</span>
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-muted-foreground">Account Type</span>
                <span className="text-lg capitalize">{user?.role}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
