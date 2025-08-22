import { X, MapPin, Calendar, Printer, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Cruise } from "@shared/schema";

// Helper function to generate printable itinerary HTML
function generatePrintableItinerary(cruise: Cruise): string {
  const itineraryRows = cruise.itinerary?.map(day => `
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Day ${day.day}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${new Date(day.date).toLocaleDateString()}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${day.port}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${day.arrival || 'At Sea'}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${day.departure || 'At Sea'}</td>
      <td style="padding: 12px; border: 1px solid #ddd;">${day.description}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${cruise.name} - Itinerary</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
        .cruise-title { color: #0066cc; font-size: 28px; font-weight: bold; margin: 0; }
        .cruise-subtitle { color: #666; font-size: 16px; margin: 5px 0 0 0; }
        .itinerary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .itinerary-table th { background: #0066cc; color: white; padding: 12px; text-align: left; }
        .itinerary-table td { padding: 12px; border: 1px solid #ddd; }
        .itinerary-table tr:nth-child(even) { background: #f9f9f9; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="cruise-title">${cruise.name}</h1>
        <p class="cruise-subtitle">${cruise.ship} • ${cruise.cruiseLine} • ${cruise.duration} Days</p>
        <p class="cruise-subtitle">Departure: ${new Date(cruise.departureDate).toLocaleDateString()} from ${cruise.departurePort}</p>
      </div>
      
      <h2>Daily Itinerary</h2>
      <table class="itinerary-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            <th>Port</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${itineraryRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

// Helper function to generate iCal content for cruise
function generateCruiseICalendar(cruise: Cruise): string {
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Phoenix Vacation Group//Cruise Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  
  // Add main cruise event
  icalContent.push(
    'BEGIN:VEVENT',
    `UID:cruise-${cruise.id}-main@phoenixvacationgroup.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(cruise.departureDate)}`,
    `DTEND:${formatDate(cruise.returnDate)}`,
    `SUMMARY:${cruise.name} - ${cruise.cruiseLine}`,
    `DESCRIPTION:${cruise.duration} day cruise on ${cruise.ship}\\nDeparting from ${cruise.departurePort}`,
    `LOCATION:${cruise.departurePort}`,
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );
  
  // Add port calls if itinerary exists
  if (cruise.itinerary) {
    cruise.itinerary.forEach((day: any) => {
      if (day.port !== 'At Sea' && day.arrival) {
        const arrivalTime = day.arrival ? `${day.arrival}:00` : '09:00:00';
        const departureTime = day.departure ? `${day.departure}:00` : '17:00:00';
        
        const eventStart = new Date(`${day.date}T${arrivalTime}`);
        const eventEnd = new Date(`${day.date}T${departureTime}`);
        
        icalContent.push(
          'BEGIN:VEVENT',
          `UID:cruise-${cruise.id}-port-${day.day}@phoenixvacationgroup.com`,
          `DTSTAMP:${formatDate(new Date())}`,
          `DTSTART:${formatDate(eventStart)}`,
          `DTEND:${formatDate(eventEnd)}`,
          `SUMMARY:Port Call: ${day.port}`,
          `DESCRIPTION:${day.description}\\nArrival: ${day.arrival || 'TBD'}\\nDeparture: ${day.departure || 'TBD'}`,
          `LOCATION:${day.port}${day.country ? ', ' + day.country : ''}`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        );
      }
    });
  }
  
  icalContent.push('END:VCALENDAR');
  return icalContent.join('\r\n');
}

interface ItineraryModalProps {
  cruise: Cruise | null;
  isOpen: boolean;
  onClose: () => void;
  onBookCruise?: (cruise: Cruise) => void;
}

export default function ItineraryModal({ cruise, isOpen, onClose, onBookCruise }: ItineraryModalProps) {
  if (!cruise) return null;

  const handlePrint = () => {
    // Create a printable version of the itinerary
    const printContent = generatePrintableItinerary(cruise);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  const handleExportCalendar = async () => {
    if (!cruise) return;
    
    try {
      // Generate iCal content directly from cruise data
      const icalContent = generateCruiseICalendar(cruise);
      
      // Create and download the .ics file
      const blob = new Blob([icalContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cruise-itinerary-${cruise.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log("Calendar exported successfully");
    } catch (error) {
      console.error('Error exporting calendar:', error);
    }
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
