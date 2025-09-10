// Simple discount validation system
export interface DealConditions {
  minBookingAmount?: number;
  minGuests?: number;
  maxGuests?: number;
  earlyBookingDays?: number; // Must book X days in advance
  lastMinuteDays?: number; // Must book within X days
  couponCode?: string;
  cruiseLines?: string[];
  destinations?: string[];
}

export interface Deal {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  conditions: DealConditions;
}

export interface BookingInfo {
  departureDate: string;
  totalAmount: number;
  guestCount: number;
  cruiseLine?: string;
  destination?: string;
  enteredCouponCode?: string;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  discountAmount?: number;
}

export class DiscountValidator {
  static validateDeal(deal: Deal, bookingInfo: BookingInfo): ValidationResult {
    const conditions = deal.conditions;

    // Check minimum booking amount
    if (conditions.minBookingAmount && bookingInfo.totalAmount < conditions.minBookingAmount) {
      return {
        isValid: false,
        reason: `Minimum booking amount of $${conditions.minBookingAmount} required. Current booking: $${bookingInfo.totalAmount.toFixed(2)}`,
      };
    }

    // Check guest count
    if (conditions.minGuests && bookingInfo.guestCount < conditions.minGuests) {
      return {
        isValid: false,
        reason: `Minimum ${conditions.minGuests} guests required. Current booking: ${bookingInfo.guestCount} guests`,
      };
    }

    if (conditions.maxGuests && bookingInfo.guestCount > conditions.maxGuests) {
      return {
        isValid: false,
        reason: `Maximum ${conditions.maxGuests} guests allowed. Current booking: ${bookingInfo.guestCount} guests`,
      };
    }

    // Check early booking requirement (must book X days in advance)
    if (conditions.earlyBookingDays) {
      const departureDate = new Date(bookingInfo.departureDate);
      const today = new Date();
      const daysUntilDeparture = Math.ceil(
        (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeparture < conditions.earlyBookingDays) {
        return {
          isValid: false,
          reason: `Early booking deal requires booking at least ${conditions.earlyBookingDays} days in advance. Current: ${daysUntilDeparture} days until departure`,
        };
      }
    }

    // Check last minute deal requirement (must book within X days)
    if (conditions.lastMinuteDays) {
      const departureDate = new Date(bookingInfo.departureDate);
      const today = new Date();
      const daysUntilDeparture = Math.ceil(
        (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeparture > conditions.lastMinuteDays) {
        return {
          isValid: false,
          reason: `Last minute deal requires booking within ${conditions.lastMinuteDays} days of departure. Current: ${daysUntilDeparture} days until departure`,
        };
      }
    }

    // Check coupon code
    if (conditions.couponCode && conditions.couponCode !== bookingInfo.enteredCouponCode) {
      return {
        isValid: false,
        reason: `Invalid or missing coupon code. Required: ${conditions.couponCode}`,
      };
    }

    // Check cruise line restriction
    if (
      conditions.cruiseLines &&
      bookingInfo.cruiseLine &&
      !conditions.cruiseLines.includes(bookingInfo.cruiseLine)
    ) {
      return {
        isValid: false,
        reason: `Deal only valid for ${conditions.cruiseLines.join(', ')} cruise lines`,
      };
    }

    // Check destination restriction
    if (
      conditions.destinations &&
      bookingInfo.destination &&
      !conditions.destinations.includes(bookingInfo.destination)
    ) {
      return {
        isValid: false,
        reason: `Deal only valid for ${conditions.destinations.join(', ')} destinations`,
      };
    }

    // All conditions passed - calculate discount
    let discountAmount = 0;
    if (deal.discountType === 'percentage') {
      discountAmount = (bookingInfo.totalAmount * deal.discountValue) / 100;
    } else {
      discountAmount = deal.discountValue;
    }

    return {
      isValid: true,
      discountAmount: Math.min(discountAmount, bookingInfo.totalAmount), // Don't exceed total amount
    };
  }

  static formatDiscountText(deal: Deal): string {
    if (deal.discountType === 'percentage') {
      return `${deal.discountValue}% OFF`;
    } else {
      return `$${deal.discountValue} OFF`;
    }
  }
}
