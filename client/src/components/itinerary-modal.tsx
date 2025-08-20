import { X, MapPin, Calendar, Printer, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Cruise } from "@shared/schema";

interface ItineraryModalProps {
  cruise: Cruise | null;
  isOpen: boolean;
  onClose: () => void;
  onBookCruise?: (cruise: Cruise) => void;
}

export default function ItineraryModal({ cruise, isOpen, onClose, onBookCruise }: ItineraryModalProps) {
  if (!cruise) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCalendar = () => {
    // TODO: Implement iCal export
    console.log('Export to calendar functionality to be implemented');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" data-testid="modal-itinerary">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900" data-testid="text-cruise-name">
                {cruise.name}
              </DialogTitle>
              <p className="text-gray-600" data-testid="text-ship-duration">
                {cruise.ship} • {cruise.duration} Days
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              data-testid="button-close-modal"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-1">
          <div className="space-y-6">
            {cruise.itinerary?.map((day, index) => (
              <div key={index} className="flex border-b border-gray-100 pb-6 last:border-b-0" data-testid={`itinerary-day-${day.day}`}>
                <div className="w-20 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-ocean-600" data-testid={`text-day-number-${day.day}`}>
                      {day.day.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600" data-testid={`text-day-date-${day.day}`}>
                      {day.date}
                    </div>
                  </div>
                </div>
                <div className="flex-1 ml-6">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900" data-testid={`text-port-name-${day.day}`}>
                      {day.port}
                    </h3>
                    {day.country && (
                      <span className="ml-3 text-sm text-gray-600" data-testid={`text-country-${day.day}`}>
                        {day.country}
                      </span>
                    )}
                    {day.port === "At Sea" && (
                      <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-800">
                        Cruising
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Arrival:</span> 
                      <span className="ml-1" data-testid={`text-arrival-${day.day}`}>
                        {day.arrival || '--'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Departure:</span> 
                      <span className="ml-1" data-testid={`text-departure-${day.day}`}>
                        {day.departure || '--'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700" data-testid={`text-description-${day.day}`}>
                    {day.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 -mx-6 -mb-6 p-6 flex justify-between items-center border-t">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center text-ocean-600 hover:text-ocean-700 border-ocean-200"
              data-testid="button-print-itinerary"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Itinerary
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCalendar}
              className="flex items-center text-ocean-600 hover:text-ocean-700 border-ocean-200"
              data-testid="button-export-calendar"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Export to Calendar
            </Button>
          </div>
          <Button
            onClick={() => onBookCruise?.(cruise)}
            className="bg-coral-500 text-white hover:bg-coral-600 font-semibold px-6 py-3"
            data-testid="button-book-cruise"
          >
            Book This Cruise
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
