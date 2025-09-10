// Language types and translations
export type Language = 'EN' | 'TH';

export interface Translations {
  // Navigation
  cruises: string;
  destinations: string;
  deals: string;
  myReservations: string;
  signIn: string;
  logOut: string;
  savedCruises: string;

  // Search
  searchResults: string;
  modifySearch: string;
  showingResults: string;
  sortBy: string;
  lowestPrice: string;
  highestPrice: string;
  rating: string;
  duration: string;

  // Home page
  heroTitle: string;
  heroSubtitle: string;
  searchForCruises: string;
  findYourPerfectCruise: string;
  featuredCruises: string;
  featuredCruisesSubtitle: string;
  specialDeals: string;
  specialDealsSubtitle: string;
  popularDestinations: string;
  popularDestinationsSubtitle: string;
  whyChooseUs: string;
  whyChooseUsSubtitle: string;

  // Error messages
  unableToLoadCruises: string;
  technicalDifficulties: string;
  noFeaturedCruises: string;
  checkBackSoon: string;
  cruiseNotFound: string;
  cruiseNotAvailable: string;
  backToSearch: string;

  // Common
  guests: string;
  adults: string;
  children: string;
  seniors: string;
  departure: string;
  from: string;
  perPerson: string;
  bookNow: string;
  viewDetails: string;
  viewItinerary: string;
  continue: string;
  back: string;
  loading: string;
  save: string;
  cancel: string;
  close: string;
  days: string;
  nights: string;
  ship: string;
  cruiseLine: string;

  // Booking
  bookingSteps: {
    selectCabin: string;
    selectDining: string;
    addExtras: string;
    guestDetails: string;
  };

  // Cabin types
  cabinTypes: {
    interior: string;
    oceanView: string;
    balcony: string;
    suite: string;
  };

  // Dining
  diningTimes: {
    early: string;
    late: string;
    anytime: string;
  };

  // Guest details
  guestInformation: string;
  primaryGuest: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  specialRequests: string;

  // Payment
  paymentInformation: string;
  paymentCurrency: string;
  pricingSummary: string;
  cruiseFare: string;
  taxes: string;
  gratuities: string;
  total: string;
  subtotal: string;
  discount: string;

  // Features (Why Choose Us)
  bestPrices: string;
  bestPricesDesc: string;
  expertSupport: string;
  expertSupportDesc: string;
  luxuryExperience: string;
  luxuryExperienceDesc: string;
  easyBooking: string;
  easyBookingDesc: string;

  // Footer
  companyName: string;
  companyTagline: string;
  contactUs: string;
  aboutUs: string;
  termsOfService: string;
  privacyPolicy: string;

  // Promotions/Deals
  dealApplied: string;
  removeDeal: string;
  couponCode: string;
  enterCouponCode: string;
  applyCoupon: string;
  invalidCoupon: string;

  // Favorites
  favorites: string;
  noFavorites: string;
  addToFavorites: string;
  removeFromFavorites: string;

  // Reservations
  reservations: string;
  noReservations: string;
  bookingConfirmation: string;
  confirmationNumber: string;

  // Search filters
  filters: string;
  destination: string;
  departureDate: string;
  priceRange: string;
  clearFilters: string;
  applyFilters: string;

  // Authentication
  welcomeBack: string;
  signInDescription: string;
  emailAddress: string;
  password: string;
  enterYourEmail: string;
  enterYourPassword: string;
  signingIn: string;
  dontHaveAccount: string;
  signUp: string;
  emailRequired: string;
  validEmailRequired: string;
  passwordRequired: string;
  loginFailed: string;
  loginRequired: string;
  loginRequiredMessage: string;

  // Registration
  createAccount: string;
  createAccountDescription: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
  enterFirstName: string;
  enterLastName: string;
  confirmYourPassword: string;
  creatingAccount: string;
  alreadyHaveAccount: string;
  firstNameRequired: string;
  lastNameRequired: string;
  passwordsNotMatch: string;
  registrationFailed: string;
}

