import { db } from "./db";
import { 
  cruises, 
  cabinTypes, 
  extras, 
  sessions, 
  users, 
  bookings, 
  promotions, 
  calendarEvents,
  payments,
  cabinHolds,
  favorites
} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function enhancedSeedDatabase() {
  console.log("Starting enhanced database seeding...");

  try {
    // Check each data type separately and seed what's missing
    console.log("Checking which data needs seeding...");
    
    // Check if cruise data already exists
    const existingCruises = await db.select().from(cruises);
    const existingPromotions = await db.select().from(promotions);
    const existingExtras = await db.select().from(extras);
    
    console.log(`Found: ${existingCruises.length} cruises, ${existingPromotions.length} promotions, ${existingExtras.length} extras`);
    
    // If all data exists, skip seeding
    if (existingCruises.length > 0 && existingPromotions.length > 0 && existingExtras.length > 0) {
      console.log("All data already exists, skipping seed");
      return;
    }
    
    console.log("Seeding cruise data only (preserving user data)...");
    // Only clear cruise-related master data, keep user data intact
    await db.delete(promotions);
    await db.delete(extras);
    await db.delete(cabinTypes);
    await db.delete(cruises);

    // Do NOT create test users - preserve real user data


    // Enhanced cruise data with comprehensive details
    const enhancedCruises = [
      {
        id: "cruise-1",
        name: "Caribbean Paradise",
        description: "Escape to the stunning turquoise waters of the Caribbean aboard our luxury vessel. Experience pristine beaches, vibrant cultures, and unforgettable adventures across multiple tropical islands.",
        destination: "Caribbean",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Phoenix Star",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Miami, Florida",
        departureDate: new Date("2025-03-15"),
        returnDate: new Date("2025-03-22"),
        duration: 7,
        basePrice: 1299.00,
        currency: "USD",
        maxGuests: 2800,
        availableCabins: 1400,
        destinations: ["St. Thomas", "St. Maarten", "Barbados", "Cozumel"],
        rating: 4.8,
        reviewCount: 2847,
        highlights: ["Private beach access", "Water sports included", "Cultural excursions", "Gourmet dining"],
        itinerary: [
          { day: 1, date: "2025-03-15", port: "Miami, Florida", country: "USA", arrival: null, departure: "17:00", description: "Embark and set sail from the vibrant port of Miami" },
          { day: 2, date: "2025-03-16", port: "At Sea", country: null, arrival: null, departure: null, description: "Enjoy full day at sea with ship amenities" },
          { day: 3, date: "2025-03-17", port: "St. Thomas", country: "USVI", arrival: "08:00", departure: "18:00", description: "Explore duty-free shopping and pristine beaches" },
          { day: 4, date: "2025-03-18", port: "St. Maarten", country: "Sint Maarten", arrival: "07:00", departure: "17:00", description: "Experience Dutch and French Caribbean culture" },
          { day: 5, date: "2025-03-19", port: "Barbados", country: "Barbados", arrival: "08:00", departure: "18:00", description: "Discover rum distilleries and coral reefs" },
          { day: 6, date: "2025-03-20", port: "Cozumel", country: "Mexico", arrival: "09:00", departure: "19:00", description: "Snorkel in crystal-clear waters and explore Mayan ruins" },
          { day: 7, date: "2025-03-21", port: "At Sea", country: null, arrival: null, departure: null, description: "Final day aboard with farewell celebrations" },
          { day: 8, date: "2025-03-22", port: "Miami, Florida", country: "USA", arrival: "07:00", departure: null, description: "Disembark and farewell" }
        ]
      },
      {
        id: "cruise-2",
        name: "Mediterranean Explorer",
        description: "Journey through ancient civilizations and stunning coastlines of the Mediterranean. From the romantic canals of Venice to the sun-drenched Greek islands, discover Europe's most enchanting destinations.",
        destination: "Mediterranean",
        imageUrl: "https://images.unsplash.com/photo-1530841344095-b2893194ecfb?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Azure Dream",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Barcelona, Spain",
        departureDate: new Date("2025-04-20"),
        returnDate: new Date("2025-05-01"),
        duration: 11,
        basePrice: 2199.00,
        currency: "EUR",
        maxGuests: 3200,
        availableCabins: 1600,
        destinations: ["Nice", "Rome", "Venice", "Dubrovnik", "Santorini", "Mykonos"],
        rating: 4.9,
        reviewCount: 1923,
        highlights: ["UNESCO World Heritage sites", "Exclusive shore excursions", "Mediterranean cuisine", "Historical tours"],
        itinerary: [
          { day: 1, date: "2025-04-20", port: "Barcelona, Spain", country: "Spain", arrival: null, departure: "18:00", description: "Board in the artistic capital of Catalonia" },
          { day: 2, date: "2025-04-21", port: "Nice, France", country: "France", arrival: "08:00", departure: "18:00", description: "Explore the French Riviera and Monaco" },
          { day: 3, date: "2025-04-22", port: "Rome (Civitavecchia), Italy", country: "Italy", arrival: "07:00", departure: "19:00", description: "Visit the Eternal City and Vatican" },
          { day: 4, date: "2025-04-23", port: "Venice, Italy", country: "Italy", arrival: "08:00", departure: "18:00", description: "Romantic gondola rides and St. Mark's Square" },
          { day: 5, date: "2025-04-24", port: "Dubrovnik, Croatia", country: "Croatia", arrival: "09:00", departure: "17:00", description: "Walk the ancient city walls and old town" },
          { day: 6, date: "2025-04-25", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing through the Adriatic Sea" },
          { day: 7, date: "2025-04-26", port: "Santorini, Greece", country: "Greece", arrival: "07:00", departure: "19:00", description: "Witness stunning sunsets and white-washed villages" },
          { day: 8, date: "2025-04-27", port: "Mykonos, Greece", country: "Greece", arrival: "08:00", departure: "18:00", description: "Experience vibrant nightlife and windmills" },
          { day: 9, date: "2025-04-28", port: "At Sea", country: null, arrival: null, departure: null, description: "Relax as we sail westward" },
          { day: 10, date: "2025-04-29", port: "At Sea", country: null, arrival: null, departure: null, description: "Enjoy ship amenities and spa treatments" },
          { day: 11, date: "2025-04-30", port: "Barcelona, Spain", country: "Spain", arrival: "08:00", departure: null, description: "Disembark after an unforgettable journey" }
        ]
      },
      {
        id: "cruise-3",
        name: "Alaska Wilderness",
        description: "Experience the raw beauty of America's last frontier. Witness majestic glaciers, spot whales and eagles, and explore charming frontier towns in this once-in-a-lifetime adventure.",
        destination: "Alaska",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Northern Star",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Seattle, Washington",
        departureDate: new Date("2025-06-10"),
        returnDate: new Date("2025-06-17"),
        duration: 7,
        basePrice: 1899.00,
        currency: "USD",
        maxGuests: 2400,
        availableCabins: 1200,
        destinations: ["Juneau", "Skagway", "Ketchikan", "Glacier Bay"],
        rating: 4.7,
        reviewCount: 1456,
        highlights: ["Glacier viewing", "Wildlife watching", "Gold rush history", "Indigenous culture"],
        itinerary: [
          { day: 1, date: "2025-06-10", port: "Seattle, Washington", country: "USA", arrival: null, departure: "16:00", description: "Depart from the Emerald City" },
          { day: 2, date: "2025-06-11", port: "At Sea", country: null, arrival: null, departure: null, description: "Scenic sailing through Inside Passage" },
          { day: 3, date: "2025-06-12", port: "Juneau, Alaska", country: "USA", arrival: "08:00", departure: "18:00", description: "Alaska's capital city and Mendenhall Glacier" },
          { day: 4, date: "2025-06-13", port: "Skagway, Alaska", country: "USA", arrival: "07:00", departure: "17:00", description: "Historic gold rush town and railway adventure" },
          { day: 5, date: "2025-06-14", port: "Glacier Bay", country: "USA", arrival: "06:00", departure: "16:00", description: "UNESCO World Heritage glacial wonderland" },
          { day: 6, date: "2025-06-15", port: "Ketchikan, Alaska", country: "USA", arrival: "08:00", departure: "18:00", description: "Salmon capital and Native American culture" },
          { day: 7, date: "2025-06-16", port: "At Sea", country: null, arrival: null, departure: null, description: "Return journey through scenic Inside Passage" },
          { day: 8, date: "2025-06-17", port: "Seattle, Washington", country: "USA", arrival: "07:00", departure: null, description: "Return to Seattle with unforgettable memories" }
        ]
      },
      {
        id: "cruise-4",
        name: "Asian Discovery",
        description: "Immerse yourself in the rich cultures, ancient traditions, and modern marvels of Asia. From bustling metropolises to serene temples, experience the diversity of the Far East.",
        destination: "Asia",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Oriental Pearl",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Singapore",
        departureDate: new Date("2025-02-28"),
        returnDate: new Date("2025-03-14"),
        duration: 14,
        basePrice: 2899.00,
        currency: "USD",
        maxGuests: 3600,
        availableCabins: 1800,
        destinations: ["Hong Kong", "Shanghai", "Kyoto", "Bangkok", "Ho Chi Minh City"],
        rating: 4.6,
        reviewCount: 987,
        highlights: ["Ancient temples", "Modern skylines", "Culinary adventures", "Cultural immersion"],
        itinerary: [
          { day: 1, date: "2025-02-28", port: "Singapore", country: "Singapore", arrival: null, departure: "19:00", description: "Embark from the Garden City" },
          { day: 2, date: "2025-03-01", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing through South China Sea" },
          { day: 3, date: "2025-03-02", port: "Ho Chi Minh City, Vietnam", country: "Vietnam", arrival: "08:00", departure: "18:00", description: "Explore vibrant markets and historic sites" },
          { day: 4, date: "2025-03-03", port: "At Sea", country: null, arrival: null, departure: null, description: "Crossing the Gulf of Thailand" },
          { day: 5, date: "2025-03-04", port: "Bangkok, Thailand", country: "Thailand", arrival: "07:00", departure: "19:00", description: "Golden temples and floating markets" },
          { day: 6, date: "2025-03-05", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing through the South China Sea" },
          { day: 7, date: "2025-03-06", port: "Hong Kong", country: "Hong Kong", arrival: "08:00", departure: "18:00", description: "Skyline views and dim sum cuisine" },
          { day: 8, date: "2025-03-07", port: "At Sea", country: null, arrival: null, departure: null, description: "Crossing the East China Sea" },
          { day: 9, date: "2025-03-08", port: "Shanghai, China", country: "China", arrival: "07:00", departure: "18:00", description: "Modern metropolis meets ancient culture" },
          { day: 10, date: "2025-03-09", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing towards Japan" },
          { day: 11, date: "2025-03-10", port: "Kyoto (Osaka), Japan", country: "Japan", arrival: "08:00", departure: "19:00", description: "Ancient capital with stunning temples" },
          { day: 12, date: "2025-03-11", port: "At Sea", country: null, arrival: null, departure: null, description: "Return journey begins" },
          { day: 13, date: "2025-03-12", port: "At Sea", country: null, arrival: null, departure: null, description: "Relaxing sea day" },
          { day: 14, date: "2025-03-13", port: "Singapore", country: "Singapore", arrival: "08:00", departure: null, description: "Return to Singapore" }
        ]
      },
      {
        id: "cruise-5",
        name: "Norwegian Fjords",
        description: "Sail through some of the world's most dramatic landscapes. Towering waterfalls, snow-capped peaks, and pristine fjords create an unforgettable backdrop for this Nordic adventure.",
        destination: "Northern Europe",
        imageUrl: "https://images.unsplash.com/photo-1516049516295-2c90900bbe4a?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Nordic Voyager",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Bergen, Norway",
        departureDate: new Date("2025-07-05"),
        returnDate: new Date("2025-07-12"),
        duration: 7,
        basePrice: 2299.00,
        currency: "EUR",
        maxGuests: 2200,
        availableCabins: 1100,
        destinations: ["Geiranger", "Flam", "Stavanger", "Alesund"],
        rating: 4.9,
        reviewCount: 1678,
        highlights: ["UNESCO World Heritage fjords", "Midnight sun", "Scenic railways", "Viking heritage"],
        itinerary: [
          { day: 1, date: "2025-07-05", port: "Bergen, Norway", country: "Norway", arrival: null, departure: "17:00", description: "Depart from the colorful Hanseatic city" },
          { day: 2, date: "2025-07-06", port: "Geiranger, Norway", country: "Norway", arrival: "08:00", departure: "18:00", description: "Breathtaking UNESCO World Heritage fjord" },
          { day: 3, date: "2025-07-07", port: "Alesund, Norway", country: "Norway", arrival: "07:00", departure: "17:00", description: "Art Nouveau architecture and mountain views" },
          { day: 4, date: "2025-07-08", port: "Flam, Norway", country: "Norway", arrival: "08:00", departure: "18:00", description: "Scenic railway and Aurlandsfjord" },
          { day: 5, date: "2025-07-09", port: "Stavanger, Norway", country: "Norway", arrival: "09:00", departure: "19:00", description: "Pulpit Rock and oil capital of Norway" },
          { day: 6, date: "2025-07-10", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing through the North Sea" },
          { day: 7, date: "2025-07-11", port: "Bergen, Norway", country: "Norway", arrival: "08:00", departure: null, description: "Return to Bergen with memories to last a lifetime" }
        ]
      },
      {
        id: "cruise-6",
        name: "Transatlantic Crossing",
        description: "Experience the golden age of ocean travel on this classic transatlantic voyage. Enjoy leisurely sea days, formal nights, and the romance of crossing the Atlantic Ocean.",
        destination: "Transatlantic",
        imageUrl: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Grand Atlantic",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Southampton, England",
        departureDate: new Date("2025-09-15"),
        returnDate: new Date("2025-09-22"),
        duration: 7,
        basePrice: 1599.00,
        currency: "USD",
        maxGuests: 2600,
        availableCabins: 1300,
        destinations: ["New York City"],
        rating: 4.5,
        reviewCount: 892,
        highlights: ["Classic ocean crossing", "Formal dining", "Sea day activities", "Statue of Liberty arrival"],
        itinerary: [
          { day: 1, date: "2025-09-15", port: "Southampton, England", country: "UK", arrival: null, departure: "17:00", description: "Depart from historic British port" },
          { day: 2, date: "2025-09-16", port: "At Sea", country: null, arrival: null, departure: null, description: "Full day at sea crossing the Atlantic" },
          { day: 3, date: "2025-09-17", port: "At Sea", country: null, arrival: null, departure: null, description: "Enjoy ship amenities and entertainment" },
          { day: 4, date: "2025-09-18", port: "At Sea", country: null, arrival: null, departure: null, description: "Halfway point celebration" },
          { day: 5, date: "2025-09-19", port: "At Sea", country: null, arrival: null, departure: null, description: "Nearing the American coast" },
          { day: 6, date: "2025-09-20", port: "At Sea", country: null, arrival: null, departure: null, description: "Final sea day with gala dinner" },
          { day: 7, date: "2025-09-21", port: "New York City, New York", country: "USA", arrival: "07:00", departure: null, description: "Arrive in the Big Apple - Statue of Liberty greeting" }
        ]
      },
      {
        id: "cruise-7",
        name: "Australian Coastal",
        description: "Discover Australia's stunning coastline, from the Great Barrier Reef to cosmopolitan cities. Experience unique wildlife, pristine beaches, and vibrant Aboriginal culture.",
        destination: "Australia",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Southern Cross",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Sydney, Australia",
        departureDate: new Date("2025-11-08"),
        returnDate: new Date("2025-11-18"),
        duration: 10,
        basePrice: 2499.00,
        currency: "AUD",
        maxGuests: 2800,
        availableCabins: 1400,
        destinations: ["Brisbane", "Cairns", "Darwin", "Perth", "Melbourne"],
        rating: 4.7,
        reviewCount: 1234,
        highlights: ["Great Barrier Reef", "Outback experiences", "Aboriginal culture", "Unique wildlife"],
        itinerary: [
          { day: 1, date: "2025-11-08", port: "Sydney, Australia", country: "Australia", arrival: null, departure: "18:00", description: "Sail past the iconic Opera House and Harbour Bridge" },
          { day: 2, date: "2025-11-09", port: "Brisbane, Australia", country: "Australia", arrival: "08:00", departure: "18:00", description: "Queensland's sunny capital city" },
          { day: 3, date: "2025-11-10", port: "Cairns, Australia", country: "Australia", arrival: "07:00", departure: "19:00", description: "Gateway to the Great Barrier Reef" },
          { day: 4, date: "2025-11-11", port: "At Sea", country: null, arrival: null, departure: null, description: "Crossing the Coral Sea" },
          { day: 5, date: "2025-11-12", port: "Darwin, Australia", country: "Australia", arrival: "08:00", departure: "18:00", description: "Top End culture and crocodiles" },
          { day: 6, date: "2025-11-13", port: "At Sea", country: null, arrival: null, departure: null, description: "Indian Ocean crossing" },
          { day: 7, date: "2025-11-14", port: "Perth, Australia", country: "Australia", arrival: "08:00", departure: "18:00", description: "Western Australia's sophisticated capital" },
          { day: 8, date: "2025-11-15", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing the Great Australian Bight" },
          { day: 9, date: "2025-11-16", port: "Melbourne, Australia", country: "Australia", arrival: "08:00", departure: "18:00", description: "Cultural capital with great coffee" },
          { day: 10, date: "2025-11-17", port: "At Sea", country: null, arrival: null, departure: null, description: "Final day sailing to Sydney" },
          { day: 11, date: "2025-11-18", port: "Sydney, Australia", country: "Australia", arrival: "07:00", departure: null, description: "Return to spectacular Sydney Harbour" }
        ]
      },
      {
        id: "cruise-8",
        name: "Baltic Sea Heritage",
        description: "Explore the historic capitals and cultural treasures of Northern Europe. From medieval castles to modern design, discover the rich heritage of the Baltic region.",
        destination: "Baltic Sea",
        imageUrl: "https://images.unsplash.com/photo-1580461806516-e7e15b28b9c5?w=800&h=600&fit=crop&crop=center",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop&crop=center",
        ship: "Baltic Star",
        cruiseLine: "Phoenix Cruise Lines",
        departurePort: "Stockholm, Sweden",
        departureDate: new Date("2025-08-12"),
        returnDate: new Date("2025-08-21"),
        duration: 9,
        basePrice: 2099.00,
        currency: "EUR",
        maxGuests: 2400,
        availableCabins: 1200,
        destinations: ["Helsinki", "St. Petersburg", "Tallinn", "Copenhagen", "Oslo"],
        rating: 4.8,
        reviewCount: 1567,
        highlights: ["Imperial palaces", "Medieval old towns", "Scandinavian design", "White nights"],
        itinerary: [
          { day: 1, date: "2025-08-12", port: "Stockholm, Sweden", country: "Sweden", arrival: null, departure: "17:00", description: "Depart from the Venice of the North" },
          { day: 2, date: "2025-08-13", port: "Helsinki, Finland", country: "Finland", arrival: "08:00", departure: "18:00", description: "Finnish design and saunas" },
          { day: 3, date: "2025-08-14", port: "St. Petersburg, Russia", country: "Russia", arrival: "07:00", departure: "19:00", description: "Imperial palaces and Hermitage Museum" },
          { day: 4, date: "2025-08-15", port: "Tallinn, Estonia", country: "Estonia", arrival: "08:00", departure: "17:00", description: "Medieval UNESCO World Heritage old town" },
          { day: 5, date: "2025-08-16", port: "At Sea", country: null, arrival: null, departure: null, description: "Sailing across the Baltic Sea" },
          { day: 6, date: "2025-08-17", port: "Copenhagen, Denmark", country: "Denmark", arrival: "08:00", departure: "18:00", description: "Little Mermaid and modern Danish design" },
          { day: 7, date: "2025-08-18", port: "Oslo, Norway", country: "Norway", arrival: "08:00", departure: "18:00", description: "Viking heritage and modern Norway" },
          { day: 8, date: "2025-08-19", port: "At Sea", country: null, arrival: null, departure: null, description: "Return journey through the Baltic" },
          { day: 9, date: "2025-08-20", port: "Stockholm, Sweden", country: "Sweden", arrival: "08:00", departure: null, description: "Return to beautiful Stockholm" }
        ]
      }
    ];

    // Insert enhanced cruises
    await db.insert(cruises).values(
      enhancedCruises.map((cruise) => ({
        ...cruise,
        basePrice: cruise.basePrice.toString(),
        rating: cruise.rating?.toString() || null,
        itinerary: cruise.itinerary.map((item: any) => ({
          ...item,
          country: item.country === null ? "" : item.country
        }))
      }))
    );

    // Enhanced cabin types - basic set for all cruises
    const enhancedCabinTypes: any[] = [];
    // Create standard cabin types for each cruise with cabin images
    for (const cruise of enhancedCruises) {
      enhancedCabinTypes.push(
        { 
          id: `${cruise.id}-interior`, 
          cruiseId: cruise.id, 
          type: "Interior", 
          name: "Interior Stateroom", 
          description: "Comfortable interior cabin with modern amenities", 
          priceModifier: "1.00", 
          maxOccupancy: 2, 
          amenities: ["Private bathroom", "TV", "Safe"], 
          imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop", 
          availableCount: 50,
          cabinImages: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
          ]
        },
        { 
          id: `${cruise.id}-ocean`, 
          cruiseId: cruise.id, 
          type: "Ocean View", 
          name: "Ocean View Stateroom", 
          description: "Room with window overlooking the ocean", 
          priceModifier: "1.25", 
          maxOccupancy: 2, 
          amenities: ["Ocean view", "Private bathroom", "TV", "Safe"], 
          imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop", 
          availableCount: 30,
          cabinImages: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"
          ]
        },
        { 
          id: `${cruise.id}-balcony`, 
          cruiseId: cruise.id, 
          type: "Balcony", 
          name: "Balcony Stateroom", 
          description: "Private balcony with ocean views", 
          priceModifier: "1.55", 
          maxOccupancy: 2, 
          amenities: ["Private balcony", "Ocean view", "Premium bathroom"], 
          imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop", 
          availableCount: 25,
          cabinImages: [
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"
          ]
        },
        { 
          id: `${cruise.id}-suite`, 
          cruiseId: cruise.id, 
          type: "Suite", 
          name: "Junior Suite", 
          description: "Spacious suite with separate living area", 
          priceModifier: "2.25", 
          maxOccupancy: 4, 
          amenities: ["Separate living area", "Large balcony", "Butler service"], 
          imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop", 
          availableCount: 10,
          cabinImages: [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
          ]
        }
      );
    }

    await db.insert(cabinTypes).values(enhancedCabinTypes);

    // Enhanced extras with more categories
    const enhancedExtras = [
      // Dining packages
      { id: "dining-specialty", name: "Specialty Dining Package", description: "Access to all specialty restaurants", price: "299.00", category: "dining", available: true },
      { id: "dining-wine", name: "Premium Wine Package", description: "Unlimited premium wines and cocktails", price: "599.00", category: "dining", available: true },
      { id: "dining-chef", name: "Chef's Table Experience", description: "Multi-course meal with wine pairings", price: "199.00", category: "dining", available: true },

      // Spa & Wellness
      { id: "spa-package", name: "Ultimate Spa Package", description: "Full day spa treatments and relaxation", price: "399.00", category: "spa", available: true },
      { id: "spa-couples", name: "Couples Massage", description: "Relaxing couples massage treatment", price: "299.00", category: "spa", available: true },
      { id: "spa-fitness", name: "Personal Training Sessions", description: "Private fitness training sessions", price: "149.00", category: "spa", available: true },

      // Shore Excursions
      { id: "excursion-premium", name: "Premium Shore Excursions", description: "Small group premium excursions", price: "899.00", category: "excursions", available: true },
      { id: "excursion-cultural", name: "Cultural Immersion Tours", description: "Deep dive into local culture", price: "599.00", category: "excursions", available: true },
      { id: "excursion-adventure", name: "Adventure Activities", description: "Thrilling outdoor adventures", price: "799.00", category: "excursions", available: true },

      // Internet & Communications
      { id: "internet-unlimited", name: "Unlimited Internet Package", description: "High-speed internet throughout cruise", price: "199.00", category: "internet", available: true },
      { id: "internet-social", name: "Social Media Package", description: "Access to social media platforms", price: "99.00", category: "internet", available: true },

      // Beverages
      { id: "beverage-ultimate", name: "Ultimate Beverage Package", description: "All alcoholic and non-alcoholic drinks", price: "79.00", category: "beverages", available: true },
      { id: "beverage-premium", name: "Premium Beverage Package", description: "Premium alcoholic beverages", price: "59.00", category: "beverages", available: true },
      { id: "beverage-soft", name: "Soft Drink Package", description: "Unlimited soft drinks and juices", price: "29.00", category: "beverages", available: true },

      // Photo Services
      { id: "photo-professional", name: "Professional Photo Package", description: "Professional photos throughout cruise", price: "299.00", category: "photo", available: true },
      { id: "photo-memories", name: "Digital Memory Package", description: "All cruise photos in digital format", price: "199.00", category: "photo", available: true },

      // Laundry & Services
      { id: "laundry-package", name: "Laundry Service Package", description: "Unlimited laundry and pressing", price: "199.00", category: "services", available: true },
      { id: "room-service", name: "24/7 Room Service", description: "Round-the-clock room service", price: "99.00", category: "services", available: true }
    ];

    await db.insert(extras).values(enhancedExtras);

    // Enhanced promotions
    const enhancedPromotions = [
      {
        id: "promo-early-bird",
        code: "EARLY2025",
        name: "Early Bird Special",
        description: "Book 6 months in advance and save up to 30%",
        discountType: "percentage",
        discountValue: "30.00",
        conditions: { minBookingAmount: 2000.0 },
        validFrom: new Date("2024-12-01"),
        validTo: new Date("2025-12-31"),
        maxUses: 1000,
        currentUses: 147,
        isActive: true,

      },
      {
        id: "promo-last-minute",
        code: "LASTMIN25",
        name: "Last Minute Deals",
        description: "Book within 30 days and enjoy 25% savings",
        discountType: "percentage",
        discountValue: "25.00",
        conditions: { minBookingAmount: 1500.0 },
        validFrom: new Date("2025-01-01"),
        validTo: new Date("2025-12-31"),
        maxUses: 500,
        currentUses: 89,
        isActive: true,

      },
      {
        id: "promo-group",
        code: "GROUP20",
        name: "Group Booking Discount",
        description: "Special rates for groups of 8 or more",
        discountType: "percentage",
        discountValue: "20.00",
        conditions: { minBookingAmount: 10000.0 },
        validFrom: new Date("2025-01-01"),
        validTo: new Date("2025-12-31"),
        maxUses: 100,
        currentUses: 23,
        isActive: true,

      },
      {
        id: "promo-loyalty",
        code: "LOYAL15",
        name: "Loyalty Member Exclusive",
        description: "Exclusive discount for returning customers",
        discountType: "percentage",
        discountValue: "15.00",
        conditions: { minBookingAmount: 1000.0 },
        validFrom: new Date("2025-01-01"),
        validTo: new Date("2025-12-31"),
        maxUses: 2000,
        currentUses: 456,
        isActive: true,

      },
      {
        id: "promo-family",
        code: "FAMILY300",
        name: "Family Fun Package",
        description: "Fixed $300 discount for families with children",
        discountType: "fixed_amount",
        discountValue: "300.00",
        conditions: { minBookingAmount: 3000.0 },
        validFrom: new Date("2025-02-01"),
        validTo: new Date("2025-08-31"),
        maxUses: 300,
        currentUses: 67,
        isActive: true,

      }
    ];

    await db.insert(promotions).values(enhancedPromotions);

    console.log("Enhanced database seeding completed successfully!");
    console.log(`Inserted ${enhancedCruises.length} cruises`);
    console.log(`Inserted ${enhancedCabinTypes.length} cabin types`);
    console.log(`Inserted ${enhancedExtras.length} extras`);
    console.log(`Inserted ${enhancedPromotions.length} promotions`);

  } catch (error) {
    console.error("Error during enhanced database seeding:", error);
    throw error;
  }
}