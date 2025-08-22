import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookingProgress from "@/components/booking-progress";
import CabinSelection from "@/components/cabin-selection";
import DiningSelection from "@/components/dining-selection";
import ExtrasSelection from "@/components/extras-selection";
import GuestDetails from "@/components/guest-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { CabinType, Extra } from "@shared/schema";
import type { BookingFormData, BookingExtra } from "@/lib/types";

export default function Booking() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const cruiseId = location.split('/')[2];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingFormData>>({
    cruiseId,
    guestCount: 2,
    adultCount: 2,
    childCount: 0,
    seniorCount: 0,
    extras: []
  });

  const steps = ["Cabin", "Dining", "Extras", "Guests"];

  // Fetch cruise details
  const { data: cruise, isLoading: cruiseLoading, error: cruiseError } = useQuery({
    queryKey: ["/api/cruises", cruiseId],
    queryFn: async () => {
      const response = await fetch(`/api/cruises/${cruiseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cruise details");
      }
      return response.json();
    },
    enabled: !!cruiseId
  });

  // Fetch cabin types
  const { data: cabinTypes, isLoading: cabinsLoading } = useQuery({
    queryKey: ["/api/cruises", cruiseId, "cabins"],
    queryFn: async () => {
      const response = await fetch(`/api/cruises/${cruiseId}/cabins`);
      if (!response.ok) {
        throw new Error("Failed to fetch cabin types");
      }
      return response.json();
    },
    enabled: !!cruiseId
  });

  // Fetch extras
  const { data: extras, isLoading: extrasLoading } = useQuery({
    queryKey: ["/api/extras"],
    queryFn: async () => {
      const response = await fetch("/api/extras");
      if (!response.ok) {
        throw new Error("Failed to fetch extras");
      }
      return response.json();
    }
  });

  const handleCabinSelect = (cabinId: string) => {
    setBookingData(prev => ({ ...prev, cabinTypeId: cabinId }));
  };

  const handleDiningTimeSelect = (time: string) => {
    setBookingData(prev => ({ ...prev, diningTime: time }));
  };

  const handleExtrasChange = (selectedExtras: BookingExtra[]) => {
    setBookingData(prev => ({ ...prev, extras: selectedExtras }));
  };

  const handleGuestCountChange = (adults: number, children: number, seniors: number) => {
    setBookingData(prev => ({
      ...prev,
      adultCount: adults,
      childCount: children,
      seniorCount: seniors,
      guestCount: adults + children + seniors
    }));
  };

  const handleGuestDetailsChange = (guestDetails: any) => {
    setBookingData(prev => ({ ...prev, ...guestDetails }));
  };

  const handleStepContinue = () => {
    console.log(`Current step: ${currentStep}, Total steps: ${steps.length}`);
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      // Scroll to top of page on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Proceed to checkout/payment
      console.log("Proceeding to checkout...");
      proceedToCheckout();
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      // Scroll to top of page on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Go back to search results or cruise details
      setLocation('/search');
    }
  };

  const proceedToCheckout = async () => {
    try {
      // Validate required fields
      if (!bookingData.cabinTypeId) {
        toast({
          title: "Cabin Required",
          description: "Please select a cabin before proceeding.",
          variant: "destructive"
        });
        setCurrentStep(1);
        return;
      }

      if (!bookingData.primaryGuestName || !bookingData.primaryGuestEmail) {
        toast({
          title: "Guest Details Required",
          description: "Please complete all required guest information.",
          variant: "destructive"
        });
        setCurrentStep(4);
        return;
      }

      // Calculate total amount
      const selectedCabin = cabinTypes?.find((cabin: CabinType) => cabin.id === bookingData.cabinTypeId);
      if (!selectedCabin || !cruise) {
        throw new Error("Missing cabin or cruise information");
      }

      const baseAmount = parseFloat(cruise.basePrice) * parseFloat(selectedCabin.priceModifier) * bookingData.guestCount!;
      const extrasAmount = bookingData.extras?.reduce((total, extra) => total + (extra.price * extra.quantity), 0) || 0;
      const subtotal = baseAmount + extrasAmount;
      const taxAmount = subtotal * 0.1; // 10% tax
      const gratuityAmount = subtotal * 0.15; // 15% gratuity
      const totalAmount = subtotal + taxAmount + gratuityAmount;

      // Create booking
      const bookingRequest = {
        cruiseId: bookingData.cruiseId!,
        cabinTypeId: bookingData.cabinTypeId!,
        guestCount: bookingData.guestCount!,
        adultCount: bookingData.adultCount!,
        childCount: bookingData.childCount!,
        seniorCount: bookingData.seniorCount!,
        diningTime: bookingData.diningTime,
        specialRequests: bookingData.specialRequests,
        totalAmount: totalAmount.toString(),
        taxAmount: taxAmount.toString(),
        gratuityAmount: gratuityAmount.toString(),
        currency: "USD",
        paymentStatus: "pending",
        primaryGuestName: bookingData.primaryGuestName!,
        primaryGuestEmail: bookingData.primaryGuestEmail!,
        primaryGuestPhone: bookingData.primaryGuestPhone,
        guests: bookingData.guests || [],
        extras: bookingData.extras || []
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingRequest)
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const booking = await response.json();
      
      // Redirect to checkout
      setLocation(`/checkout/${booking.id}`);
      
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Error",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if (cruiseLoading || cabinsLoading || extrasLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-16 w-full" />
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <Skeleton className="h-6 w-48" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (cruiseError || !cruise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cruise Not Found</h1>
            <p className="text-gray-600 mb-8">
              The cruise you're looking for could not be found or is no longer available.
            </p>
            <button
              onClick={() => setLocation('/search')}
              className="bg-ocean-600 text-white px-6 py-3 rounded-lg hover:bg-ocean-700 transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Cruise Summary Header */}
      <section className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <img
              src={cruise.imageUrl}
              alt={cruise.name}
              className="w-full sm:w-20 sm:h-20 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900" data-testid="cruise-name">
                {cruise.name}
              </h1>
              <p className="text-sm md:text-base text-gray-600" data-testid="cruise-details">
                {cruise.ship} • {cruise.duration} Days • {cruise.destination}
              </p>
              <p className="text-xs md:text-sm text-gray-500" data-testid="departure-date">
                Departing {new Date(cruise.departureDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 lg:py-16">
        <BookingProgress currentStep={currentStep} steps={steps} />
        
        <Card className="shadow-sm border border-gray-200 mt-6">
          <CardContent className="p-4 md:p-6 lg:p-8">
            {currentStep === 1 && (
              <CabinSelection
                cabinTypes={cabinTypes || []}
                selectedCabinId={bookingData.cabinTypeId || null}
                onCabinSelect={handleCabinSelect}
                onContinue={handleStepContinue}
                onBack={handleStepBack}
              />
            )}

            {currentStep === 2 && (
              <DiningSelection
                selectedDiningTime={bookingData.diningTime || null}
                onDiningTimeSelect={handleDiningTimeSelect}
                onContinue={handleStepContinue}
                onBack={handleStepBack}
              />
            )}

            {currentStep === 3 && (
              <ExtrasSelection
                extras={extras || []}
                selectedExtras={bookingData.extras || []}
                onExtrasChange={handleExtrasChange}
                onContinue={handleStepContinue}
                onBack={handleStepBack}
              />
            )}

            {currentStep === 4 && (
              <GuestDetails
                adultCount={bookingData.adultCount || 2}
                childCount={bookingData.childCount || 0}
                seniorCount={bookingData.seniorCount || 0}
                onGuestCountChange={handleGuestCountChange}
                formData={bookingData}
                onFormDataChange={handleGuestDetailsChange}
                onContinue={handleStepContinue}
                onBack={handleStepBack}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
