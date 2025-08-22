import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SecurePaymentForm from '@/components/secure-payment-form';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import PromotionsSection from '@/components/promotions-section';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const StripePaymentWrapper = ({ booking, totalAmount }: { booking: any; totalAmount: number }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [currency, setCurrency] = useState('USD');
  
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

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log("Payment successful:", paymentIntentId);
  };

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: Math.round(convertedAmount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          bookingId: booking.id,
          description: `Cruise booking ${booking.confirmationNumber}`
        });
        setClientSecret(response.clientSecret);
      } catch (error) {
        console.error('Failed to create payment intent:', error);
      }
    };

    createPaymentIntent();
  }, [convertedAmount, currency, booking.id, booking.confirmationNumber]);

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full" />
          <span className="ml-3">Loading secure payment...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
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

        <SecurePaymentForm 
          booking={booking}
          totalAmount={convertedAmount}
          currency={currency}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </Elements>
  );
};

const CheckoutForm = ({ booking, totalAmount }: { booking: any; totalAmount: number }) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currency, setCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const discountedAmount = totalAmount - promotionDiscount;
  const convertedAmount = currency === 'USD' ? discountedAmount : 
                         currency === 'EUR' ? discountedAmount * 0.85 :
                         currency === 'SGD' ? discountedAmount * 1.35 :
                         currency === 'THB' ? discountedAmount * 35 : discountedAmount;

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; bookingId: string }) => {
      return await apiRequest('POST', '/api/create-payment-intent', data);
    }
  });

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log("Payment successful:", paymentIntentId);
  };

  const handlePromotionApplied = (discount: number, promotions: any[]) => {
    setPromotionDiscount(discount);
    setAppliedPromotions(promotions);
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
              {formatCurrency(totalAmount - (booking.taxAmount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35)) - (booking.gratuityAmount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35)), currency)}
            </span>
          </div>
          
          {promotionDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promotion Discount</span>
              <span data-testid="promotion-discount">
                -{formatCurrency(promotionDiscount * (currency === 'USD' ? 1 : currency === 'EUR' ? 0.85 : currency === 'SGD' ? 1.35 : 35), currency)}
              </span>
            </div>
          )}
          
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

      {/* Promotions Section */}
      <PromotionsSection 
        bookingAmount={totalAmount}
        onPromotionApplied={handlePromotionApplied}
        bookingData={{
          cruiseLine: booking.cruise?.cruiseLine,
          destination: booking.cruise?.destination
        }}
      />

      {/* Secure Payment Form */}
      <SecurePaymentForm 
        booking={booking}
        totalAmount={convertedAmount}
        currency={currency}
        onPaymentSuccess={handlePaymentSuccess}
      />
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

  // Create a demo booking for testing if no booking ID exists
  const createDemoBooking = async () => {
    const demoBooking = {
      cruiseId: "cruise-1",
      cabinTypeId: "",
      adultCount: 2,
      childCount: 0,
      seniorCount: 0,
      guestCount: 2,
      totalAmount: "2500.00",
      taxAmount: "300.00",
      gratuityAmount: "375.00",
      primaryGuestName: "John Doe",
      primaryGuestEmail: "john@example.com",
      guests: [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          dateOfBirth: "1990-01-01",
          passportNumber: "AB123456",
          passportExpiry: "2030-01-01",
          passportCountry: "US"
        },
        {
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          phone: "+1234567890",
          dateOfBirth: "1992-05-15",
          passportNumber: "CD789012",
          passportExpiry: "2029-05-15",
          passportCountry: "US"
        }
      ],
      extras: []
    };

    try {
      // Get cabin types for the cruise first
      const cabinResponse = await fetch(`/api/cruises/${demoBooking.cruiseId}/cabins`);
      const cabinTypes = await cabinResponse.json();
      if (cabinTypes.length > 0) {
        demoBooking.cabinTypeId = cabinTypes[0].id; // Use first available cabin type
      }

      const response = await apiRequest('POST', '/api/bookings', demoBooking);
      
      if (response.ok) {
        const booking = await response.json();
        setLocation(`/checkout/${booking.id}`);
      }
    } catch (error) {
      console.error('Error creating demo booking:', error);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Demo Checkout</h1>
            <p className="text-gray-600 mb-8">Create a demo booking to test the checkout process.</p>
            <Button onClick={createDemoBooking} className="bg-blue-600 text-white mr-4">
              Create Demo Booking
            </Button>
            <Button onClick={() => setLocation('/')} variant="outline">
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

  // bookingDetails is the booking object directly, not nested
  const booking = bookingDetails;
  const cruise = bookingDetails.cruise;
  const cabinType = bookingDetails.cabinType;
  const totalAmount = parseFloat(booking.totalAmount) + parseFloat(booking.taxAmount || "0") + parseFloat(booking.gratuityAmount || "0");

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

        {/* Create client secret for Stripe Elements */}
        <StripePaymentWrapper 
          booking={booking} 
          totalAmount={totalAmount} 
        />
      </div>

      <Footer />
    </div>
  );
}