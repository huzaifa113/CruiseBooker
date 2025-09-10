// Centralized Pricing Engine for consistent calculations across the app

export interface PricingBreakdown {
  baseCruiseFare: number;
  cabinUpgrade: number;
  extrasTotal: number;
  subtotal: number;
  taxAmount: number;
  gratuityAmount: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
  appliedPromotions: AppliedPromotion[];
}

export interface AppliedPromotion {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export interface DiscountConditions {
  minGuests?: number;
  maxGuests?: number;
  minBookingAmount?: number;
  maxBookingAmount?: number;
  earlyBookingDays?: number; // Days before departure for early booking
  lastMinuteDays?: number; // Maximum days before departure for last-minute deals
  groupSize?: number; // Minimum group size
  cruiseLines?: string[];
  destinations?: string[];
  cabinTypes?: string[];
  ageRequirements?: {
    seniors?: number; // Minimum senior count
    children?: number; // Maximum child count
  };
}

export interface PromotionRule {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number; // Cap for percentage discounts
  conditions: DiscountConditions;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  isCombinable: boolean;
  priority: number; // Higher priority applied first
}

// Currency conversion rates (in a real app, fetch from API)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  SGD: 1.35,
  THB: 32.5 // Realistic THB rate
};

export class PricingEngine {
  /**
   * Calculate complete pricing breakdown with discounts
   */
  static calculatePricing(
    basePrice: number,
    cabinMultiplier: number,
    guestCount: number,
    extras: Array<{ price: number; quantity: number }>,
    promotions: PromotionRule[],
    bookingData: any,
    targetCurrency: string = 'USD'
  ): PricingBreakdown {
    
    // Step 1: Calculate base amounts in USD
    const baseCruiseFare = basePrice * guestCount;
    const cabinUpgrade = basePrice * (cabinMultiplier - 1) * guestCount;
    const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0);
    
    const subtotal = baseCruiseFare + cabinUpgrade + extrasTotal;
    
    // Step 2: Calculate taxes and gratuities (standard rates)
    const taxRate = 0.095; // 9.5% taxes and fees
    const gratuityRate = 0.12; // 12% gratuities
    const taxAmount = subtotal * taxRate;
    const gratuityAmount = subtotal * gratuityRate;
    
    const totalBeforeDiscounts = subtotal + taxAmount + gratuityAmount;
    
    // Step 3: Apply eligible promotions (check eligibility against subtotal before taxes/gratuity)
    const eligiblePromotions = this.getEligiblePromotions(promotions, bookingData, subtotal);
    const { discountAmount, appliedPromotions } = this.calculateDiscounts(eligiblePromotions, totalBeforeDiscounts);
    
    const finalTotal = Math.max(0, totalBeforeDiscounts - discountAmount);
    
    // Step 4: Convert to target currency
    const conversionRate = EXCHANGE_RATES[targetCurrency as keyof typeof EXCHANGE_RATES] || 1;
    
