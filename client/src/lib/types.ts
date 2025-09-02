export interface SearchFormData {
  destination: string;
  departureDate: string;
  returnDate: string;
  guestCount: string;
  departurePort?: string;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  duration: number[];
  cruiseLines: string[];
  cabinTypes: string[];
  sortBy: 'price' | 'departure' | 'duration' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface BookingFormData {
  cruiseId: string;
  cabinTypeId: string;
  guestCount: number;
  adultCount: number;
  childCount: number;
  seniorCount: number;
  diningTime?: string;
  specialRequests?: string;
  primaryGuestName: string;
  primaryGuestEmail: string;
  primaryGuestPhone?: string;
  departureDate?: string; // User-entered departure date for promotion validation
  couponCode?: string; // For promotional discounts
  guests: GuestInfo[];
  extras: BookingExtra[];
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  passportCountry?: string;
  passportExpiry?: string;
  specialNeeds?: string;
  isChild: boolean;
  isSenior: boolean;
}

export interface BookingExtra {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CruiseWithCabins {
  cruise: any;
  cabinTypes: any[];
}

export interface BookingDetails {
  booking: any;
  cruise: any;
  cabinType: any;
}
