import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Ship, Users, CreditCard, Phone, Mail } from 'lucide-react';
// Remove date-fns import to avoid build issues
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

export default function MyReservations() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

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