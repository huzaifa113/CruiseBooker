import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Download, Mail, Edit } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Reservations() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [lookupForm, setLookupForm] = useState({
    confirmationNumber: "",
    lastName: ""
  });
  const [shouldLookup, setShouldLookup] = useState(false);

  // Fetch booking details when lookup is triggered
  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/bookings", "lookup", lookupForm.confirmationNumber, lookupForm.lastName],
    queryFn: async () => {
      const response = await fetch(
        `/api/bookings/lookup?confirmationNumber=${lookupForm.confirmationNumber}&lastName=${lookupForm.lastName}`
      );
      if (!response.ok) {
        throw new Error("Booking not found");
      }
      return response.json();
    },
    enabled: shouldLookup && !!lookupForm.confirmationNumber && !!lookupForm.lastName
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lookupForm.confirmationNumber || !lookupForm.lastName) {
      toast({
        title: "Required fields missing",
        description: "Please enter both confirmation number and last name.",
        variant: "destructive"
      });
      return;
    }

    setShouldLookup(true);
    refetch();
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement PDF invoice download
    toast({
      title: "Download Started",
      description: "Your invoice download will begin shortly.",
    });
  };

  const handleEmailConfirmation = async () => {
    if (!booking?.id) {
      toast({
        title: "Error",
        description: "No booking found to send confirmation.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Email Sent Successfully!",
          description: `Confirmation details have been sent to ${result.sentTo}`,
        });
      } else {
        toast({
          title: "Email Send Failed",
          description: result.message || "Failed to send confirmation email.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast({
        title: "Email Send Failed",
        description: "Failed to send confirmation email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManageBooking = () => {
    if (!booking?.cruiseId) {
      toast({
        title: "Error",
        description: "Unable to edit booking - missing cruise information.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to booking page with edit mode parameters
    const editParams = new URLSearchParams({
      edit: 'true',
      bookingId: booking.id,
      confirmationNumber: booking.confirmationNumber,
      cabinType: booking.cabinTypeId || '',
      guestCount: booking.guestCount?.toString() || '2',
      diningTime: booking.diningTime || '',
      extras: JSON.stringify(booking.extras || [])
    });

    setLocation(`/booking/${booking.cruiseId}?${editParams.toString()}`);
    
    toast({
      title: "Redirecting to Edit Booking",
      description: "Loading your existing booking details for editing...",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Reservations</h1>
          <p className="text-xl text-gray-600">Look up your cruise booking details</p>
        </div>

        {/* Lookup Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Find Your Reservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="confirmationNumber">Reservation Number *</Label>
                  <Input
                    id="confirmationNumber"
                    type="text"
                    placeholder="ABC123456"
                    value={lookupForm.confirmationNumber}
                    onChange={(e) => setLookupForm(prev => ({ 
                      ...prev, 
                      confirmationNumber: e.target.value.toUpperCase() 
                    }))}
                    className="focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    data-testid="input-confirmation-number"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    value={lookupForm.lastName}
                    onChange={(e) => setLookupForm(prev => ({ 
                      ...prev, 
                      lastName: e.target.value 
                    }))}
                    className="focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-ocean-600 text-white hover:bg-ocean-700 font-semibold"
                data-testid="button-lookup"
              >
                {isLoading ? "Searching..." : "Look Up Reservation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && shouldLookup && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <i className="fas fa-search text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Reservation Not Found
              </h3>
              <p className="text-red-700 mb-4">
                We couldn't find a reservation with the provided confirmation number and last name. 
                Please check your information and try again.
              </p>
              <div className="text-sm text-red-600 space-y-1">
                <p>• Make sure your confirmation number is correct (e.g., ABC123456)</p>
                <p>• Enter the last name exactly as it appears on your booking</p>
                <p>• Check your email confirmation for the correct details</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        {booking && shouldLookup && !error && (
          <Card data-testid="reservation-details">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-gray-900 mb-2" data-testid="cruise-title">
                    Caribbean Paradise {/* This would come from cruise lookup */}
                  </CardTitle>
                  <p className="text-gray-600" data-testid="ship-name">
                    Harmony of the Seas {/* This would come from cruise lookup */}
                  </p>
                  <p className="text-sm text-gray-500" data-testid="confirmation-display">
                    Confirmation: {booking.confirmationNumber}
                  </p>
                </div>
                <Badge 
                  variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                  className={booking.paymentStatus === 'paid' ? 'bg-green-600' : ''}
                  data-testid="status-badge"
                >
                  {booking.paymentStatus === 'paid' ? 'Confirmed' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Cruise Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cruise Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Departure:</span>
                      <span data-testid="departure-date">March 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span data-testid="cruise-duration">7 days, 6 nights</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cabin:</span>
                      <span data-testid="cabin-details">Balcony - Deck 8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span data-testid="guest-summary">{booking.guestCount} Guests</span>
                    </div>
                    {booking.diningTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dining:</span>
                        <span data-testid="dining-preference">{booking.diningTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Billing Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cruise Fare:</span>
                      <span data-testid="cruise-fare-amount">
                        {formatCurrency(
                          (parseFloat(booking.totalAmount) - parseFloat(booking.taxAmount) - parseFloat(booking.gratuityAmount)).toString()
                        )}
                      </span>
                    </div>
                    
                    {booking.extras && booking.extras.length > 0 && (
                      <>
                        {booking.extras.map((extra: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{extra.name}:</span>
                            <span data-testid={`extra-amount-${index}`}>
                              {formatCurrency((extra.price * extra.quantity).toString())}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees:</span>
                      <span data-testid="tax-amount">{formatCurrency(booking.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gratuities:</span>
                      <span data-testid="gratuity-amount">{formatCurrency(booking.gratuityAmount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span data-testid="total-amount">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-3">Guest Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Primary Guest:</span>
                      <span className="ml-2 font-medium" data-testid="primary-guest-info">
                        {booking.primaryGuestName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2" data-testid="guest-email-info">
                        {booking.primaryGuestEmail}
                      </span>
                    </div>
                    {booking.primaryGuestPhone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2" data-testid="guest-phone-info">
                          {booking.primaryGuestPhone}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="ml-2" data-testid="booking-date-info">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleDownloadInvoice}
                  className="flex-1 bg-ocean-100 text-ocean-700 hover:bg-ocean-200 border-ocean-200"
                  data-testid="button-download-invoice"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEmailConfirmation}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  data-testid="button-email-confirmation"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Confirmation
                </Button>
                <Button
                  onClick={handleManageBooking}
                  className="flex-1 bg-coral-500 text-white hover:bg-coral-600"
                  data-testid="button-manage-booking"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Can't find your reservation?</h4>
                <ul className="text-sm space-y-1">
                  <li>• Check your email confirmation for the correct confirmation number</li>
                  <li>• Make sure you're using the exact last name from your booking</li>
                  <li>• Contact our support team for assistance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Contact Support</h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-center">
                    <i className="fas fa-phone mr-2"></i>
                    <span>+66 2 123 4567</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-envelope mr-2"></i>
                    <span>support@phoenixvacations.com</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock mr-2"></i>
                    <span>24/7 Support Available</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
