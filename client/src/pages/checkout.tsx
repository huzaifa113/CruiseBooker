import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// Temporarily disabled Stripe integration
const STRIPE_ENABLED = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = STRIPE_ENABLED ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

const CheckoutForm = ({ booking, totalAmount }: { booking: any; totalAmount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currency, setCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ bookingId, status, stripePaymentIntentId }: { 
      bookingId: string; 
      status: string; 
      stripePaymentIntentId?: string; 
    }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${bookingId}/payment`, {
        status,
        stripePaymentIntentId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation/${booking.confirmationNumber}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        
        // Update booking status to failed
        await updatePaymentMutation.mutateAsync({
          bookingId: booking.id,
          status: 'failed'
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your cruise booking has been confirmed!",
        });
        
        // Update booking status to paid
        await updatePaymentMutation.mutateAsync({
          bookingId: booking.id,
          status: 'paid',
          stripePaymentIntentId: paymentIntent.id
        });
        
        // Redirect to confirmation page
        setLocation(`/confirmation/${booking.confirmationNumber}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Your payment information is secure and encrypted</p>
              <p>• You will receive a confirmation email after successful payment</p>
              <p>• Booking confirmation number: <span className="font-medium">{booking.confirmationNumber}</span></p>
            </div>
            
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full bg-coral-500 text-white hover:bg-coral-600 font-semibold py-3 text-lg"
              data-testid="button-submit-payment"
            >
              {isProcessing ? "Processing..." : `Pay ${formatCurrency(convertedAmount, currency)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const bookingId = location.split('/')[2];
  const [clientSecret, setClientSecret] = useState("");

  // Fetch booking details
  const { data: bookingDetails, isLoading, error } = useQuery({
    queryKey: ["/api/bookings", bookingId, "details"],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}/details`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }
      return response.json();
    },
    enabled: !!bookingId
  });

  useEffect(() => {
    if (bookingDetails?.booking) {
      const totalAmount = parseFloat(bookingDetails.booking.totalAmount);
      
      // Create PaymentIntent as soon as booking details are loaded
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: totalAmount,
        currency: "usd",
        bookingId: bookingDetails.booking.id 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [bookingDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <p className="text-gray-600 mb-8">
              The booking you're trying to pay for could not be found.
            </p>
            <Button onClick={() => setLocation('/')} data-testid="button-home">
              Return Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { booking, cruise, cabinType } = bookingDetails;
  const totalAmount = parseFloat(booking.totalAmount);

  // If Stripe is disabled, show a different UI
  if (!STRIPE_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Summary</h1>
            <p className="text-gray-600">
              Your cruise booking has been confirmed! Payment integration is temporarily disabled.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={cruise.imageUrl}
                      alt={cruise.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid="cruise-name">
                        {cruise.name}
                      </h3>
                      <p className="text-gray-600" data-testid="cruise-ship">
                        {cruise.ship}
                      </p>
                      <p className="text-sm text-gray-500" data-testid="cruise-dates">
                        {new Date(cruise.departureDate).toLocaleDateString()} - {new Date(cruise.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cabin:</span>
                      <span data-testid="cabin-type">{cabinType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span data-testid="guest-count">{booking.guestCount}</span>
                    </div>
                    {booking.diningTime && (
                      <div className="flex justify-between">
                        <span>Dining:</span>
                        <span data-testid="dining-time">{booking.diningTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Confirmation:</span>
                      <Badge variant="outline" data-testid="confirmation-number">
                        {booking.confirmationNumber}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Primary Guest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span data-testid="primary-guest-name">{booking.primaryGuestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span data-testid="primary-guest-email">{booking.primaryGuestEmail}</span>
                    </div>
                    {booking.primaryGuestPhone && (
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span data-testid="primary-guest-phone">{booking.primaryGuestPhone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Payment Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary (Demo Mode)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="text-xl font-bold" data-testid="total-amount">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      Payment processing is currently disabled for demonstration purposes. 
                      In a live environment, you would complete payment here.
                    </p>
                  </div>
                  <Button
                    onClick={() => setLocation(`/confirmation/${booking.confirmationNumber}`)}
                    className="w-full bg-coral-500 text-white hover:bg-coral-600"
                    data-testid="button-continue-demo"
                  >
                    Continue to Confirmation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            <span className="ml-3 text-gray-600">Preparing payment...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">
            You're just one step away from your amazing cruise experience!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={cruise.imageUrl}
                    alt={cruise.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900" data-testid="cruise-name">
                      {cruise.name}
                    </h3>
                    <p className="text-gray-600" data-testid="cruise-ship">
                      {cruise.ship}
                    </p>
                    <p className="text-sm text-gray-500" data-testid="cruise-dates">
                      {new Date(cruise.departureDate).toLocaleDateString()} - {new Date(cruise.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cabin:</span>
                    <span data-testid="cabin-type">{cabinType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span data-testid="guest-count">{booking.guestCount}</span>
                  </div>
                  {booking.diningTime && (
                    <div className="flex justify-between">
                      <span>Dining:</span>
                      <span data-testid="dining-time">{booking.diningTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Confirmation:</span>
                    <Badge variant="outline" data-testid="confirmation-number">
                      {booking.confirmationNumber}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Primary Guest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span data-testid="primary-guest-name">{booking.primaryGuestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span data-testid="primary-guest-email">{booking.primaryGuestEmail}</span>
                  </div>
                  {booking.primaryGuestPhone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span data-testid="primary-guest-phone">{booking.primaryGuestPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm booking={booking} totalAmount={totalAmount} />
            </Elements>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
