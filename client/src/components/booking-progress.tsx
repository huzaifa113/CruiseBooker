import { Check } from "lucide-react";

interface BookingProgressProps {
  currentStep: number;
  steps: string[];
}

export default function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  return (
    <div className="mb-12" data-testid="booking-progress">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={step} className="flex items-center">
                <div className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isActive 
                        ? 'bg-ocean-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}
                    data-testid={`step-${stepNumber}`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  <span 
                    className={`ml-2 text-sm ${
                      isActive ? 'font-medium text-ocean-600' : 'text-gray-600'
                    }`}
                    data-testid={`step-label-${stepNumber}`}
                  >
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-12 h-px mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
