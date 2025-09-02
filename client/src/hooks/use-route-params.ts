import { useLocation } from "wouter";

/**
 * Custom hook to extract route parameters from URL path
 * Handles different deployment environments and URL patterns
 */
export function useRouteParams() {
  const [location] = useLocation();

  const getParam = (paramName: string): string | null => {
    
    // Handle different URL patterns that might occur in different environments
    const patterns = [
      // Standard patterns
      new RegExp(`/${paramName}/([^/?]+)`),           // /paramName/value
      new RegExp(`/${paramName}=([^&?]+)`),           // /paramName=value  
      
      // Common deployment patterns
      new RegExp(`^/booking/([^/?]+)$`),              // /booking/cruise-id
      new RegExp(`^.*/booking/([^/?]+)$`),            // any-prefix/booking/cruise-id
      new RegExp(`^/checkout/([^/?]+)$`),             // /checkout/booking-id
      new RegExp(`^.*/checkout/([^/?]+)$`),           // any-prefix/checkout/booking-id
      new RegExp(`^/confirmation/([^/?]+)$`),         // /confirmation/confirmation-number
      new RegExp(`^.*/confirmation/([^/?]+)$`),       // any-prefix/confirmation/confirmation-number
      new RegExp(`^/confirmation-success/([^/?]+)$`), // /confirmation-success/booking-id
      new RegExp(`^.*/confirmation-success/([^/?]+)$`), // any-prefix/confirmation-success/booking-id
    ];
    
    // Try each pattern
    for (const pattern of patterns) {
      const match = location.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Fallback: split by '/' and find parameter by position
    const segments = location.split('/').filter(Boolean);
    
    // Common parameter positions in our routes
    if (paramName === 'cruiseId' && segments.length >= 2 && segments[0] === 'booking') {
      return segments[1];
    }
    
    if (paramName === 'bookingId' && segments.length >= 2) {
      if (segments[0] === 'checkout' || segments[0] === 'confirmation-success') {
        return segments[1];
      }
    }
    
    if (paramName === 'confirmationNumber' && segments.length >= 2 && segments[0] === 'confirmation') {
      return segments[1];
    }
    
    return null;
  };

  return { getParam, location };
}

/**
 * Get cruise ID from current route
 */
export function useCruiseId(): string | null {
  const { getParam } = useRouteParams();
  return getParam('cruiseId');
}

/**
 * Get booking ID from current route
 */
export function useBookingId(): string | null {
  const { getParam } = useRouteParams();
  return getParam('bookingId');
}

/**
 * Get confirmation number from current route
 */
export function useConfirmationNumber(): string | null {
  const { getParam } = useRouteParams();
  return getParam('confirmationNumber');
}