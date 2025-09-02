import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Extra } from "@shared/schema";
import type { BookingExtra } from "@/lib/types";

interface ExtrasSelectionProps {
  extras: Extra[];
  selectedExtras: BookingExtra[];
  onExtrasChange: (extras: BookingExtra[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function ExtrasSelection({
  extras,
  selectedExtras,
  onExtrasChange,
  onContinue,
  onBack
}: ExtrasSelectionProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(parseFloat(price));
  };

  const getExtraQuantity = (extraId: string) => {
    const extra = selectedExtras.find(e => e.id === extraId);
    return extra?.quantity || 0;
  };

  const updateExtraQuantity = (extraId: string, quantity: number, name: string, price: number) => {
    const updatedExtras = selectedExtras.filter(e => e.id !== extraId);
    
    if (quantity > 0) {
      updatedExtras.push({
        id: extraId,
        name,
        price,
        quantity
      });
    }
    
    onExtrasChange(updatedExtras);
  };

  const getTotalCost = () => {
    return selectedExtras.reduce((total, extra) => total + (extra.price * extra.quantity), 0);
  };

  const extrasByCategory = extras.reduce((acc, extra) => {
    if (!acc[extra.category]) {
      acc[extra.category] = [];
    }
    acc[extra.category].push(extra);
    return acc;
  }, {} as Record<string, Extra[]>);

  const categoryLabels = {
    wifi: "Internet & Communication",
    beverages: "Beverage Packages",
    dining: "Specialty Dining",
    excursions: "Shore Excursions",
    spa: "Spa & Wellness"
  };

  return (
    <div className="space-y-8" data-testid="extras-selection">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Cruise Extras</h2>
        <p className="text-gray-600 mb-8">
          Enhance your cruise experience with these optional extras. You can always add more later.
        </p>
        
        <div className="space-y-8">
          {Object.entries(extrasByCategory).map(([category, categoryExtras]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid={`category-${category}`}>
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryExtras.map((extra) => {
                  const quantity = getExtraQuantity(extra.id);
                  return (
                    <Card key={extra.id} className="border-gray-200" data-testid={`extra-card-${extra.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2" data-testid={`extra-name-${extra.id}`}>
                              {extra.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3" data-testid={`extra-description-${extra.id}`}>
                              {extra.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900" data-testid={`extra-price-${extra.id}`}>
                                {formatPrice(extra.price)}
                              </span>
                              {extra.isPerPerson && (
                                <Badge variant="outline" className="text-xs">
                                  per person
                                </Badge>
                              )}
                              {extra.isPerDay && (
                                <Badge variant="outline" className="text-xs">
                                  per day
                                </Badge>
                              )}
                            </div>
                          </div>
                          {extra.imageUrl && (
                            <img
                              src={extra.imageUrl}
                              alt={extra.name}
                              className="w-20 h-20 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateExtraQuantity(
                                extra.id, 
                                Math.max(0, quantity - 1), 
                                extra.name,
                                parseFloat(extra.price)
                              )}
                              disabled={quantity === 0}
                              className="w-8 h-8 p-0"
                              data-testid={`button-decrease-${extra.id}`}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium" data-testid={`quantity-${extra.id}`}>
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateExtraQuantity(
                                extra.id, 
                                quantity + 1, 
                                extra.name,
                                parseFloat(extra.price)
                              )}
                              className="w-8 h-8 p-0"
                              data-testid={`button-increase-${extra.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          {quantity > 0 && (
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Total</div>
                              <div className="font-bold text-gray-900" data-testid={`total-${extra.id}`}>
                                {formatPrice((parseFloat(extra.price) * quantity).toString())}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedExtras.length > 0 && (
          <Card className="mt-8 bg-gray-50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Selected Extras Summary</h4>
              <div className="space-y-2 mb-4">
                {selectedExtras.map((extra) => (
                  <div key={extra.id} className="flex justify-between text-sm" data-testid={`summary-${extra.id}`}>
                    <span>{extra.name} (x{extra.quantity})</span>
                    <span>{formatPrice((extra.price * extra.quantity).toString())}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total Extras:</span>
                <span data-testid="total-extras-cost">{formatPrice(getTotalCost().toString())}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 w-full sm:w-auto"
          data-testid="button-back-extras"
        >
          Back to Dining
        </Button>
        <Button
          onClick={onContinue}
          className="bg-ocean-600 text-white hover:bg-ocean-700 font-semibold px-8 py-3 w-full sm:w-auto"
          data-testid="button-continue-extras"
        >
          Continue to Guest Details
        </Button>
      </div>
    </div>
  );
}
