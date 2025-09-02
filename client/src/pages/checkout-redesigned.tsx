import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useDeals } from "@/lib/deals-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
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
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<{
    isValid: boolean;
    message: string;
    promotion?: any;
  } | null>(null);
  const { selectedDeal } = useDeals();

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId, "details"],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingId}/details`);
      if (!response.ok) {
        throw new Error(`Failed to fetch booking details: ${response.status}`);
      }
      return response.json();
    },
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
    let promotionRules: PromotionRule[] = promotions.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      discountType: (p.discountType || p.discount_type) === 'fixed_amount' ? 'fixed' : (p.discountType || p.discount_type),
      discountValue: parseFloat(p.discountValue || p.discount_value),
      maxDiscount: p.max_discount ? parseFloat(p.max_discount) : undefined,
      conditions: p.conditions || {},
      validFrom: new Date(p.validFrom || p.valid_from),
      validTo: new Date(p.validTo || p.valid_to),
      isActive: p.isActive !== undefined ? p.isActive : p.is_active,
      isCombinable: p.combinable_with?.length > 0,
      priority: p.priority || 1
    }));

    // If there's a selected deal from context or booking, prioritize it
    const dealToApply = selectedDeal || (booking.selectedPromotionId ? 
      promotionRules.find(p => p.id === booking.selectedPromotionId) : null);
    
    if (dealToApply && !promotionRules.find(p => p.id === dealToApply.id)) {
      // Add the selected deal to the promotion rules if it's not already there
      promotionRules.unshift({
        id: dealToApply.id,
        name: dealToApply.name,
        description: dealToApply.description,
        discountType: dealToApply.discountType === 'fixed_amount' ? 'fixed' : dealToApply.discountType,
        discountValue: dealToApply.discountValue,
        conditions: dealToApply.conditions || {},
        validFrom: new Date(),
        validTo: new Date(),
        isActive: true,
        isCombinable: false,
        priority: 1
      });
    }

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

  // Validate coupon code
  const validateCouponCode = async (code: string) => {
    if (!code.trim()) {
      setCouponValidation(null);
      return;
    }

    try {
      // Find promotion with matching coupon code
      const matchingPromotion = promotions?.find((promo: any) => 
        promo.conditions?.requiredCouponCode === code
      );

      if (!matchingPromotion) {
        setCouponValidation({
          isValid: false,
          message: "Invalid coupon code",
        });
        return;
      }

      // Check if promotion is eligible
      if (!booking || !booking.cruise) return;

      const bookingData = {
        guestCount: booking.guestCount,
        adultCount: booking.adultCount,
        childCount: booking.childCount,
        seniorCount: booking.seniorCount,
        departureDate: booking.cruise.departureDate,
        cruiseLine: booking.cruise.cruiseLine,
        destination: booking.cruise.destination,
        cabinType: booking.cabinType?.type,
        couponCode: code
      };

      const response = await fetch('/api/promotions/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promotionIds: [matchingPromotion.id],
          bookingData,
          bookingAmount: pricingBreakdown?.subtotal || 0
        })
      });

      const result = await response.json();

      if (result.eligible) {
        setCouponValidation({
          isValid: true,
          message: `Valid! ${matchingPromotion.discountType === 'percentage' 
            ? `${matchingPromotion.discountValue}% discount` 
            : `$${matchingPromotion.discountValue} off`}`,
          promotion: matchingPromotion
        });
      } else {
        setCouponValidation({
          isValid: false,
          message: result.reason || "Coupon not eligible for this booking",
        });
      }
    } catch (error) {
      setCouponValidation({
        isValid: false,
        message: "Error validating coupon code",
      });
    }
  };

  // Handle coupon code change with debouncing
  const handleCouponCodeChange = (value: string) => {
    setCouponCode(value);
    
    // Clear validation when input changes
    if (couponValidation) {
      setCouponValidation(null);
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

          {/* Selected Deal Banner */}
          {(selectedDeal || booking.selectedPromotionId) && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  🎉 Deal Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-green-700">
                  <h3 className="font-semibold">{selectedDeal?.name || 'Special Promotion'}</h3>
                  <p className="text-sm">{selectedDeal?.description || 'Promotional discount has been applied to your booking.'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coupon Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="couponCode">Enter Coupon Code (Optional)</Label>
                    <Input
                      id="couponCode"
                      value={couponCode}
                      onChange={(e) => handleCouponCodeChange(e.target.value)}
                      placeholder="Enter coupon code"
                      className="mt-1"
                      data-testid="input-coupon-code"
                    />
                  </div>
                  <div className="flex-shrink-0 flex items-end">
                    <Button 
                      type="button" 
                      onClick={() => validateCouponCode(couponCode)}
                      disabled={!couponCode.trim()}
                      variant="outline"
                      data-testid="button-validate-coupon"
                    >
                      Validate
                    </Button>
                  </div>
                </div>
                
                {/* Coupon Validation Message */}
                {couponValidation && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    couponValidation.isValid 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {couponValidation.isValid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {couponValidation.message}
                    </span>
                  </div>
                )}
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