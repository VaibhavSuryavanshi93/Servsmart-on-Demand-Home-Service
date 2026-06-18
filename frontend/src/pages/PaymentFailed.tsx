import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-6 p-8 text-center">
          <XCircle className="mx-auto h-14 w-14 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold">Payment was not completed</h1>
            <p className="text-muted-foreground">
              Your booking is still safe. You can return to the dashboard and try the payment again.
            </p>
          </div>
          {bookingId && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <span className="text-muted-foreground">Booking ID: </span>
              <span className="font-medium">{bookingId}</span>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="bg-[#1a4d2e] hover:bg-[#143d24]">
              <Link to="/dashboard">Try Again</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/services">Browse Services</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
