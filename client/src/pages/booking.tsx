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
import { useCruiseId } from "@/hooks/use-route-params";
import type { CabinType, Extra } from "@shared/schema";
import type { BookingFormData, BookingExtra } from "@/lib/types";

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const cruiseId = useCruiseId();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingFormData>>({
    cruiseId: cruiseId || undefined,
    guestCount: 2,
    adultCount: 2,
    childCount: 0,
    seniorCount: 0,
    extras: []
  });

  const steps = ["Cabin", "Dining", "Extras", "Guests"];

  // Check for edit mode and pre-populate data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    
    if (isEditMode) {
      const bookingId = urlParams.get('bookingId');
      const cabinType = urlParams.get('cabinType');
      const guestCount = urlParams.get('guestCount');
      const diningTime = urlParams.get('diningTime');
      const extrasParam = urlParams.get('extras');
      
      console.log('🔄 Edit mode detected, pre-populating booking data...');
      
      // Pre-populate booking data with existing values
      setBookingData(prev => ({
        ...prev,
        cabinTypeId: cabinType || undefined,
        guestCount: guestCount ? parseInt(guestCount) : 2,
        adultCount: guestCount ? parseInt(guestCount) : 2,
        diningTime: diningTime || undefined,
        extras: extrasParam ? JSON.parse(extrasParam) : []
      }));
      
      toast({
        title: "Edit Mode Active",
        description: "Your existing booking details have been loaded for editing.",
      });
    }
  }, [toast]);

  // Fetch cruise details
  const { data: cruise, isLoading: cruiseLoading, error: cruiseError } = useQuery({
    queryKey: ["/api/cruises", cruiseId],
    queryFn: async () => {
      const response = await fetch(`/api/cruises/${cruiseId}`, {
        credentials: "include"
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cruise details: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    enabled: !!cruiseId,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Fetch cabin types
  const { data: cabinTypes, isLoading: cabinsLoading, error: cabinsError } = useQuery({
    queryKey: ["/api/cruises", cruiseId, "cabins"],
    queryFn: async () => {
      console.log('📡 Fetching cabin types for cruise:', cruiseId);
      const response = await fetch(`/api/cruises/${cruiseId}/cabins`, {
        credentials: "include"
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch cabin types:', response.status, errorText);
        throw new Error(`Failed to fetch cabin types: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('✅ Cabin types loaded:', data?.length || 0, 'cabins');
      return data;
    },
    enabled: !!cruiseId,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Fetch extras
  const { data: extras, isLoading: extrasLoading, error: extrasError } = useQuery({
    queryKey: ["/api/extras"],
    queryFn: async () => {
      const response = await fetch("/api/extras", {
        credentials: "include"
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch extras: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
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
    console.log("✨ handleStepContinue called!");
    console.log("📊 Step navigation:", {
      currentStep: currentStep,
      totalSteps: steps.length,
      currentStepName: steps[currentStep - 1],
      isLastStep: currentStep >= steps.length
    });
    
    if (currentStep < steps.length) {
      console.log("➡️ Moving to next step:", steps[currentStep]);
      setCurrentStep(prev => prev + 1);
      // Scroll to top of page on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Proceed to checkout/payment
      console.log("💳 LAST STEP REACHED - Proceeding to checkout!");
      console.log("📋 Final booking data before checkout:", JSON.stringify(bookingData, null, 2));
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
    console.log("🚀 proceedToCheckout function called!");
    
    try {
      console.log("🔍 Validating booking data:", {
        cabinTypeId: bookingData.cabinTypeId,
        primaryGuestName: bookingData.primaryGuestName,
        primaryGuestEmail: bookingData.primaryGuestEmail,
        guestCount: bookingData.guestCount,
        hasGuests: bookingData.guests ? bookingData.guests.length : 0
      });
      
      // Validate required fields
      if (!bookingData.cabinTypeId) {
        console.log("❌ Validation failed: Missing cabin type");
        toast({
          title: "Cabin Required",
          description: "Please select a cabin before proceeding.",
          variant: "destructive"
        });
        setCurrentStep(1);
        return;
      }

      if (!bookingData.primaryGuestName || !bookingData.primaryGuestEmail) {
        console.log("❌ Validation failed: Missing guest details", {
          primaryGuestName: bookingData.primaryGuestName,
          primaryGuestEmail: bookingData.primaryGuestEmail
        });
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

      console.log("✅ All validation passed, creating booking request");
      
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

      console.log("📦 Sending booking request to API:", JSON.stringify(bookingRequest, null, 2));
      
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(bookingRequest)
      });
      
      console.log("🔄 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error response:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`Failed to create booking: ${response.status} ${errorText}`);
      }

      const booking = await response.json();
      console.log("✅ Booking created successfully:", booking);
      
      // Redirect to checkout
      console.log("🔄 Redirecting to checkout page:", `/checkout/${booking.id}`);
      setLocation(`/checkout/${booking.id}`);
      
    } catch (error) {
      console.error("🚨 CRITICAL ERROR in proceedToCheckout:", {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        bookingData: bookingData
      });
      toast({
        title: "Booking Error",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading state
  if (cruiseLoading || cabinsLoading || extrasLoading) {
    console.log('⏳ Booking page loading...', { cruiseLoading, cabinsLoading, extrasLoading });
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
  if (cruiseError || cabinsError || extrasError || !cruise || !cruiseId) {
    const errorMessage = cruiseError?.message || cabinsError?.message || extrasError?.message || 'Unknown error';
    console.error('❌ Booking page error:', { cruiseError, cabinsError, extrasError, errorMessage, cruiseId, location });
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cruise Not Found</h1>
            <p className="text-gray-600 mb-4">
              The cruise you're looking for could not be found or is no longer available.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left max-w-md mx-auto mb-8">
                <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
                <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                  Location: {typeof location === 'string' ? location : JSON.stringify(location)}
                  Cruise ID: {cruiseId || 'null'}
                  Error: {errorMessage}
                </pre>
              </details>
            )}
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
        {/* Edit Mode Banner */}
        {new URLSearchParams(window.location.search).get('edit') === 'true' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Edit Mode Active
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  You're editing an existing booking. Your previous selections have been loaded.
                </div>
              </div>
            </div>
          </div>
        )}
        
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
                isLoading={cabinsLoading}
                error={cabinsError}
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
