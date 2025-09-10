import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Ship, Users, CreditCard, Phone, Mail, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function MyReservations() {
  const { toast } = useToast();
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [lookedUpBooking, setLookedUpBooking] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!confirmationNumber.trim() || !lastName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both confirmation number and last name',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/bookings/lookup?confirmationNumber=${confirmationNumber.trim().toUpperCase()}&lastName=${lastName.trim()}`
      );
      if (response.ok) {
        const booking = await response.json();
        setLookedUpBooking(booking);
        toast({
          title: 'Reservation Found',
          description: 'Your booking details are displayed below',
        });
      } else {
        toast({
          title: 'Reservation Not Found',
          description: 'Please check your confirmation number and last name',
          variant: 'destructive',
        });
        setLookedUpBooking(null);
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Unable to search for reservation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const downloadCalendar = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/calendar`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cruise-itinerary-${confirmationNumber}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Calendar Downloaded',
          description: 'Your cruise itinerary has been added to your calendar app',
        });
      } else {
        throw new Error('Failed to download calendar');
      }
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to download calendar. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Reservation</h1>
          <p className="text-gray-600">
            Enter your confirmation number and last name to view your booking details
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Reservation Lookup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="confirmation"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmation Number
                </label>
                <input
                  id="confirmation"
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  data-testid="input-confirmation"
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
                  data-testid="input-lastname"
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full md:w-auto"
              data-testid="button-search"
            >
              {isSearching ? 'Searching...' : 'Find My Reservation'}
            </Button>
          </CardContent>
        </Card>

        {/* Show booking details if found */}
        {lookedUpBooking && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Confirmation</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {lookedUpBooking.paymentStatus || 'Confirmed'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-ocean-50 p-4 rounded-lg">
                  <div className="text-sm text-ocean-700 mb-1">Confirmation Number</div>
                  <div
                    className="text-xl font-bold text-ocean-900"
                    data-testid="confirmation-display"
                  >
                    {lookedUpBooking.confirmationNumber}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Ship className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">Cruise Details</span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <div className="font-medium">
                        {lookedUpBooking.cruise?.name || 'Cruise Name Not Available'}
                      </div>
                      <div>
                        {lookedUpBooking.cruise?.ship || 'Ship'} •{' '}
                        {lookedUpBooking.cruise?.cruiseLine || 'Cruise Line'}
                      </div>
                      <div>{lookedUpBooking.cruise?.duration || 'N/A'} days</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">Travel Dates</span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <div>
                        Departure:{' '}
                        {lookedUpBooking.cruise?.departureDate
                          ? new Date(lookedUpBooking.cruise.departureDate).toLocaleDateString()
                          : 'Date TBD'}
                      </div>
                      <div>
                        Return:{' '}
                        {lookedUpBooking.cruise?.returnDate
                          ? new Date(lookedUpBooking.cruise.returnDate).toLocaleDateString()
                          : 'Date TBD'}
                      </div>
                      <div>From: {lookedUpBooking.cruise?.departurePort || 'Port TBD'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">Guests & Cabin</span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <div>{lookedUpBooking.guestCount} guests</div>
                      <div>{lookedUpBooking.cabinType?.name}</div>
                      <div>{lookedUpBooking.cabinType?.type}</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">Primary Guest</span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <div>{lookedUpBooking.primaryGuestName}</div>
                      <div>{lookedUpBooking.primaryGuestEmail}</div>
                      {lookedUpBooking.primaryGuestPhone && (
                        <div>{lookedUpBooking.primaryGuestPhone}</div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">Payment Summary</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Amount Paid</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          parseFloat(lookedUpBooking.totalAmount || '0'),
                          lookedUpBooking.currency || 'USD'
                        )}
                      </span>
                    </div>
                    {lookedUpBooking.extras && lookedUpBooking.extras.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-1">Included Extras:</div>
                        {lookedUpBooking.extras.map((extra: any, index: number) => (
                          <div key={index}>
                            • {extra.name} (×{extra.quantity})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => downloadCalendar(lookedUpBooking.id)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Itinerary</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setConfirmationNumber('');
                      setLastName('');
                      setLookedUpBooking(null);
                    }}
                    variant="outline"
                  >
                    Search Another Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
