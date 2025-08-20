import { Heart, MapPin, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Cruise } from "@shared/schema";

interface CruiseCardProps {
  cruise: Cruise;
  onViewItinerary?: (cruise: Cruise) => void;
  onSelectCruise?: (cruise: Cruise) => void;
  compact?: boolean;
}

export default function CruiseCard({ cruise, onViewItinerary, onSelectCruise, compact = false }: CruiseCardProps) {
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
      <Card className="hover:shadow-xl transition-shadow">
        <div className="relative h-48">
          <img
            src={cruise.imageUrl}
            alt={cruise.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="destructive">Hot Deal</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-lg hover:bg-white"
            data-testid={`button-favorite-${cruise.id}`}
          >
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
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
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900" data-testid={`text-price-${cruise.id}`}>
                {formatPrice(cruise.basePrice)}
              </span>
              <span className="text-sm text-gray-600">/person</span>
            </div>
            <Button
              onClick={() => onSelectCruise?.(cruise)}
              className="bg-ocean-600 text-white hover:bg-ocean-700 font-medium"
              data-testid={`button-view-details-${cruise.id}`}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 relative">
          <img
            src={cruise.imageUrl}
            alt={cruise.name}
            className="w-full h-48 lg:h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="destructive">Save 40%</Badge>
          </div>
        </div>
        <div className="lg:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center mb-2">
                <img
                  src={cruise.cruiseLineLogoUrl}
                  alt={`${cruise.cruiseLine} logo`}
                  className="w-16 h-10 object-cover rounded mr-3"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900" data-testid={`text-cruise-name-${cruise.id}`}>
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
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                data-testid={`button-view-cabins-${cruise.id}`}
              >
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
  );
}
