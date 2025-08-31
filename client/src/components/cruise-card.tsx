import { Heart, MapPin, Calendar, Star, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CabinCarousel from "@/components/cabin-carousel";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Cruise, CabinType } from "@shared/schema";

interface CruiseCardProps {
  cruise: Cruise;
  onViewItinerary?: (cruise: Cruise) => void;
  onSelectCruise?: (cruise: Cruise) => void;
  compact?: boolean;
}

export default function CruiseCard({ cruise, onViewItinerary, onSelectCruise, compact = false }: CruiseCardProps) {
  const [showCabinCarousel, setShowCabinCarousel] = useState(false);
  const [selectedCabinType, setSelectedCabinType] = useState<any>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cabin types for this cruise
  const { data: cabinTypes, isLoading: cabinTypesLoading, error: cabinTypesError } = useQuery({
    queryKey: ["/api/cruises", cruise.id, "cabins"],
    queryFn: async () => {
      const response = await fetch(`/api/cruises/${cruise.id}/cabins`, {
        credentials: "include"
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cabin types: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    enabled: !!cruise.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Check if cruise is favorited
  const { data: favoriteData } = useQuery({
    queryKey: ["/api/favorites", cruise.id, "check"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch(`/api/favorites/${cruise.id}/check`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`Failed to check favorite status: ${response.status}`);
      }
      return response.json();
    }
  });

  // Add/remove favorite mutations
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/favorites", { cruiseId: cruise.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", cruise.id, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to Favorites",
        description: `${cruise.name} has been added to your favorites.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Favorite",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/favorites/${cruise.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", cruise.id, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: `${cruise.name} has been removed from your favorites.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Favorite",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleViewCabins = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log('🚪 View Cabins clicked!', { cabinTypes, length: cabinTypes?.length, loading: cabinTypesLoading, error: cabinTypesError });
    
    // If still loading, don't proceed
    if (cabinTypesLoading) {
      console.log('⏳ Still loading cabin data...');
      return;
    }
    
    // If error occurred, show error
    if (cabinTypesError) {
      console.error('❌ Error loading cabin types:', cabinTypesError);
      return;
    }
    
    if (cabinTypes && cabinTypes.length > 0) {
      const firstCabin = cabinTypes[0];
      console.log('🏠 Setting cabin data:', firstCabin);
      
      setSelectedCabinType({
        name: firstCabin.name,
        description: firstCabin.description,
        cabinImages: firstCabin.cabinImages || []
      });
      setShowCabinCarousel(true);
      console.log('✅ Cabin carousel should open now');
    } else {
      console.error('❌ No cabin types available!', cabinTypes);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(parseFloat(price));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  if (compact) {
    return (
      <>
        <Card className="hover:shadow-xl transition-shadow" data-testid={`cruise-card-${cruise.id}`}>
          <div className="relative h-48">
            <img
              src={cruise.imageUrl}
              alt={cruise.name}
              className="w-full h-full object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNydWlzZSBJbWFnZTwvdGV4dD48L3N2Zz4=";
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-lg hover:bg-white"
              data-testid={`button-favorite-${cruise.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  toast({
                    title: "Login Required",
                    description: "Please log in to save favorites.",
                    variant: "destructive"
                  });
                  return;
                }
                
                const isFav = favoriteData?.isFavorite;
                if (isFav) {
                  removeFavoriteMutation.mutate();
                } else {
                  addFavoriteMutation.mutate();
                }
              }}
              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
            >
              <Heart 
                className={`w-4 h-4 ${favoriteData?.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} 
              />
            </Button>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center mb-3">
              <img
                src={cruise.cruiseLineLogoUrl}
                alt={`${cruise.cruiseLine} logo`}
                className="w-12 h-8 object-cover rounded mr-3"
              />
              <div>
                <h3 className="font-semibold text-gray-900" data-testid={`text-cruise-name-${cruise.id}`}>
                  {cruise.name}
                </h3>
                <p className="text-sm text-gray-600" data-testid={`text-ship-name-${cruise.id}`}>
                  {cruise.ship}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="w-4 h-4 mr-2 text-ocean-600" />
                <span data-testid={`text-destination-${cruise.id}`}>{cruise.destination}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-ocean-600" />
                <span data-testid={`text-duration-${cruise.id}`}>{cruise.duration} Days / {cruise.duration - 1} Nights</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900" data-testid={`text-price-${cruise.id}`}>
                    {formatPrice(cruise.basePrice)}
                  </span>
                  <p className="text-xs text-gray-600">per person</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewItinerary?.(cruise)}
                  className="flex-1 bg-ocean-100 text-ocean-700 hover:bg-ocean-200 border-ocean-200"
                  data-testid={`button-see-itinerary-${cruise.id}`}
                >
                  See Itinerary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewCabins}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  data-testid={`button-view-cabins-${cruise.id}`}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  View Cabins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <CabinCarousel
          isOpen={showCabinCarousel}
          onClose={() => setShowCabinCarousel(false)}
          cabinType={selectedCabinType}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-ocean-400 overflow-hidden" data-testid={`cruise-card-${cruise.id}`}>
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-2/5 min-h-[200px] md:min-h-[280px]">
            <img
              src={cruise.imageUrl}
              alt={cruise.name}
              className="w-full h-full object-cover rounded-tl-lg md:rounded-tl-lg md:rounded-bl-lg md:rounded-tr-none"
              loading="lazy"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('auto=compress')) {
                  target.src = cruise.imageUrl + '&auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
                } else {
                  target.src = `data:image/svg+xml;base64,${btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#4285f4"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle" dy=".3em">${cruise.name}</text></svg>`)}`;
                }
              }}
            />
            
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {cruise.rating}
              </Badge>
            </div>
            
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-coral-500 text-white text-xs px-2 py-1">
                {cruise.duration} Days
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded-lg hover:bg-white"
              data-testid={`button-favorite-large-${cruise.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  toast({
                    title: "Login Required",
                    description: "Please log in to save favorites.",
                    variant: "destructive"
                  });
                  return;
                }
                
                const isFav = favoriteData?.isFavorite;
                if (isFav) {
                  removeFavoriteMutation.mutate();
                } else {
                  addFavoriteMutation.mutate();
                }
              }}
              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
            >
              <Heart 
                className={`w-5 h-5 ${favoriteData?.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} 
              />
            </Button>
          </div>
          
          <div className="p-6 md:w-3/5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={cruise.cruiseLineLogoUrl}
                    alt={`${cruise.cruiseLine} logo`}
                    className="w-12 h-8 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MT0dPPC90ZXh0Pjwvc3ZnPg==";
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1" data-testid={`text-cruise-name-${cruise.id}`}>
                      {cruise.name}
                    </h3>
                    <p className="text-gray-600" data-testid={`text-ship-name-${cruise.id}`}>{cruise.ship}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-ocean-600" />
                  <span data-testid={`text-duration-${cruise.id}`}>{cruise.duration} days, {cruise.duration - 1} nights</span>
                  <span className="mx-2">•</span>
                  <span data-testid={`text-departure-date-${cruise.id}`}>{formatDate(cruise.departureDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-ocean-600" />
                  <span data-testid={`text-destination-${cruise.id}`}>{cruise.destination}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500 transition-colors"
                data-testid={`button-favorite-${cruise.id}`}
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewItinerary?.(cruise)}
                  className="bg-ocean-100 text-ocean-700 hover:bg-ocean-200 border-ocean-200"
                  data-testid={`button-see-itinerary-${cruise.id}`}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  See Itinerary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewCabins}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  data-testid={`button-view-cabins-${cruise.id}`}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  View Cabins
                </Button>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900" data-testid={`text-price-${cruise.id}`}>
                    {formatPrice(cruise.basePrice)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">per person, from interior</p>
                <Button
                  onClick={() => onSelectCruise?.(cruise)}
                  className="bg-coral-500 text-white hover:bg-coral-600 font-semibold"
                  data-testid={`button-select-cruise-${cruise.id}`}
                >
                  Select Cruise
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <CabinCarousel
        isOpen={showCabinCarousel}
        onClose={() => setShowCabinCarousel(false)}
        cabinType={selectedCabinType}
      />
    </>
  );
}