export const translations: Record<Language, Translations> = {
  EN: {
    // Navigation
    cruises: 'Cruises',
    destinations: 'Destinations',
    deals: 'Deals',
    myReservations: 'My Reservations',
    signIn: 'Sign In',
    logOut: 'Log out',
    savedCruises: 'Saved Cruises',

    // Search
    searchResults: 'Search Results',
    modifySearch: 'Modify Search',
    showingResults: 'Showing',
    sortBy: 'Sort by:',
    lowestPrice: 'Lowest Price',
    highestPrice: 'Highest Price',
    rating: 'Rating',
    duration: 'Duration',

    // Home page
    heroTitle: 'Discover Your Next Adventure',
    heroSubtitle: "Explore the world's most beautiful destinations aboard our luxury cruise ships",
    searchForCruises: 'Search for Cruises',
    findYourPerfectCruise: 'Find Your Perfect Cruise',
    featuredCruises: 'Featured Cruises',
    featuredCruisesSubtitle: 'Handpicked luxury cruise experiences at unbeatable prices',
    specialDeals: 'Special Deals & Offers',
    specialDealsSubtitle: 'Limited time offers and exclusive deals for our cruise experiences',
    popularDestinations: 'Popular Destinations',
    popularDestinationsSubtitle: "Explore the world's most sought-after cruise destinations",
    whyChooseUs: 'Why Choose Us',
    whyChooseUsSubtitle: 'Experience the difference with Phoenix Vacation Group',

    // Error messages
    unableToLoadCruises: 'Unable to Load Featured Cruises',
    technicalDifficulties:
      "We're experiencing technical difficulties. Please try again later or use the search above to find cruises.",
    noFeaturedCruises: 'No Featured Cruises Available',
    checkBackSoon:
      'Check back soon for our latest cruise offerings, or use the search above to explore available options.',
    cruiseNotFound: 'Cruise Not Found',
    cruiseNotAvailable:
      "The cruise you're looking for could not be found or is no longer available.",
    backToSearch: 'Back to Search',

    // Common
    guests: 'Guests',
    adults: 'Adults',
    children: 'Children',
    seniors: 'Seniors',
    departure: 'Departure',
    from: 'from',
    perPerson: 'per person',
    bookNow: 'Book Now',
    viewDetails: 'View Details',
    viewItinerary: 'View Itinerary',
    continue: 'Continue',
    back: 'Back',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    days: 'Days',
    nights: 'Nights',
    ship: 'Ship',
    cruiseLine: 'Cruise Line',

    // Booking
    bookingSteps: {
      selectCabin: 'Select Cabin',
      selectDining: 'Select Dining',
      addExtras: 'Add Extras',
      guestDetails: 'Guest Details',
    },

    // Cabin types
    cabinTypes: {
      interior: 'Interior',
      oceanView: 'Ocean View',
      balcony: 'Balcony',
      suite: 'Suite',
    },

    // Dining
    diningTimes: {
      early: 'Early Seating (6:00 PM)',
      late: 'Late Seating (8:30 PM)',
      anytime: 'Anytime Dining',
    },

    // Guest details
    guestInformation: 'Guest Information',
    primaryGuest: 'Primary Guest',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    dateOfBirth: 'Date of Birth',
    passportNumber: 'Passport Number',
    passportCountry: 'Passport Country',
    passportExpiry: 'Passport Expiry',
    specialRequests: 'Special Requests',

    // Payment
    paymentInformation: 'Payment Information',
    paymentCurrency: 'Payment Currency',
    pricingSummary: 'Pricing Summary',
    cruiseFare: 'Cruise Fare',
    taxes: 'Taxes & Fees',
    gratuities: 'Gratuities',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',

    // Features (Why Choose Us)
    bestPrices: 'Best Prices Guaranteed',
    bestPricesDesc:
      'We offer competitive pricing and price matching to ensure you get the best deal on your cruise vacation.',
    expertSupport: '24/7 Expert Support',
    expertSupportDesc:
      'Our cruise specialists are available around the clock to help you plan and book your perfect getaway.',
    luxuryExperience: 'Luxury Experience',
    luxuryExperienceDesc:
      'Enjoy world-class amenities, fine dining, and exceptional service on all our cruise ships.',
    easyBooking: 'Easy Online Booking',
    easyBookingDesc:
      'Book your cruise in just a few clicks with our user-friendly online booking system.',

    // Footer
    companyName: 'Phoenix Vacation Group',
    companyTagline: 'Luxury Cruise Experiences',
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',

    // Promotions/Deals
    dealApplied: 'Deal Applied',
    removeDeal: 'Remove Deal',
    couponCode: 'Coupon Code',
    enterCouponCode: 'Enter Coupon Code (Optional)',
    applyCoupon: 'Apply Coupon',
    invalidCoupon: 'Invalid Coupon',

    // Favorites
    favorites: 'Favorites',
    noFavorites: 'No Favorite Cruises',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',

    // Reservations
    reservations: 'Reservations',
    noReservations: 'No Reservations Found',
    bookingConfirmation: 'Booking Confirmation',
    confirmationNumber: 'Confirmation Number',

    // Search filters
    filters: 'Filters',
    destination: 'Destination',
    departureDate: 'Departure Date',
    priceRange: 'Price Range',
    clearFilters: 'Clear Filters',
    applyFilters: 'Apply Filters',

    // Authentication
    welcomeBack: 'Welcome Back',
    signInDescription: 'Sign in to your account to manage bookings and get exclusive deals',
    emailAddress: 'Email Address',
    password: 'Password',
    enterYourEmail: 'Enter your email',
    enterYourPassword: 'Enter your password',
    signingIn: 'Signing In...',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign up',
    emailRequired: 'Email is required',
    validEmailRequired: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    loginFailed: 'Login failed. Please try again.',
    loginRequired: 'Login Required',
    loginRequiredMessage: 'Please log in to save favorites.',

    // Registration
    createAccount: 'Create Account',
    createAccountDescription: 'Join thousands of travelers and start your cruise adventure',
    confirmPassword: 'Confirm Password',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',
    confirmYourPassword: 'Confirm your password',
    creatingAccount: 'Creating Account...',
    alreadyHaveAccount: 'Already have an account?',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    passwordsNotMatch: 'Passwords do not match',
    registrationFailed: 'Registration failed. Please try again.',
  },
  TH: {
    // Navigation
    cruises: 'ครูซ',
    destinations: 'จุดหมาย',
    deals: 'โปรโมชั่น',
    myReservations: 'การจองของฉัน',
    signIn: 'เข้าสู่ระบบ',
    logOut: 'ออกจากระบบ',
    savedCruises: 'ครูซที่บันทึก',

    // Search
    searchResults: 'ผลการค้นหา',
    modifySearch: 'แก้ไขการค้นหา',
    showingResults: 'แสดง',
    sortBy: 'เรียงตาม:',
    lowestPrice: 'ราคาต่ำสุด',
    highestPrice: 'ราคาสูงสุด',
    rating: 'คะแนน',
    duration: 'ระยะเวลา',

    // Home page
    heroTitle: 'ค้นหาการผจญภัยครั้งต่อไป',
    heroSubtitle: 'สำรวจจุดหมายปลายทางที่สวยงามที่สุดในโลกบนเรือครูซหรูหรา',
    searchForCruises: 'ค้นหาครูซ',
    findYourPerfectCruise: 'หาครูซที่สมบูรณ์แบบ',
    featuredCruises: 'ครูซแนะนำ',
    featuredCruisesSubtitle: 'ประสบการณ์ครูซหรูหราที่คัดสรรมาแล้ว ในราคาที่คุ้มค่า',
    specialDeals: 'โปรโมชั่นพิเศษ',
    specialDealsSubtitle: 'ข้อเสนอแบบจำกัดเวลาและดีลพิเศษสำหรับประสบการณ์ครูซของเรา',
    popularDestinations: 'จุดหมายยอดนิยม',
    popularDestinationsSubtitle: 'สำรวจจุดหมายปลายทางครูซที่ได้รับความนิยมมากที่สุดในโลก',
    whyChooseUs: 'เหตุผลที่เลือกเรา',
    whyChooseUsSubtitle: 'สัมผัสความแตกต่างกับ Phoenix Vacation Group',

    // Error messages
    unableToLoadCruises: 'ไม่สามารถโหลดครูซแนะนำได้',
    technicalDifficulties:
      'เราประสบปัญหาทางเทคนิค กรุณาลองใหม่อีกครั้งหรือใช้การค้นหาข้างต้นเพื่อหาครูซ',
    noFeaturedCruises: 'ไม่มีครูซแนะนำในขณะนี้',
    checkBackSoon:
      'กรุณาเข้าชมอีกครั้งเร็วๆ นี้สำหรับข้อเสนอครูซล่าสุด หรือใช้การค้นหาข้างต้นเพื่อสำรวจตัวเลือก',
    cruiseNotFound: 'ไม่พบครูซ',
    cruiseNotAvailable: 'ครูซที่คุณกำลังมองหาไม่พบหรือไม่มีให้บริการแล้ว',
    backToSearch: 'กลับไปค้นหา',

    // Common
    guests: 'ผู้โดยสาร',
    adults: 'ผู้ใหญ่',
    children: 'เด็ก',
    seniors: 'ผู้สูงอายุ',
    departure: 'ออกเดินทาง',
    from: 'จาก',
    perPerson: 'ต่อคน',
    bookNow: 'จองเลย',
    viewDetails: 'ดูรายละเอียด',
    viewItinerary: 'ดูกำหนดการเดินทาง',
    continue: 'ดำเนินการต่อ',
    back: 'กลับ',
    loading: 'กำลังโหลด...',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    days: 'วัน',
    nights: 'คืน',
    ship: 'เรือ',
    cruiseLine: 'สายเรือครูซ',

    // Booking
    bookingSteps: {
      selectCabin: 'เลือกห้องพัก',
      selectDining: 'เลือกการรับประทานอาหาร',
      addExtras: 'เพิ่มบริการพิเศษ',
      guestDetails: 'ข้อมูลผู้โดยสาร',
    },

    // Cabin types
    cabinTypes: {
      interior: 'ห้องภายใน',
      oceanView: 'ห้องวิวทะเล',
      balcony: 'ห้องระเบียง',
      suite: 'ห้องสวีท',
    },

    // Dining
    diningTimes: {
      early: 'รอบแรก (18:00 น.)',
      late: 'รอบหลัง (20:30 น.)',
      anytime: 'รับประทานได้ตลอดเวลา',
    },

    // Guest details
    guestInformation: 'ข้อมูลผู้โดยสาร',
    primaryGuest: 'ผู้โดยสารหลัก',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    dateOfBirth: 'วันเกิด',
    passportNumber: 'หมายเลขหนังสือเดินทาง',
    passportCountry: 'ประเทศที่ออกหนังสือเดินทาง',
    passportExpiry: 'วันหมดอายุหนังสือเดินทาง',
    specialRequests: 'คำขอพิเศษ',

    // Payment
    paymentInformation: 'ข้อมูลการชำระเงิน',
    paymentCurrency: 'สกุลเงินในการชำระ',
    pricingSummary: 'สรุปราคา',
    cruiseFare: 'ค่าครูซ',
    taxes: 'ภาษีและค่าธรรมเนียม',
    gratuities: 'ค่าทิป',
    total: 'รวมทั้งสิ้น',
    subtotal: 'ยอดรวม',
    discount: 'ส่วนลด',

    // Features (Why Choose Us)
    bestPrices: 'ราคาดีที่สุดรับประกัน',
    bestPricesDesc:
      'เรามีราคาแข่งขันและจับคู่ราคาเพื่อให้แน่ใจว่าคุณได้ดีลที่ดีที่สุดสำหรับวันหยุดครูซ',
    expertSupport: 'ผู้เชี่ยวชาญดูแล 24/7',
    expertSupportDesc:
      'ผู้เชี่ยวชาญครูซของเราพร้อมให้บริการตลอด 24 ชั่วโมงเพื่อช่วยคุณวางแผนและจองการท่องเที่ยวที่สมบูรณ์แบบ',
    luxuryExperience: 'ประสบการณ์หรูหรา',
    luxuryExperienceDesc:
      'เพลิดเพลินกับสิ่งอำนวยความสะดวกระดับโลก อาหารเลิศรส และบริการยอดเยี่ยมบนเรือครูซทุกลำ',
    easyBooking: 'จองออนไลน์ง่ายดาย',
    easyBookingDesc: 'จองครูซของคุณได้ในไม่กี่คลิกด้วยระบบจองออนไลน์ที่ใช้งานง่าย',

    // Footer
    companyName: 'Phoenix Vacation Group',
    companyTagline: 'ประสบการณ์ครูซหรูหรา',
    contactUs: 'ติดต่อเรา',
    aboutUs: 'เกี่ยวกับเรา',
    termsOfService: 'เงื่อนไขการบริการ',
    privacyPolicy: 'นโยบายความเป็นส่วนตัว',

    // Promotions/Deals
    dealApplied: 'ใช้ดีลแล้ว',
    removeDeal: 'ลบดีล',
    couponCode: 'รหัสคูปอง',
    enterCouponCode: 'ใส่รหัสคูปอง (ไม่บังคับ)',
    applyCoupon: 'ใช้คูปอง',
    invalidCoupon: 'คูปองไม่ถูกต้อง',

    // Favorites
    favorites: 'รายการโปรด',
    noFavorites: 'ไม่มีครูซในรายการโปรด',
    addToFavorites: 'เพิ่มในรายการโปรด',
    removeFromFavorites: 'ลบออกจากรายการโปรด',

    // Reservations
    reservations: 'การจอง',
    noReservations: 'ไม่พบการจอง',
    bookingConfirmation: 'ยืนยันการจอง',
    confirmationNumber: 'หมายเลขยืนยัน',

    // Search filters
    filters: 'ตัวกรอง',
    destination: 'จุดหมาย',
    departureDate: 'วันออกเดินทาง',
    priceRange: 'ช่วงราคา',
    clearFilters: 'ล้างตัวกรอง',
    applyFilters: 'ใช้ตัวกรอง',

    // Authentication
    welcomeBack: 'ยินดีต้อนรับกลับ',
    signInDescription: 'เข้าสู่ระบบเพื่อจัดการการจองและรับข้อเสนอพิเศษ',
    emailAddress: 'ที่อยู่อีเมล',
    password: 'รหัสผ่าน',
    enterYourEmail: 'ใส่อีเมลของคุณ',
    enterYourPassword: 'ใส่รหัสผ่านของคุณ',
    signingIn: 'กำลังเข้าสู่ระบบ...',
    dontHaveAccount: 'ยังไม่มีบัญชี?',
    signUp: 'สมัครสมาชิก',
    emailRequired: 'จำเป็นต้องระบุอีเมล',
    validEmailRequired: 'กรุณาใส่ที่อยู่อีเมลที่ถูกต้อง',
    passwordRequired: 'จำเป็นต้องระบุรหัสผ่าน',
    loginFailed: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่',
    loginRequired: 'จำเป็นต้องเข้าสู่ระบบ',
    loginRequiredMessage: 'กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด',

    // Registration
    createAccount: 'สร้างบัญชี',
    createAccountDescription: 'เข้าร่วมกับนักเดินทางหลายพันคนและเริ่มต้นการผจญภัยครูซ',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    enterFirstName: 'ใส่ชื่อจริงของคุณ',
    enterLastName: 'ใส่นามสกุลของคุณ',
    confirmYourPassword: 'ยืนยันรหัสผ่านของคุณ',
    creatingAccount: 'กำลังสร้างบัญชี...',
    alreadyHaveAccount: 'มีบัญชีอยู่แล้ว?',
    firstNameRequired: 'จำเป็นต้องระบุชื่อจริง',
    lastNameRequired: 'จำเป็นต้องระบุนามสกุล',
    passwordsNotMatch: 'รหัสผ่านไม่ตรงกัน',
    registrationFailed: 'การสมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่',
  },
};

export function useTranslation(language: Language) {
  return (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations['EN'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };
}
