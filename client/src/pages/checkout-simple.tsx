import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useDeals } from '@/lib/deals-context';
import { DiscountValidator, Deal, BookingInfo, ValidationResult } from '@/lib/discount-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Gift } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from '@/components/header';
import Footer from '@/components/footer';
import SecurePaymentForm from '@/components/secure-payment-form';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutContent = ({ bookingId }: { bookingId: string }) => {
  const [currency, setCurrency] = useState('USD');
  const [clientSecret, setClientSecret] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountValidation, setDiscountValidation] = useState<ValidationResult | null>(null);
  const [availableDeals, setAvailableDeals] = useState<Deal[]>([]);
  const { selectedDeal, clearSelectedDeal } = useDeals();
  const { toast } = useToast();

  // Fetch booking details
  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'details'],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}/details`);
      if (!response.ok) {
        throw new Error(`Failed to fetch booking details: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!bookingId,
  });

  // Fetch available deals
  const { data: deals } = useQuery({
    queryKey: ['/api/promotions'],
    queryFn: async () => {
      const response = await fetch('/api/promotions');
      return response.json();
    },
  });

  // Convert database deals to our Deal interface
  useEffect(() => {
    if (deals) {
      const formattedDeals: Deal[] = deals.map((deal: any) => ({
        id: deal.id,
        name: deal.name,
        description: deal.description,
        discountType: deal.discountType === 'percentage' ? 'percentage' : 'fixed',
        discountValue: parseFloat(deal.discountValue),
        conditions: deal.conditions || {},
      }));
      setAvailableDeals(formattedDeals);
    }
  }, [deals]);

  // Calculate base pricing
  const calculateBaseTotal = () => {
    if (!booking?.cruise || !booking?.cabinType) return 0;

    const baseAmount =
      parseFloat(booking.cruise.basePrice) *
      parseFloat(booking.cabinType.priceModifier) *
      booking.guestCount;
    const extrasAmount =
      booking.extras?.reduce(
        (total: number, extra: any) => total + extra.price * extra.quantity,
        0
      ) || 0;
    const subtotal = baseAmount + extrasAmount;
    const taxAmount = subtotal * 0.095; // 9.5% tax
    const gratuityAmount = subtotal * 0.12; // 12% gratuity

    return subtotal + taxAmount + gratuityAmount;
  };

  const baseTotal = calculateBaseTotal();
  const finalTotal = Math.max(0, baseTotal - appliedDiscount);

  // Convert currency
  const convertAmount = (amount: number) => {
    const rates: { [key: string]: number } = {
      USD: 1,
      EUR: 0.85,
      SGD: 1.35,
      THB: 32.5,
    };
    return amount * rates[currency];
  };

  // Create booking info for validation
  const createBookingInfo = (): BookingInfo | null => {
    if (!booking?.cruise) return null;

    return {
      departureDate: booking.departureDate || booking.cruise.departureDate,
      totalAmount: baseTotal,
      guestCount: booking.guestCount,
      cruiseLine: booking.cruise.cruiseLine,
      destination: booking.cruise.destination,
      enteredCouponCode: couponCode.trim().toUpperCase(),
    };
  };

  // Validate and apply selected deal
  const validateAndApplyDeal = (deal: Deal) => {
    const bookingInfo = createBookingInfo();
    if (!bookingInfo) return;

    const validation = DiscountValidator.validateDeal(deal, bookingInfo);
    setDiscountValidation(validation);

    if (validation.isValid && validation.discountAmount) {
      setAppliedDiscount(validation.discountAmount);
      toast({
        title: 'Deal Applied!',
        description: `You saved $${validation.discountAmount.toFixed(2)} with ${deal.name}`,
      });
    } else {
      setAppliedDiscount(0);
      toast({
        title: 'Deal Requirements Not Met',
        description: validation.reason,
        variant: 'destructive',
      });
    }
  };

  // Handle selected deal from context
  useEffect(() => {
    if (selectedDeal && availableDeals.length > 0) {
      const deal = availableDeals.find((d) => d.id === selectedDeal.id);
      if (deal) {
        validateAndApplyDeal(deal);
      }
    }
  }, [selectedDeal, availableDeals, booking]);

  // Handle coupon code validation
  const handleCouponValidation = () => {
    if (!couponCode.trim()) return;

    // Find deal with matching coupon code
    const matchingDeal = availableDeals.find(
      (deal) => deal.conditions.couponCode?.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (matchingDeal) {
      validateAndApplyDeal(matchingDeal);
    } else {
      setDiscountValidation({
        isValid: false,
        reason: 'Invalid coupon code',
      });
      setAppliedDiscount(0);
      toast({
        title: 'Invalid Coupon',
        description: 'The coupon code you entered is not valid',
        variant: 'destructive',
      });
    }
  };

  // Create payment intent
  useEffect(() => {
    if (finalTotal > 0) {
      createPaymentIntent();
    }
  }, [finalTotal, currency]);

  const createPaymentIntent = async () => {
    try {
      const convertedAmount = convertAmount(finalTotal);

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: convertedAmount,
          currency: currency.toLowerCase(),
          bookingId,
        }),
      });

      if (response.ok) {
        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Payment successful - redirect to confirmation
    window.location.href = `/confirmation/${bookingId}`;
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">Loading booking details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking Not Found</h1>
            <p className="text-gray-600 mt-2">Unable to load booking details.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const cruise = booking.cruise;
  const cabinType = booking.cabinType;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="text-gray-600 mt-2">
              {cruise?.name} • {cabinType?.name} • {booking.guestCount} guests
            </p>
          </div>

          {/* Selected Deal Banner */}
          {selectedDeal && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">{selectedDeal.name}</h3>
                      <p className="text-sm text-green-700">{selectedDeal.description}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {DiscountValidator.formatDiscountText(selectedDeal as Deal)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearSelectedDeal}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discount Validation Alert */}
          {discountValidation && (
            <Alert
              className={
                discountValidation.isValid
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }
            >
              <div className="flex items-center space-x-2">
                {discountValidation.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={discountValidation.isValid ? 'text-green-800' : 'text-red-800'}
                >
                  {discountValidation.isValid
                    ? `Deal applied! You saved $${discountValidation.discountAmount?.toFixed(2)}`
                    : `Deal requirements not met: ${discountValidation.reason}`}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Coupon Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Label htmlFor="couponCode">Enter Coupon Code (Optional)</Label>
                  <Input
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCouponValidation} disabled={!couponCode.trim()}>
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-48">
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

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Cruise Fare ({booking.guestCount} guests)</span>
                <span>${(baseTotal * 0.8).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & Port Fees (9.5%)</span>
                <span>${(baseTotal * 0.095).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Service Gratuities (12%)</span>
                <span>${(baseTotal * 0.12).toFixed(2)}</span>
              </div>

              {booking.extras && booking.extras.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium">Extras:</div>
                    {booking.extras.map((extra: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {extra.name} (×{extra.quantity})
                        </span>
                        <span>${(extra.price * extra.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${baseTotal.toFixed(2)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Applied</span>
                  <span>-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total ({currency})</span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                  }).format(convertAmount(finalTotal))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SecurePaymentForm
                booking={booking}
                totalAmount={convertAmount(finalTotal)}
                currency={currency}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default function CheckoutSimple() {
  const [location] = useLocation();
  const bookingId = location.split('/')[2];

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Invalid Booking</h1>
            <p className="text-gray-600 mt-2">No booking ID provided.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return <CheckoutContent bookingId={bookingId} />;
}