    return {
      baseCruiseFare: this.convertCurrency(baseCruiseFare, conversionRate),
      cabinUpgrade: this.convertCurrency(cabinUpgrade, conversionRate),
      extrasTotal: this.convertCurrency(extrasTotal, conversionRate),
      subtotal: this.convertCurrency(subtotal, conversionRate),
      taxAmount: this.convertCurrency(taxAmount, conversionRate),
      gratuityAmount: this.convertCurrency(gratuityAmount, conversionRate),
      discountAmount: this.convertCurrency(discountAmount, conversionRate),
      finalTotal: this.convertCurrency(finalTotal, conversionRate),
      currency: targetCurrency,
      appliedPromotions: appliedPromotions.map(p => ({
        ...p,
        discountAmount: this.convertCurrency(p.discountAmount, conversionRate)
      }))
    };
  }

  /**
   * Check which promotions are eligible based on booking conditions
   */
  private static getEligiblePromotions(
    promotions: PromotionRule[],
    bookingData: any,
    subtotalAmount: number
  ): PromotionRule[] {
    const now = new Date();
    
    return promotions.filter(promotion => {
      // Check if promotion is active and within date range
      if (!promotion.isActive || now < promotion.validFrom || now > promotion.validTo) {
        return false;
      }
      
      const conditions = promotion.conditions;
      
      // Check guest count conditions
      if (conditions.minGuests && bookingData.guestCount < conditions.minGuests) return false;
      if (conditions.maxGuests && bookingData.guestCount > conditions.maxGuests) return false;
      
      // Check booking amount conditions (against subtotal before taxes/gratuity)
      if (conditions.minBookingAmount && subtotalAmount < conditions.minBookingAmount) return false;
      if (conditions.maxBookingAmount && subtotalAmount > conditions.maxBookingAmount) return false;
      
      // Check early booking conditions
      if (conditions.earlyBookingDays) {
        const daysUntilDeparture = Math.ceil(
          (new Date(bookingData.departureDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeparture < conditions.earlyBookingDays) return false;
      }

      // Check last-minute booking conditions (within 30 days)
      if (conditions.lastMinuteDays) {
        const daysUntilDeparture = Math.ceil(
          (new Date(bookingData.departureDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeparture > conditions.lastMinuteDays) return false;
      }
      
      // Check group size conditions
      if (conditions.groupSize && bookingData.guestCount < conditions.groupSize) return false;
      
      // Check cruise line conditions
      if (conditions.cruiseLines && !conditions.cruiseLines.includes(bookingData.cruiseLine)) return false;
      
      // Check destination conditions
      if (conditions.destinations && !conditions.destinations.includes(bookingData.destination)) return false;
      
      // Check cabin type conditions
      if (conditions.cabinTypes && !conditions.cabinTypes.includes(bookingData.cabinType)) return false;
      
      // Check age requirements
      if (conditions.ageRequirements) {
        const ageReq = conditions.ageRequirements;
        if (ageReq.seniors && bookingData.seniorCount < ageReq.seniors) return false;
        if (ageReq.children && bookingData.childCount > ageReq.children) return false;
      }
      
      return true;
    });
  }

  /**
   * Calculate total discount amount from eligible promotions
   */
  private static calculateDiscounts(
    eligiblePromotions: PromotionRule[],
    totalAmount: number
  ): { discountAmount: number; appliedPromotions: AppliedPromotion[] } {
    
    // Sort by priority (highest first)
    const sortedPromotions = [...eligiblePromotions].sort((a, b) => b.priority - a.priority);
    
    const appliedPromotions: AppliedPromotion[] = [];
    let totalDiscount = 0;
    let remainingAmount = totalAmount;
    
    // Apply combinable promotions
    for (const promotion of sortedPromotions) {
      let discountAmount = 0;
      
      if (promotion.discountType === 'percentage') {
        discountAmount = (remainingAmount * promotion.discountValue) / 100;
        
        // Apply max discount cap if specified
        if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
          discountAmount = promotion.maxDiscount;
        }
      } else {
        discountAmount = Math.min(promotion.discountValue, remainingAmount);
      }
      
      if (discountAmount > 0) {
        appliedPromotions.push({
          id: promotion.id,
          name: promotion.name,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          discountAmount
        });
        
        totalDiscount += discountAmount;
        
        // If promotion is not combinable, stop here
        if (!promotion.isCombinable) {
          break;
        }
        
        remainingAmount -= discountAmount;
      }
    }
    
    return { discountAmount: totalDiscount, appliedPromotions };
  }

  /**
   * Convert amount to target currency
   */
  private static convertCurrency(amount: number, conversionRate: number): number {
    return Math.round(amount * conversionRate * 100) / 100;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get supported currencies
   */
  static getSupportedCurrencies() {
    return Object.keys(EXCHANGE_RATES);
  }

  /**
   * Validate amount for Stripe payment limits
   */
  static validatePaymentAmount(amount: number, currency: string): { valid: boolean; error?: string } {
    const limits = {
      USD: { min: 0.50, max: 999999.99 },
      EUR: { min: 0.50, max: 999999.99 },
      SGD: { min: 0.50, max: 999999.99 },
      THB: { min: 20, max: 999999.99 }
    };
    
    const limit = limits[currency as keyof typeof limits];
    if (!limit) {
      return { valid: false, error: `Unsupported currency: ${currency}` };
    }
    
    if (amount < limit.min) {
      return { valid: false, error: `Amount too small. Minimum ${currency} ${limit.min}` };
    }
    
    if (amount > limit.max) {
      return { valid: false, error: `Amount too large. Maximum ${currency} ${limit.max}` };
    }
    
    return { valid: true };
  }
}