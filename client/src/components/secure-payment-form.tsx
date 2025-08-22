import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface SecurePaymentFormProps {
  booking: any;
  totalAmount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

export default function SecurePaymentForm({ 
  booking, 
  totalAmount, 
  currency, 
  onPaymentSuccess 
}: SecurePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const handlePaymentElementReady = () => {
    setPaymentReady(true);
  };

  const validatePaymentForm = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Payment System Error",
        description: "Payment system is not ready. Please refresh the page.",
        variant: "destructive"
      });
      return false;
    }

    // Submit form to validate all fields
    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast({
        title: "Payment Information Required",
        description: submitError.message || "Please complete all required payment fields",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processSecurePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step 1: Validate payment form
    const isValid = await validatePaymentForm();
    if (!isValid) return;

    setIsProcessing(true);

    try {
      // Step 2: Create secure payment intent
      console.log("Creating payment intent for amount:", totalAmount, currency);
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          bookingId: booking.id,
          description: `Cruise booking ${booking.confirmationNumber}`
        })
      });
      
      const paymentData = await response.json();
      if (!paymentData.clientSecret) {
        throw new Error('Invalid payment setup');
      }

      // Step 3: Confirm payment with Stripe
      console.log("Confirming payment with Stripe...");
      const { error, paymentIntent } = await stripe!.confirmPayment({
        elements: elements!,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation/${booking.confirmationNumber}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Stripe payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please check your card details and try again.",
          variant: "destructive"
        });
        return;
      }

      // Step 4: Verify payment success
      if (paymentIntent?.status === 'succeeded') {
        console.log("Payment succeeded, confirming booking...");
        
        // Step 5: Confirm booking with backend
        await fetch(`/api/bookings/${booking.id}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            amount: totalAmount,
            currency: currency,
            paymentStatus: 'completed'
          })
        });
        
        toast({
          title: "Payment Successful!",
          description: `Your booking has been confirmed. Amount charged: ${formatCurrency(totalAmount, currency)}`,
        });
        
        // Step 6: Redirect to confirmation success page
        onPaymentSuccess(paymentIntent.id);
        setLocation(`/confirmation-success/${bookingId}`);
        
      } else if (paymentIntent?.status === 'requires_action') {
        toast({
          title: "Additional Authentication Required",
          description: "Please complete the additional authentication step.",
          variant: "default"
        });
      } else {
        throw new Error('Payment processing failed');
      }

    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={processSecurePayment} className="space-y-6">
          {/* Payment Element */}
          <div className="space-y-4">
            <h3 className="font-medium">Payment Information</h3>
            <PaymentElement 
              onReady={handlePaymentElementReady}
              options={{
                layout: 'tabs'
              }}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span data-testid="total-amount">{formatCurrency(totalAmount, currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Booking Reference:</span>
              <span>{booking.confirmationNumber}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Your payment will be processed securely by Stripe. No payment will be charged until you click "Confirm Booking" below.
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!paymentReady || isProcessing || !stripe || !elements}
            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white font-semibold py-3"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Processing Payment...
              </div>
            ) : (
              `Confirm Booking - ${formatCurrency(totalAmount, currency)}`
            )}
          </Button>

          {!paymentReady && (
            <div className="text-center text-sm text-gray-500">
              Loading secure payment form...
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}