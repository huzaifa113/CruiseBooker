import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from "@/components/header";
import Footer from "@/components/footer";
import SecurePaymentForm from "@/components/secure-payment-form";
import { PricingEngine, type PricingBreakdown, type PromotionRule } from "@shared/pricing-engine";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutContent = ({ bookingId }: { bookingId: string }) => {
  const [currency, setCurrency] = useState('USD');
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
  const [clientSecret, setClientSecret] = useState('');

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId, "details"],
    enabled: !!bookingId
  });

  // Fetch available promotions
  const { data: promotions, isLoading: promotionsLoading } = useQuery({
    queryKey: ["/api/promotions"],
    queryFn: async () => {
      const response = await fetch('/api/promotions');
      return response.json();
    }
  });

  // Calculate pricing when booking or currency changes
  useEffect(() => {
    if (!booking || !promotions) return;

    const cruise = booking.cruise;
    const cabinType = booking.cabinType;
    
    if (!cruise || !cabinType) return;

    // Prepare booking data for promotion eligibility
    const bookingData = {
      guestCount: booking.guestCount,
      adultCount: booking.adultCount,
      childCount: booking.childCount,
      seniorCount: booking.seniorCount,
      departureDate: cruise.departureDate,
      cruiseLine: cruise.cruiseLine,
      destination: cruise.destination,
      cabinType: cabinType.type
    };

    // Transform promotions to match PromotionRule interface
    const promotionRules: PromotionRule[] = promotions.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      discountType: p.discount_type,
      discountValue: parseFloat(p.discount_value),
      maxDiscount: p.max_discount ? parseFloat(p.max_discount) : undefined,
      conditions: p.conditions || {},
      validFrom: new Date(p.valid_from),
      validTo: new Date(p.valid_to),
      isActive: p.is_active,
      isCombinable: p.combinable_with?.length > 0,
      priority: p.priority || 1
    }));

    // Calculate pricing breakdown
    const breakdown = PricingEngine.calculatePricing(
      parseFloat(cruise.basePrice),
      parseFloat(cabinType.priceModifier),
      booking.guestCount,
      booking.extras || [],
      promotionRules,
      bookingData,
      currency
    );

    setPricingBreakdown(breakdown);

    // Create payment intent with final total
    createPaymentIntent(breakdown.finalTotal);
  }, [booking, promotions, currency]);

  const createPaymentIntent = async (amount: number) => {
    try {
      // Validate amount for Stripe
      const validation = PricingEngine.validatePaymentAmount(amount, currency);
      if (!validation.valid) {
        console.error('Payment amount validation failed:', validation.error);
        return;
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: currency.toLowerCase(),
          bookingId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log("Payment successful:", paymentIntentId);
  };

  if (bookingLoading || promotionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-8 space-y-6">
                  {Array(6).fill(0).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking || !pricingBreakdown) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="text-gray-600 mt-2">
              Review your cruise details and complete payment to confirm your reservation
            </p>
          </div>

          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Cruise</span>
                <span>{cruise?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ship</span>
                <span>{cruise?.ship} • {cruise?.cruiseLine}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cabin</span>
                <span>{cabinType?.name} ({cabinType?.type})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guests</span>
                <span>
                  {booking.guestCount} total ({booking.adultCount} adults
                  {booking.childCount > 0 && `, ${booking.childCount} children`}
                  {booking.seniorCount > 0 && `, ${booking.seniorCount} seniors`})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Departure</span>
                <span>
                  {new Date(cruise?.departureDate).toLocaleDateString()} from {cruise?.departurePort}
                </span>
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

          {/* Detailed Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Base Cruise Fare */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Cruise Fare ({booking.guestCount} guests)</span>
                  <span data-testid="base-fare">
                    {PricingEngine.formatCurrency(pricingBreakdown.baseCruiseFare, currency)}
                  </span>
                </div>
                
                {pricingBreakdown.cabinUpgrade > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Cabin Upgrade ({cabinType?.name})</span>
                    <span data-testid="cabin-upgrade">
                      {PricingEngine.formatCurrency(pricingBreakdown.cabinUpgrade, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Extras */}
              {booking.extras && booking.extras.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium">Extras & Add-ons:</div>
                    {booking.extras.map((extra: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{extra.name} (×{extra.quantity})</span>
                        <span data-testid={`extra-${index}`}>
                          {PricingEngine.formatCurrency(extra.price * extra.quantity, 'USD')} 
                          {currency !== 'USD' && ` → ${PricingEngine.formatCurrency((extra.price * extra.quantity) * (pricingBreakdown.finalTotal / (pricingBreakdown.baseCruiseFare + pricingBreakdown.cabinUpgrade + pricingBreakdown.extrasTotal + pricingBreakdown.taxAmount + pricingBreakdown.gratuityAmount)), currency)}`}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium">
                      <span>Extras Total</span>
                      <span data-testid="extras-total">
                        {PricingEngine.formatCurrency(pricingBreakdown.extrasTotal, currency)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              {/* Subtotal */}
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span data-testid="subtotal">
                  {PricingEngine.formatCurrency(pricingBreakdown.subtotal, currency)}
                </span>
              </div>

              {/* Taxes and Fees */}
              <div className="flex justify-between">
                <span>Taxes & Port Fees (9.5%)</span>
                <span data-testid="taxes">
                  {PricingEngine.formatCurrency(pricingBreakdown.taxAmount, currency)}
                </span>
              </div>

              {/* Gratuities */}
              <div className="flex justify-between">
                <span>Service Gratuities (12%)</span>
                <span data-testid="gratuities">
                  {PricingEngine.formatCurrency(pricingBreakdown.gratuityAmount, currency)}
                </span>
              </div>

              {/* Applied Promotions */}
              {pricingBreakdown.appliedPromotions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="font-medium text-green-700">Applied Discounts:</div>
                    {pricingBreakdown.appliedPromotions.map((promo, index) => (
                      <div key={index} className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-2">
                          {promo.name}
                          <Badge variant="secondary" className="text-xs">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : 'Fixed'}
                          </Badge>
                        </span>
                        <span data-testid={`discount-${index}`}>
                          -{PricingEngine.formatCurrency(promo.discountAmount, currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium text-green-700">
                      <span>Total Savings</span>
                      <span data-testid="total-discount">
                        -{PricingEngine.formatCurrency(pricingBreakdown.discountAmount, currency)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Final Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span data-testid="final-total">
                  {PricingEngine.formatCurrency(pricingBreakdown.finalTotal, currency)}
                </span>
              </div>

              {currency !== 'USD' && (
                <div className="text-sm text-gray-500 text-center">
                  Converted from USD at current exchange rate
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SecurePaymentForm 
                booking={booking}
                totalAmount={pricingBreakdown.finalTotal}
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

export default function Checkout() {
  const [location] = useLocation();
  const bookingId = location.split('/')[2];

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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