import { db } from "./db";
import { cruises, cabinTypes, extras, promotions } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if cruises already exist
    const existingCruises = await db.select().from(cruises).limit(1);
    if (existingCruises.length > 0 && !process.env.FORCE_SEED) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Clear existing data if force seeding
    if (process.env.FORCE_SEED) {
      console.log("Force seeding - clearing existing data...");
      await db.delete(extras);
      await db.delete(cabinTypes);
      await db.delete(cruises);
    }

    // Enhanced cruise data with more destinations
    const sampleCruises = [
      {
        id: "cruise-1",
        name: "Caribbean Paradise",
        ship: "Royal Princess",
        cruiseLine: "Royal Caribbean",
        destination: "Caribbean",
        departurePort: "Miami, Florida",
        duration: 7,
        basePrice: "899.00",
        departureDate: new Date("2024-12-15"),
        returnDate: new Date("2024-12-22"),
        itinerary: [
          {
            day: 1,
            date: "2024-12-15",
            port: "Miami",
            country: "USA",
            arrival: null,
            departure: "5:00 PM",
            description: "Depart from beautiful Miami, Florida"
          },
          {
            day: 2,
            date: "2024-12-16",
            port: "At Sea",
            country: "",
            arrival: null,
            departure: null,
            description: "Enjoy a relaxing day at sea"
          },
          {
            day: 3,
            date: "2024-12-17",
            port: "Cozumel",
            country: "Mexico",
            arrival: "8:00 AM",
            departure: "6:00 PM",
            description: "Explore the beautiful island of Cozumel"
          }
        ],
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200",
        maxGuests: 3000,
        availableCabins: 150,
        rating: "4.5"
      },
      {
        id: "cruise-2",
        name: "Mediterranean Explorer",
        ship: "Symphony of the Seas",
        cruiseLine: "Royal Caribbean",
        destination: "Mediterranean",
        departurePort: "Barcelona, Spain",
        duration: 10,
        basePrice: "1299.00",
        departureDate: new Date("2024-12-20"),
        returnDate: new Date("2024-12-30"),
        itinerary: [
          {
            day: 1,
            date: "2024-12-20",
            port: "Barcelona",
            country: "Spain",
            arrival: null,
            departure: "6:00 PM",
            description: "Depart from historic Barcelona"
          },
          {
            day: 2,
            date: "2024-12-21",
            port: "Palma",
            country: "Spain",
            arrival: "8:00 AM",
            departure: "6:00 PM",
            description: "Explore the beautiful Balearic Islands"
          },
          {
            day: 3,
            date: "2024-12-22",
            port: "Rome",
            country: "Italy",
            arrival: "7:00 AM",
            departure: "8:00 PM",
            description: "Visit the eternal city of Rome"
          }
        ],
        imageUrl: "https://images.unsplash.com/photo-1552664199-fd31f7431946?w=800",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200",
        maxGuests: 5400,
        availableCabins: 200,
        rating: "4.7"
      },
      {
        id: "cruise-3",
        name: "Norwegian Fjords Explorer",
        ship: "Norwegian Epic",
        cruiseLine: "Norwegian Cruise Line",
        destination: "Northern Europe",
        departurePort: "Copenhagen, Denmark",
        duration: 14,
        basePrice: "1899.00",
        departureDate: new Date("2025-01-05"),
        returnDate: new Date("2025-01-19"),
        itinerary: [
          {
            day: 1,
            date: "2025-01-05",
            port: "Copenhagen",
            country: "Denmark",
            arrival: null,
            departure: "5:00 PM",
            description: "Depart from beautiful Copenhagen"
          },
          {
            day: 2,
            date: "2025-01-06",
            port: "At Sea",
            country: "",
            arrival: null,
            departure: null,
            description: "Relaxing day at sea"
          },
          {
            day: 3,
            date: "2025-01-07",
            port: "Geiranger",
            country: "Norway",
            arrival: "8:00 AM",
            departure: "6:00 PM",
            description: "Marvel at the stunning Norwegian fjords"
          }
        ],
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200",
        maxGuests: 4100,
        availableCabins: 180,
        rating: "4.6"
      },
      {
        id: "cruise-4",
        name: "Alaska Wilderness",
        ship: "Celebrity Solstice",
        cruiseLine: "Celebrity Cruises",
        destination: "Alaska",
        departurePort: "Seattle, Washington",
        duration: 7,
        basePrice: "1199.00",
        departureDate: new Date("2025-01-15"),
        returnDate: new Date("2025-01-22"),
        itinerary: [
          {
            day: 1,
            date: "2025-01-15",
            port: "Seattle",
            country: "USA",
            arrival: null,
            departure: "4:00 PM",
            description: "Depart from Seattle's beautiful waterfront"
          },
          {
            day: 2,
            date: "2025-01-16",
            port: "At Sea",
            country: "",
            arrival: null,
            departure: null,
            description: "Scenic cruising through Inside Passage"
          },
          {
            day: 3,
            date: "2025-01-17",
            port: "Juneau",
            country: "USA",
            arrival: "1:30 PM",
            departure: "10:00 PM",
            description: "Alaska's capital city surrounded by wilderness"
          }
        ],
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200",
        maxGuests: 2850,
        availableCabins: 120,
        rating: "4.4"
      },
      {
        id: "cruise-5",
        name: "Norwegian Fjords Adventure",
        ship: "Norwegian Epic",
        cruiseLine: "Norwegian Cruise Line",
        destination: "Norwegian Fjords",
        departurePort: "Copenhagen, Denmark",
        duration: 9,
        basePrice: "1599.00",
        departureDate: new Date("2025-02-10"),
        returnDate: new Date("2025-02-19"),
        itinerary: [
          {
            day: 1,
            date: "2025-02-10",
            port: "Copenhagen",
            country: "Denmark",
            arrival: null,
            departure: "4:00 PM",
            description: "Depart from historic Copenhagen"
          },
          {
            day: 2,
            date: "2025-02-11",
            port: "At Sea",
            country: "",
            arrival: null,
            departure: null,
            description: "Sailing towards Norway"
          },
          {
            day: 3,
            date: "2025-02-12",
            port: "Geiranger",
            country: "Norway",
            arrival: "6:00 AM",
            departure: "1:00 PM",
            description: "UNESCO World Heritage fjord"
          }
        ],
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200",
        maxGuests: 4100,
        availableCabins: 180,
        rating: "4.6"
      },
      {
        id: "cruise-6",
        name: "Asia Explorer",
        ship: "Celebrity Millennium",
        cruiseLine: "Celebrity Cruises",
        destination: "Asia",
        departurePort: "Singapore",
        duration: 12,
        basePrice: "1899.00",
        departureDate: new Date("2025-03-05"),
        returnDate: new Date("2025-03-17"),
        itinerary: [
          {
            day: 1,
            date: "2025-03-05",
            port: "Singapore",
            country: "Singapore",
            arrival: null,
            departure: "6:00 PM",
            description: "Depart from modern Singapore"
          },
          {
            day: 2,
            date: "2025-03-06",
            port: "Kuala Lumpur",
            country: "Malaysia",
            arrival: "8:00 AM",
            departure: "6:00 PM",
            description: "Malaysia's vibrant capital city"
          },
          {
            day: 3,
            date: "2025-03-07",
            port: "Bangkok",
            country: "Thailand",
            arrival: "7:00 AM",
            departure: "11:00 PM",
            description: "Cultural treasures and street food"
          }
        ],
        imageUrl: "https://images.unsplash.com/photo-1552662932-3c5c7d9387db?w=800",
        cruiseLineLogoUrl: "https://images.unsplash.com/photo-1552662932-3c5c7d9387db?w=200",
        maxGuests: 2158,
        availableCabins: 95,
        rating: "4.3"
      }
    ];

    // Insert cruises
    console.log("Inserting sample cruises...");
    await db.insert(cruises).values(sampleCruises);

    // Insert cabin types for each cruise
    const sampleCabinTypes = [];
    for (const cruise of sampleCruises) {
      sampleCabinTypes.push(
        {
          cruiseId: cruise.id,
          type: "Interior",
          name: "Interior Stateroom",
          description: "Comfortable interior cabin with all essential amenities",
          priceModifier: "1.00",
          maxOccupancy: 4,
          amenities: ["Two twin beds (convertible to queen)", "Private bathroom", "Closet and drawer space", "Room service"],
          imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
          availableCount: 50
        },
        {
          cruiseId: cruise.id,
          type: "Ocean View",
          name: "Ocean View Stateroom",
          description: "Cabin with ocean view window and modern amenities",
          priceModifier: "1.25",
          maxOccupancy: 4,
          amenities: ["Ocean view window", "Two twin beds (convertible to queen)", "Private bathroom", "Sitting area", "Room service"],
          imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
          availableCount: 40
        },
        {
          cruiseId: cruise.id,
          type: "Balcony",
          name: "Balcony Stateroom",
          description: "Spacious cabin with private balcony overlooking the ocean",
          priceModifier: "1.75",
          maxOccupancy: 4,
          amenities: ["Private balcony", "Two twin beds (convertible to queen)", "Private bathroom", "Sitting area", "Mini-bar", "Room service"],
          imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
          availableCount: 30
        },
        {
          cruiseId: cruise.id,
          type: "Suite",
          name: "Junior Suite",
          description: "Luxury suite with separate living area and premium amenities",
          priceModifier: "2.50",
          maxOccupancy: 6,
          amenities: ["Large private balcony", "Separate living area", "King-size bed", "Premium bathroom", "Mini-bar", "Priority boarding", "Concierge service"],
          imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
          availableCount: 20
        }
      );
    }

    console.log("Inserting cabin types...");
    await db.insert(cabinTypes).values(sampleCabinTypes);

    // Insert sample extras
    const sampleExtras = [
      {
        category: "Beverage",
        name: "Ultimate Beverage Package",
        description: "Unlimited premium beverages including cocktails, wine, and specialty coffees",
        price: "79.99",
        currency: "USD",
        duration: "per day",
        imageUrl: "https://images.unsplash.com/photo-1544896478-d5c4d5d4c2e7?w=300"
      },
      {
        category: "Dining",
        name: "Specialty Dining Package",
        description: "Access to all specialty restaurants for the duration of your cruise",
        price: "199.99",
        currency: "USD",
        duration: "per cruise",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300"
      },
      {
        category: "Internet",
        name: "Premium WiFi Package",
        description: "High-speed internet access throughout your cruise",
        price: "29.99",
        currency: "USD",
        duration: "per day",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300"
      },
      {
        category: "Entertainment",
        name: "Shore Excursion Package",
        description: "Curated collection of the best shore excursions at every port",
        price: "299.99",
        currency: "USD",
        duration: "per cruise",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300"
      }
    ];

    console.log("Inserting sample extras...");
    await db.insert(extras).values(sampleExtras);

    // Seed promotions
    console.log("Inserting sample promotions...");
    const samplePromotions = [
      {
        id: 'promo-early-bird',
        name: 'Early Bird Special',
        description: 'Book 90 days in advance and save 15%',
        discountType: 'percentage',
        discountValue: '15.00',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        maxUses: 1000,
        currentUses: 0,
        conditions: {
          minBookingAmount: 1000,
          cruiseLines: ['Royal Caribbean', 'Celebrity']
        },
        isActive: true
      },
      {
        id: 'promo-mediterranean',
        name: 'Mediterranean Explorer Deal',
        description: '$200 off Mediterranean cruises',
        discountType: 'fixed_amount',
        discountValue: '200.00',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-06-30'),
        maxUses: 500,
        currentUses: 0,
        conditions: {
          destinations: ['Mediterranean']
        },
        isActive: true
      },
      {
        id: 'promo-group-discount',
        name: 'Group Booking Discount',
        description: '10% off for 4+ guests',
        discountType: 'percentage',
        discountValue: '10.00',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2025-12-31'),
        maxUses: null,
        currentUses: 0,
        conditions: {
          minBookingAmount: 2000
        },
        isActive: true
      }
    ];
    
    await db.insert(promotions).values(samplePromotions);

    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}