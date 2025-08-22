import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle, Download, Mail, Calendar, MapPin, Ship, Users, CreditCard } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfirmationSuccess() {
  const [location] = useLocation();
  const bookingId = location.split('/')[2];

  // Fetch booking details by booking ID
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["/api/bookings", bookingId, "details"],
    enabled: !!bookingId
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = () => {
    console.log("Download invoice functionality to be implemented");
  };

  const handleEmailConfirmation = () => {
    console.log("Email confirmation functionality to be implemented");
  };

  const handleAddToCalendar = () => {
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
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 text-red-600">⚠</div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Not Found</h1>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find the booking details. If you just completed a payment, please wait a moment and refresh the page.
              </p>
            </div>
            <div className="space-y-4">
              <Button onClick={() => window.location.reload()} className="bg-ocean-600 hover:bg-ocean-700">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Return Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const cruise = booking?.cruise;
  const cabinType = booking?.cabinType;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Thank you for your booking. Your cruise reservation has been confirmed and you'll receive a confirmation email shortly.
            </p>
          </div>

          {/* Confirmation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {booking?.paymentStatus?.charAt(0).toUpperCase() + booking?.paymentStatus?.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confirmation Number */}
              <div className="bg-ocean-50 p-4 rounded-lg">
                <div className="text-sm text-ocean-700 mb-1">Confirmation Number</div>
                <div className="text-xl font-bold text-ocean-900" data-testid="confirmation-number">
                  {booking?.confirmationNumber}
                </div>
              </div>

              {/* Cruise Information */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Ship className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-semibold">{cruise?.name}</div>
                    <div className="text-gray-600">{cruise?.ship} • {cruise?.cruiseLine}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-semibold">Destination</div>
                    <div className="text-gray-600">{cruise?.destination}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-semibold">Departure</div>
                    <div className="text-gray-600">
                      {cruise?.departureDate && formatDate(cruise.departureDate)} from {cruise?.departurePort}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Users className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="font-semibold">Guests & Cabin</div>
                    <div className="text-gray-600">
                      {booking?.guestCount} guests • {cabinType?.name}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Primary Guest */}
              <div className="space-y-2">
                <div className="font-semibold">Primary Guest</div>
                <div className="text-gray-600">
                  <div>{booking?.primaryGuestName}</div>
                  <div>{booking?.primaryGuestEmail}</div>
                  {booking?.primaryGuestPhone && <div>{booking?.primaryGuestPhone}</div>}
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold">Payment Summary</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cruise Fare</span>
                    <span>{formatCurrency(
                      parseFloat(booking?.totalAmount || '0') - 
                      parseFloat(booking?.taxAmount || '0') - 
                      parseFloat(booking?.gratuityAmount || '0'), 
                      booking?.currency || 'USD'
                    )}</span>
                  </div>
                  
                  {booking?.extras && booking.extras.length > 0 && (
                    <>
                      {booking.extras.map((extra: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{extra.name} (×{extra.quantity})</span>
                          <span>{formatCurrency(extra.price * extra.quantity, booking?.currency || 'USD')}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>{formatCurrency(parseFloat(booking?.taxAmount || '0'), booking?.currency || 'USD')}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Gratuities</span>
                    <span>{formatCurrency(parseFloat(booking?.gratuityAmount || '0'), booking?.currency || 'USD')}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Paid</span>
                    <span>{formatCurrency(parseFloat(booking?.totalAmount || '0'), booking?.currency || 'USD')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={handleDownloadInvoice} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </Button>
            
            <Button variant="outline" onClick={handleEmailConfirmation} className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Confirmation</span>
            </Button>
            
            <Button variant="outline" onClick={handleAddToCalendar} className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Add to Calendar</span>
            </Button>
          </div>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold mb-2">What's Next?</div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>You'll receive a detailed confirmation email within 15 minutes</li>
                  <li>Check-in opens 24 hours before departure</li>
                  <li>Ensure all guests have valid passports for international cruises</li>
                  <li>Arrive at the port 2-3 hours before departure time</li>
                </ul>
              </div>
              
              <div>
                <div className="font-semibold mb-2">Need Help?</div>
                <p className="text-gray-600">
                  Contact our customer service at support@phoenixvacationgroup.com or call 1-800-PHOENIX for assistance with your booking.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center space-y-4">
            <Button onClick={() => window.location.href = "/my-reservations"} className="bg-ocean-600 hover:bg-ocean-700">
              View My Reservations
            </Button>
            <div>
              <Button variant="link" onClick={() => window.location.href = "/"}>
                Return to Home Page
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}