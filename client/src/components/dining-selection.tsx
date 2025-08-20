import { useState } from "react";
import { Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface DiningSelectionProps {
  selectedDiningTime: string | null;
  onDiningTimeSelect: (time: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function DiningSelection({
  selectedDiningTime,
  onDiningTimeSelect,
  onContinue,
  onBack
}: DiningSelectionProps) {
  const diningOptions = [
    {
      id: "early",
      name: "Early Seating",
      time: "5:30 PM - 7:30 PM",
      description: "Traditional dining with fixed schedule",
      capacity: "Available",
      popular: false
    },
    {
      id: "late",
      name: "Late Seating", 
      time: "8:00 PM - 10:00 PM",
      description: "Traditional dining with fixed schedule",
      capacity: "Limited",
      popular: false
    },
    {
      id: "mytime",
      name: "My Time Dining",
      time: "5:30 PM - 9:30 PM",
      description: "Flexible dining - arrive when you want",
      capacity: "Available",
      popular: true
    }
  ];

  return (
    <div className="space-y-8" data-testid="dining-selection">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Dining Time</h2>
        <p className="text-gray-600 mb-8">
          Choose your preferred dining schedule for the main dining room. You can always make changes later.
        </p>
        
        <RadioGroup value={selectedDiningTime || ""} onValueChange={onDiningTimeSelect}>
          <div className="space-y-4">
            {diningOptions.map((option) => (
              <Label
                key={option.id}
                htmlFor={option.id}
                className="block cursor-pointer"
              >
                <Card 
                  className={`transition-colors ${
                    selectedDiningTime === option.id 
                      ? 'border-ocean-300 bg-ocean-50' 
                      : 'border-gray-200 hover:border-ocean-300'
                  }`}
                  data-testid={`dining-option-${option.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem 
                          value={option.id} 
                          id={option.id} 
                          className="text-ocean-600"
                          data-testid={`radio-dining-${option.id}`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900" data-testid={`dining-name-${option.id}`}>
                              {option.name}
                            </h3>
                            {option.popular && (
                              <Badge variant="secondary" className="bg-coral-500 text-white">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 mr-2" />
                            <span data-testid={`dining-time-${option.id}`}>{option.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1" data-testid={`dining-description-${option.id}`}>
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center text-sm ${
                          option.capacity === "Available" ? "text-green-600" : "text-orange-600"
                        }`}>
                          <Users className="w-4 h-4 mr-1" />
                          <span data-testid={`dining-capacity-${option.id}`}>{option.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
          data-testid="button-back-dining"
        >
          Back to Cabins
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedDiningTime}
          className="bg-ocean-600 text-white hover:bg-ocean-700 font-semibold px-8 py-3"
          data-testid="button-continue-dining"
        >
          Continue to Extras
        </Button>
      </div>
    </div>
  );
}
