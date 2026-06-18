import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Service, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('10:00');
  const [address, setAddress] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await api.get(`/services/${id}`);
        setService(data);
        const reviewsRes = await api.get(`/reviews/service/${id}`);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch (error) {
        console.error('Failed to fetch service', error);
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }

    if (!date || !address) {
      toast.error('Please select a date and enter an address');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        serviceId: service?.id,
        providerId: service?.providerId,
        date: format(date, 'yyyy-MM-dd'),
        time,
        address,
        totalAmount: service?.price
      });
      toast.success('Booking successful!');
      const redirectPath = user?.role === 'provider' ? '/provider/dashboard' : '/dashboard';
      navigate(redirectPath);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (!service) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Service Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
            <img
              src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1200'}
              alt={service.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">{service.name}</h1>
              <div className="flex items-center text-xl font-bold text-primary">
                ₹{service.price}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                {service.rating} ({service.reviewCount} reviews)
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                {service.duration}
              </div>
              <div className="flex items-center">
                <Badge variant="secondary">{service.providerName}</Badge>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description || "Professional service provided by our expert team. We ensure high-quality results and customer satisfaction."}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => {
                    const reviewer = typeof review.userId === 'object' ? review.userId.displayName : review.userName;
                    return (
                      <Card key={review.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{reviewer || 'Customer'}</span>
                            <span className="flex items-center text-sm">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              {review.rating}/5
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-2xl border-primary/10">
            <CardHeader>
              <CardTitle>Book this service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{service.price}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleBooking} disabled={bookingLoading}>
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
