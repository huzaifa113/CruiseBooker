import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroSearch from "@/components/hero-search";
import CruiseCard from "@/components/cruise-card";
import ItineraryModal from "@/components/itinerary-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cruise } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);

  // Fetch featured cruises (limit to 6 for homepage)
  const { data: cruises, isLoading, error } = useQuery({
    queryKey: ["/api/cruises"],
    queryFn: async () => {
      const response = await fetch("/api/cruises?sortBy=rating&sortOrder=desc");
      if (!response.ok) {
        throw new Error("Failed to fetch cruises");
      }
      const data = await response.json();
      return data.slice(0, 6); // Show only top 6 for featured section
    }
  });

  const handleViewItinerary = (cruise: Cruise) => {
    setSelectedCruise(cruise);
    setIsItineraryModalOpen(true);
  };

  const handleSelectCruise = (cruise: Cruise) => {
    setLocation(`/booking/${cruise.id}`);
  };

  const handleBookCruise = (cruise: Cruise) => {
    setIsItineraryModalOpen(false);
    setLocation(`/booking/${cruise.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Search */}
      <HeroSearch />

      {/* Featured Cruises Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Cruises
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked luxury cruise experiences at unbeatable prices
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Skeleton className="w-12 h-8 rounded mr-3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <i className="fas fa-exclamation-triangle text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Featured Cruises
              </h3>
              <p className="text-gray-600">
                We're experiencing technical difficulties. Please try again later or use the search above to find cruises.
              </p>
            </div>
          )}

          {cruises && cruises.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-ship text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Featured Cruises Available
              </h3>
              <p className="text-gray-600">
                Check back soon for our latest cruise offerings, or use the search above to explore available options.
              </p>
            </div>
          )}

          {cruises && cruises.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cruises.map((cruise: Cruise) => (
                <CruiseCard
                  key={cruise.id}
                  cruise={cruise}
                  onViewItinerary={handleViewItinerary}
                  onSelectCruise={handleSelectCruise}
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Phoenix Vacation Group?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-award text-ocean-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">25+ Years Experience</h3>
              <p className="text-gray-600">Trusted by thousands of travelers for luxury cruise experiences worldwide.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-dollar-sign text-ocean-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">We'll match any competitor's price and beat it by 5%.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-ocean-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Expert cruise consultants available around the clock to help you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Modal */}
      <ItineraryModal
        cruise={selectedCruise}
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        onBookCruise={handleBookCruise}
      />

      <Footer />
    </div>
  );
}
