import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Missing Stripe checkout session.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/payments/checkout-session/${sessionId}`);
        if (data.stripePaymentStatus !== 'paid') {
          setError('Stripe has not confirmed this payment yet.');
        }
        setPayment(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to verify payment.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const booking = payment?.booking;
  const serviceName = booking?.serviceName || booking?.serviceId?.name || 'your service';

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-6 p-8 text-center">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#1a4d2e]" />
              <div>
                <h1 className="text-2xl font-bold">Verifying payment</h1>
                <p className="text-muted-foreground">Please wait while we confirm your Stripe payment.</p>
              </div>
            </>
          ) : error ? (
            <>
              <XCircle className="mx-auto h-14 w-14 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold">Payment not confirmed</h1>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/services">Browse Services</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#1a4d2e]" />
              <div>
                <h1 className="text-2xl font-bold">Payment successful</h1>
                <p className="text-muted-foreground">Your booking for {serviceName} is now marked as paid.</p>
              </div>
              {booking && (
                <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">₹{booking.totalAmount}</span>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span className="text-muted-foreground">Payment status</span>
                    <span className="font-semibold capitalize">{booking.paymentStatus}</span>
                  </div>
                </div>
              )}
              <Button asChild className="bg-[#1a4d2e] hover:bg-[#143d24]">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
