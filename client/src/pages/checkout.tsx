import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

const CheckoutForm = ({ booking, totalAmount }: { booking: any; totalAmount: number }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currency, setCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const convertedAmount = currency === 'USD' ? totalAmount : 
                         currency === 'EUR' ? totalAmount * 0.85 :
                         currency === 'SGD' ? totalAmount * 1.35 :
                         currency === 'THB' ? totalAmount * 35 : totalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Since we're skipping payment, we'll directly confirm the booking
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      
      toast({
        title: "Booking Confirmed!",
        description: "Your cruise reservation has been successfully created.",
      });

      // Redirect to confirmation page
      setLocation(`/confirmation/${booking.confirmationNumber}`);
    } catch (error: any) {
      toast({
        title: "Booking Error",
        description: "There was an issue processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-48" data-testid="select-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
              <SelectItem value="THB">THB - Thai Baht</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Cruise Fare ({booking.guestCount} guests)</span>
            <span data-testid="cruise-fare">
              {formatCurrency(convertedAmount - (booking.taxAmount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35)) - (booking.gratuityAmount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35)), currency)}
            </span>
          </div>
          
          {booking.extras && booking.extras.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="font-medium">Extras:</div>
                {booking.extras.map((extra: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{extra.name} (x{extra.quantity})</span>
                    <span data-testid={`extra-${index}`}>
                      {formatCurrency((extra.price * extra.quantity) * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35), currency)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <Separator />
          <div className="flex justify-between">
            <span>Taxes & Fees</span>
            <span data-testid="taxes">
              {formatCurrency(booking.taxAmount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35), currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Gratuities</span>
            <span data-testid="gratuities">
              {formatCurrency(booking.gratuityAmount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35), currency)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span data-testid="total-amount">
              {formatCurrency(convertedAmount, currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Payment processing has been simplified for this demonstration. 
              In a live environment, secure payment processing would be integrated.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Your booking will be confirmed immediately</p>
              <p>• You will receive a confirmation email</p>
              <p>• Booking confirmation number: <span className="font-medium">{booking.confirmationNumber}</span></p>
            </div>
            
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg"
              data-testid="button-submit-payment"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing Booking...
                </div>
              ) : (
                `Confirm Booking - ${formatCurrency(convertedAmount, currency)}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract booking ID from URL
  const bookingId = location.split('/checkout/')[1];
  
  const { data: bookingDetails, isLoading, error } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/details`],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      return response.json();
    },
    enabled: !!bookingId
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Booking",
        description: "Could not load booking details. Please try again.",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [error, toast, setLocation]);

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking</h1>
            <p className="text-gray-600 mb-8">No booking ID provided.</p>
            <Button onClick={() => setLocation('/')} className="bg-blue-600 text-white">
              Return Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-8">The booking you're looking for could not be found.</p>
            <Button onClick={() => setLocation('/')} className="bg-blue-600 text-white">
              Return Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { booking, cruise, cabinType } = bookingDetails;
  const totalAmount = booking.totalAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">
            {cruise.name} • {cabinType.name} • {booking.guestCount} guests
          </p>
        </div>

        <CheckoutForm booking={booking} totalAmount={totalAmount} />
      </div>

      <Footer />
    </div>
  );
}