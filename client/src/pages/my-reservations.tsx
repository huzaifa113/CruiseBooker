import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Ship, Users, CreditCard, Phone, Mail } from 'lucide-react';
// Remove date-fns import to avoid build issues
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function MyReservations() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showLookupForm, setShowLookupForm] = useState(!isAuthenticated);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [lookedUpBooking, setLookedUpBooking] = useState(null);

  // Show lookup form for unauthenticated users or when they choose to search
  if (!isAuthenticated || showLookupForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Reservation</h1>
            <p className="text-gray-600">Enter your confirmation number and last name to view your booking</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reservation Lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmation Number
                  </label>
                  <input
                    id="confirmation"
                    type="text"
                    value={confirmationNumber}
                    onChange={(e) => setConfirmationNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="As shown on booking"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>

              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/bookings/lookup?confirmationNumber=${confirmationNumber}&lastName=${lastName}`);
                    if (response.ok) {
                      const booking = await response.json();
                      setLookedUpBooking(booking);
                    } else {
                      toast({
                        title: "Reservation Not Found",
                        description: "Please check your confirmation number and last name",
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Unable to look up reservation",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={!confirmationNumber || !lastName}
                className="w-full bg-ocean-600 hover:bg-ocean-700 text-white"
              >
                Find Reservation
              </Button>

              {isAuthenticated && (
                <>
                  <Separator />
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLookupForm(false)}
                    className="w-full"
                  >
                    View My Account Bookings Instead
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {lookedUpBooking && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Reservation Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <strong>Confirmation:</strong> {(lookedUpBooking as any).confirmationNumber}
                    </div>
                    <div>
                      <strong>Status:</strong> <Badge className={getStatusColor((lookedUpBooking as any).paymentStatus)}>{(lookedUpBooking as any).paymentStatus}</Badge>
                    </div>
                    <div>
                      <strong>Primary Guest:</strong> {(lookedUpBooking as any).primaryGuestName}
                    </div>
                    <div>
                      <strong>Total Amount:</strong> ${(lookedUpBooking as any).totalPrice?.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['/api/user/bookings'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reservations</h1>
          <p className="text-gray-600">View and manage your cruise bookings</p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reservations Found</h3>
              <p className="text-gray-600 mb-6">You haven't made any cruise bookings yet.</p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-ocean-600 hover:bg-ocean-700 text-white"
              >
                Browse Cruises
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-ocean-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-ocean-900 mb-2">
                        {booking.cruise?.name || 'Cruise Booking'}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {booking.cruise?.departureDate 
                            ? new Date(booking.cruise.departureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
                            : 'Date TBD'
                          }
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.cruise?.departurePort || 'Port TBD'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.paymentStatus)}>
                        {booking.paymentStatus || 'Pending'}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Confirmation: {booking.confirmationNumber}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Booking Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Ship className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Cabin:</span>
                          <span className="ml-2 font-medium">
                            {booking.cabinType?.name || 'Standard Cabin'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Guests:</span>
                          <span className="ml-2 font-medium">
                            {booking.adults || 2} Adults, {booking.children || 0} Children
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">Total Price:</span>
                          <span className="ml-2 font-medium text-ocean-600">
                            ${booking.totalPrice?.toLocaleString() || 'TBD'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Primary Guest</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">
                            {booking.primaryGuestName || user?.firstName + ' ' + user?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">
                            {booking.primaryGuestEmail || user?.email}
                          </span>
                        </div>
                        {booking.primaryGuestPhone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">{booking.primaryGuestPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mt-6">
                      <Separator className="mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">Special Requests</h4>
                      <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Booked on {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                    </div>
                    <div className="space-x-2">
                      {booking.paymentStatus === 'completed' && (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}