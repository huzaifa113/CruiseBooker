import { useState } from 'react';
import { Check, Bed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { CabinType } from '@shared/schema';

interface CabinSelectionProps {
  cabinTypes: CabinType[];
  selectedCabinId: string | null;
  onCabinSelect: (cabinId: string) => void;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: Error | null;
}

export default function CabinSelection({
  cabinTypes,
  selectedCabinId,
  onCabinSelect,
  onContinue,
  onBack,
  isLoading = false,
  error = null,
}: CabinSelectionProps) {
  const [locationPreference, setLocationPreference] = useState<string>('guarantee');

  const formatPrice = (basePrice: string, modifier: string) => {
    const price = parseFloat(basePrice) * parseFloat(modifier);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedCabin = cabinTypes.find((cabin) => cabin.id === selectedCabinId);

  return (
    <div className="space-y-8" data-testid="cabin-selection">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Cabin</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-medium">Error loading cabin types</div>
            <div className="text-red-600 text-sm mt-1">{error.message}</div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && cabinTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Bed className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cabins Available</h3>
            <p className="text-gray-600">
              Sorry, there are no cabin types available for this cruise.
            </p>
          </div>
        )}

        {!isLoading && !error && cabinTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {cabinTypes.map((cabin) => (
              <Card
                key={cabin.id}
                className={`cursor-pointer transition-colors ${
                  selectedCabinId === cabin.id
                    ? 'border-ocean-300 bg-ocean-50'
                    : 'border-gray-200 hover:border-ocean-300'
                }`}
                onClick={() => onCabinSelect(cabin.id)}
                data-testid={`cabin-card-${cabin.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold text-gray-900"
                        data-testid={`cabin-name-${cabin.id}`}
                      >
                        {cabin.name}
                      </h3>
                      <p
                        className="text-sm text-gray-600"
                        data-testid={`cabin-description-${cabin.id}`}
                      >
                        {cabin.description}
                      </p>
                      {cabin.type === 'Balcony' && (
                        <Badge variant="secondary" className="bg-coral-500 text-white mt-1">
                          Most Popular
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div
                        className="text-xl font-bold text-gray-900"
                        data-testid={`cabin-price-${cabin.id}`}
                      >
                        {formatPrice('1000', cabin.priceModifier)}
                      </div>
                      <div className="text-sm text-gray-600">per person</div>
                    </div>
                  </div>

                  <img
                    src={cabin.imageUrl}
                    alt={cabin.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />

                  <div className="space-y-2 text-sm">
                    {cabin.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        <span data-testid={`amenity-${cabin.id}-${index}`}>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedCabinId && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cabin Location Preference</h3>
            <RadioGroup value={locationPreference} onValueChange={setLocationPreference}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Label
                  htmlFor="guarantee"
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-ocean-300 transition-colors"
                >
                  <RadioGroupItem
                    value="guarantee"
                    id="guarantee"
                    className="text-ocean-600"
                    data-testid="radio-guarantee"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Guarantee Cabin</div>
                    <div className="text-sm text-gray-600">
                      Best price, random location assignment
                    </div>
                  </div>
                </Label>
                <Label
                  htmlFor="choose"
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-ocean-300 transition-colors"
                >
                  <RadioGroupItem
                    value="choose"
                    id="choose"
                    className="text-ocean-600"
                    data-testid="radio-choose"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Choose Location</div>
                    <div className="text-sm text-gray-600">
                      Select specific deck and position (+$50)
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 w-full sm:w-auto"
          data-testid="button-back"
        >
          Back to Results
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedCabinId}
          className="bg-ocean-600 text-white hover:bg-ocean-700 font-semibold px-8 py-3 w-full sm:w-auto"
          data-testid="button-continue"
        >
          Continue to Dining
        </Button>
      </div>
    </div>
  );
}
