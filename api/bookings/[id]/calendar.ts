import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

// Helper function to generate iCal content
function generateICalendar(booking: any, cruise: any): string {
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Phoenix Vacation Group//Cruise Booking//EN
BEGIN:VEVENT
UID:cruise-${booking.id}@phoenixvacationgroup.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(cruise.departureDate)}
DTEND:${formatDate(cruise.returnDate)}
SUMMARY:${cruise.name} - ${cruise.ship}
DESCRIPTION:Cruise booking confirmation ${booking.confirmationNumber}\\n\\nShip: ${cruise.ship}\\nCruise Line: ${cruise.cruiseLine}\\nDuration: ${cruise.duration} days\\nGuests: ${booking.guestCount}\\nCabin: ${booking.cabinType?.name || 'Standard'}
LOCATION:${cruise.departurePort}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Cruise departure tomorrow from ${cruise.departurePort}
END:VALARM
END:VEVENT
END:VCALENDAR`;
  
  return icalContent;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const cruise = await storage.getCruise(booking.cruiseId);
    if (!cruise) {
      return res.status(404).json({ message: "Cruise not found" });
    }

    const icalContent = generateICalendar(booking, cruise);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="cruise-${booking.confirmationNumber}.ics"`);
    res.status(200).send(icalContent);
  } catch (error: any) {
    res.status(500).json({ message: "Error generating calendar: " + error.message });
  }
}