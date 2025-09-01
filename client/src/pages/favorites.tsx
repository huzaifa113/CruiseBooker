import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CruiseCard from "@/components/cruise-card";
import ItineraryModal from "@/components/itinerary-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Users, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { Cruise } from "@shared/schema";

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === undefined) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your saved cruises.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [isAuthenticated, user, toast]);

  // Fetch user's favorites
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Handle cruise actions (same as home page)
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

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (cruiseId: string) => {
      await apiRequest("DELETE", `/api/favorites/${cruiseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: "Cruise has been removed from your saved cruises.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove cruise from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to view your saved cruises.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved cruises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error Loading Favorites</CardTitle>
            <CardDescription>
              There was an error loading your saved cruises. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Saved Cruises</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your favorite cruise experiences, saved for future planning and booking.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!favorites || favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Cruises</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't saved any cruises yet. Start exploring our amazing cruise destinations 
              and save the ones you love!
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Explore Cruises
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {favorites.length} Saved Cruise{favorites.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-gray-600">
                Click on any cruise to view details and book your next adventure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite: any) => {
                const cruise = favorite.cruise;
                return (
                  <div key={favorite.id} className="relative">
                    {/* Remove favorite button overlay */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm"
                      onClick={() => removeFavoriteMutation.mutate(cruise.id)}
                      disabled={removeFavoriteMutation.isPending}
                      data-testid={`button-remove-favorite-${cruise.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    
                    {/* Use same CruiseCard component as home page */}
                    <CruiseCard
                      cruise={cruise}
                      onViewItinerary={handleViewItinerary}
                      onSelectCruise={handleSelectCruise}
                      compact={true}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />

      {/* Itinerary Modal - same as home page */}
      <ItineraryModal
        cruise={selectedCruise}
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        onBook={handleBookCruise}
      />
    </div>
  );
}