// Language types and translations
export type Language = 'EN' | 'TH';

export interface Translations {
  // Navigation
  cruises: string;
  destinations: string;
  deals: string;
  myReservations: string;
  signIn: string;
  
  // Search
  searchResults: string;
  modifySearch: string;
  showingResults: string;
  sortBy: string;
  lowestPrice: string;
  highestPrice: string;
  
  // Home page
  heroTitle: string;
  heroSubtitle: string;
  searchForCruises: string;
  findYourPerfectCruise: string;
  
  // Common
  guests: string;
  adults: string;
  children: string;
  seniors: string;
  departure: string;
  duration: string;
  from: string;
  perPerson: string;
  bookNow: string;
  viewDetails: string;
  continue: string;
  back: string;
  
  // Booking
  bookingSteps: {
    selectCabin: string;
    selectDining: string;
    addExtras: string;
    guestDetails: string;
  };
}

export const translations: Record<Language, Translations> = {
  EN: {
    // Navigation
    cruises: 'Cruises',
    destinations: 'Destinations',
    deals: 'Deals',
    myReservations: 'My Reservations',
    signIn: 'Sign In',
    
    // Search
    searchResults: 'Search Results',
    modifySearch: 'Modify Search',
    showingResults: 'Showing',
    sortBy: 'Sort by:',
    lowestPrice: 'Lowest Price',
    highestPrice: 'Highest Price',
    
    // Home page
    heroTitle: 'Discover Your Next Adventure',
    heroSubtitle: 'Explore the world\'s most beautiful destinations aboard our luxury cruise ships',
    searchForCruises: 'Search for Cruises',
    findYourPerfectCruise: 'Find Your Perfect Cruise',
    
    // Common
    guests: 'Guests',
    adults: 'Adults',
    children: 'Children',
    seniors: 'Seniors',
    departure: 'Departure',
    duration: 'Duration',
    from: 'From',
    perPerson: 'per person',
    bookNow: 'Book Now',
    viewDetails: 'View Details',
    continue: 'Continue',
    back: 'Back',
    
    // Booking
    bookingSteps: {
      selectCabin: 'Select Cabin',
      selectDining: 'Select Dining',
      addExtras: 'Add Extras',
      guestDetails: 'Guest Details',
    },
  },
  TH: {
    // Navigation
    cruises: 'เรือสำราญ',
    destinations: 'จุดหมายปลายทาง',
    deals: 'โปรโมชั่น',
    myReservations: 'การจองของฉัน',
    signIn: 'เข้าสู่ระบบ',
    
    // Search
    searchResults: 'ผลการค้นหา',
    modifySearch: 'แก้ไขการค้นหา',
    showingResults: 'แสดง',
    sortBy: 'เรียงตาม:',
    lowestPrice: 'ราคาต่ำสุด',
    highestPrice: 'ราคาสูงสุด',
    
    // Home page
    heroTitle: 'ค้นหาการผจญภัยครั้งต่อไปของคุณ',
    heroSubtitle: 'สำรวจจุดหมายปลายทางที่สวยที่สุดในโลกบนเรือสำราญหรูหราของเรา',
    searchForCruises: 'ค้นหาเรือสำราญ',
    findYourPerfectCruise: 'ค้นหาเรือสำราญที่สมบูรณ์แบบของคุณ',
    
    // Common
    guests: 'ผู้โดยสาร',
    adults: 'ผู้ใหญ่',
    children: 'เด็ก',
    seniors: 'ผู้สูงอายุ',
    departure: 'ออกเดินทาง',
    duration: 'ระยะเวลา',
    from: 'จาก',
    perPerson: 'ต่อคน',
    bookNow: 'จองเลย',
    viewDetails: 'ดูรายละเอียด',
    continue: 'ดำเนินการต่อ',
    back: 'กลับ',
    
    // Booking
    bookingSteps: {
      selectCabin: 'เลือกห้องพัก',
      selectDining: 'เลือกเวลาอาหาร',
      addExtras: 'เพิ่มบริการ',
      guestDetails: 'รายละเอียดผู้โดยสาร',
    },
  },
};

// Simple translation hook
export function useTranslation(language: Language) {
  return (key: keyof Translations | string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
}