import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle, Download, Mail, Calendar } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Confirmation() {
  const [location, setLocation] = useLocation();
  const confirmationNumber = location.split('/')[2];

  // Fetch booking details by confirmation number
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["/api/bookings", "lookup", confirmationNumber],
    queryFn: async () => {
      // For demonstration, we'll need to extract last name from somewhere
      // In a real app, this would be handled differently
      const response = await fetch(`/api/bookings/lookup?confirmationNumber=${confirmationNumber}&lastName=Guest`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking confirmation");
      }
      return response.json();
    },
    enabled: !!confirmationNumber
  });

  const handleDownloadInvoice = () => {
    // TODO: Implement PDF invoice download
    console.log("Download invoice functionality to be implemented");
  };

  const handleEmailConfirmation = () => {
    // TODO: Implement email confirmation resend
    console.log("Email confirmation functionality to be implemented");
  };

  const handleAddToCalendar = () => {
    // TODO: Implement add to calendar functionality
    console.log("Add to calendar functionality to be implemented");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <Card>
              <CardContent className="p-8 space-y-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmation Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find a booking with confirmation number {confirmationNumber}.
              Please check your confirmation number and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation('/reservations')}
                data-testid="button-lookup-reservation"
              >
                Look Up Reservation
              </Button>
              <Button
                onClick={() => setLocation('/')}
                data-testid="button-home"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for choosing Phoenix Vacation Group
          </p>
          <p className="text-gray-600">
            Your cruise reservation has been successfully confirmed and payment processed.
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Booking Details
                <Badge 
                  variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                  className={booking.paymentStatus === 'paid' ? 'bg-green-600' : ''}
                  data-testid="payment-status"
                >
                  {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation Number:</span>
                <span className="font-semibold" data-testid="confirmation-number">
                  {booking.confirmationNumber}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date:</span>
                <span data-testid="booking-date">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Guests:</span>
                <span data-testid="guest-count">{booking.guestCount}</span>
              </div>
              
              {booking.diningTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dining Time:</span>
                  <span data-testid="dining-time">{booking.diningTime}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Primary Guest:</span>
                <span data-testid="primary-guest">{booking.primaryGuestName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-sm" data-testid="guest-email">{booking.primaryGuestEmail}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cruise Information */}
          <Card>
            <CardHeader>
              <CardTitle>Cruise Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1" data-testid="cruise-name">
                  Caribbean Paradise {/* This would come from cruise lookup */}
                </h3>
                <p className="text-gray-600" data-testid="ship-name">
                  Harmony of the Seas {/* This would come from cruise lookup */}
                </p>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Departure:</span>
                <span data-testid="departure-info">
                  Miami, FL - March 15, 2024 {/* This would come from cruise lookup */}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span data-testid="duration">7 Days / 6 Nights</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span data-testid="destination">Caribbean</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Cabin Type:</span>
                <span data-testid="cabin-type">Balcony</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Cruise Fare:</span>
              <span data-testid="cruise-fare">
                {formatCurrency((parseFloat(booking.totalAmount) - parseFloat(booking.taxAmount) - parseFloat(booking.gratuityAmount)).toString())}
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
                        {formatCurrency((extra.price * extra.quantity).toString())}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <Separator />
            <div className="flex justify-between">
              <span>Taxes & Fees:</span>
              <span data-testid="taxes">{formatCurrency(booking.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gratuities:</span>
              <span data-testid="gratuities">{formatCurrency(booking.gratuityAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid:</span>
              <span data-testid="total-paid">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center"
            data-testid="button-download-invoice"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
          <Button
            variant="outline"
            onClick={handleEmailConfirmation}
            className="flex items-center justify-center"
            data-testid="button-email-confirmation"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Confirmation
          </Button>
          <Button
            variant="outline"
            onClick={handleAddToCalendar}
            className="flex items-center justify-center"
            data-testid="button-add-calendar"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• You'll receive a detailed confirmation email within 24 hours</li>
              <li>• Check-in online opens 60 days before departure</li>
              <li>• Review your cruise documents and travel requirements</li>
              <li>• Consider purchasing travel insurance for your trip</li>
              <li>• Start planning your shore excursions and onboard activities</li>
            </ul>
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need help or have questions about your booking?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <i className="fas fa-phone mr-2 text-ocean-600"></i>
              <span>+66 2 123 4567</span>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <i className="fas fa-envelope mr-2 text-ocean-600"></i>
              <span>support@phoenixvacations.com</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
