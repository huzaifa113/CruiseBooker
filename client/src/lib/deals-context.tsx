import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SelectedDeal {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  selectedAt: string;
  conditions?: {
    minBookingAmount?: number;
    minGuests?: number;
    earlyBookingDays?: number;
    cruiseLines?: string[];
    destinations?: string[];
    cabinTypes?: string[];
    requiredCouponCode?: string;
    [key: string]: any; // Allow additional dynamic conditions
  };
}

interface DealsContextType {
  selectedDeal: SelectedDeal | null;
  setSelectedDeal: (deal: SelectedDeal | null) => void;
  clearSelectedDeal: () => void;
  isDealSelected: boolean;
  getDealText: () => string;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

interface DealsProviderProps {
  children: ReactNode;
}

export function DealsProvider({ children }: DealsProviderProps) {
  const [selectedDeal, setSelectedDealState] = useState<SelectedDeal | null>(null);

  // Load deal from localStorage on mount
  useEffect(() => {
    try {
      const storedDeal = localStorage.getItem('selectedPromotion');
      if (storedDeal) {
        const deal = JSON.parse(storedDeal);
        // Check if deal is still valid (not older than 24 hours)
        const selectedTime = new Date(deal.selectedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - selectedTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setSelectedDealState(deal);
        } else {
          // Deal expired, clear it
          localStorage.removeItem('selectedPromotion');
        }
      }
    } catch (error) {
      console.error('Error loading selected deal:', error);
      localStorage.removeItem('selectedPromotion');
    }
  }, []);

  const setSelectedDeal = (deal: SelectedDeal | null) => {
    setSelectedDealState(deal);
    if (deal) {
      localStorage.setItem('selectedPromotion', JSON.stringify(deal));
    } else {
      localStorage.removeItem('selectedPromotion');
    }
  };

  const clearSelectedDeal = () => {
    setSelectedDealState(null);
    localStorage.removeItem('selectedPromotion');
  };

  const isDealSelected = !!selectedDeal;

  const getDealText = () => {
    if (!selectedDeal) return '';
    
    const discountText = selectedDeal.discountType === 'percentage' 
      ? `${selectedDeal.discountValue}% OFF`
      : `$${selectedDeal.discountValue} OFF`;
    
    return `${selectedDeal.name} (${discountText})`;
  };

  return (
    <DealsContext.Provider
      value={{
        selectedDeal,
        setSelectedDeal,
        clearSelectedDeal,
        isDealSelected,
        getDealText,
      }}
    >
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  const context = useContext(DealsContext);
  if (context === undefined) {
    throw new Error('useDeals must be used within a DealsProvider');
  }
  return context;
}