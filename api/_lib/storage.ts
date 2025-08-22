// Re-export storage implementation with serverless database
import { cruises, cabinTypes, bookings, extras, users, cabinHolds, promotions, calendarEvents, type Cruise, type CabinType, type Booking, type Extra, type User, type UpsertUser, type InsertCruise, type InsertCabinType, type InsertBooking, type InsertExtra } from "../../shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, sql, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface SearchFilters {
  destination?: string;
  departurePort?: string;
  departureDate?: Date;
  returnDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  duration?: number[];
  cruiseLines?: string[];
  cabinTypes?: string[];
  guestCount?: number;
  sortBy?: 'price' | 'departure' | 'duration' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Cruises
  getCruises(filters?: SearchFilters): Promise<Cruise[]>;
  getCruise(id: string): Promise<Cruise | undefined>;
  createCruise(cruise: InsertCruise): Promise<Cruise>;
  
  // Cabin Types
  getCabinTypesByCruise(cruiseId: string): Promise<CabinType[]>;
  getCabinType(id: string): Promise<CabinType | undefined>;
  createCabinType(cabinType: InsertCabinType): Promise<CabinType>;
  
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByConfirmation(confirmationNumber: string, lastName: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingPaymentStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Booking>;
  
  // Extras
  getExtras(): Promise<Extra[]>;
  getExtrasByCategory(category: string): Promise<Extra[]>;
  createExtra(extra: InsertExtra): Promise<Extra>;
  
  // Inventory Holds
  createCabinHold(cruiseId: string, cabinTypeId: string, quantity: number, userId?: string, sessionId?: string): Promise<any>;
  releaseCabinHold(holdId: string): Promise<void>;
  releaseExpiredHolds(): Promise<void>;
  checkCabinAvailability(cruiseId: string, cabinTypeId: string, quantity: number): Promise<boolean>;
  
  // Promotions
  getActivePromotions(): Promise<any[]>;
  applyPromotion(bookingAmount: number, promotionIds: string[], bookingData: any): Promise<{ discountAmount: number; appliedPromotions: any[] }>;
  
  // Calendar Events
  createCalendarEvent(bookingId: string, eventData: any): Promise<any>;
  getCalendarEventsByBooking(bookingId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Cruise operations
  async getCruises(filters: SearchFilters = {}): Promise<Cruise[]> {
    let query = db.select().from(cruises);
    
    const conditions = [];
    
    if (filters.destination) {
      conditions.push(ilike(cruises.destination, `%${filters.destination}%`));
    }
    
    if (filters.departurePort) {
      conditions.push(ilike(cruises.departurePort, `%${filters.departurePort}%`));
    }
    
    if (filters.departureDate) {
      conditions.push(gte(cruises.departureDate, filters.departureDate));
    }
    
    if (filters.returnDate) {
      conditions.push(lte(cruises.returnDate, filters.returnDate));
    }
    
    if (filters.minPrice !== undefined) {
      conditions.push(gte(cruises.basePrice, filters.minPrice.toString()));
    }
    
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(cruises.basePrice, filters.maxPrice.toString()));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const column = filters.sortBy === 'price' ? cruises.basePrice : 
                    filters.sortBy === 'departure' ? cruises.departureDate :
                    filters.sortBy === 'duration' ? cruises.duration :
                    filters.sortBy === 'rating' ? cruises.rating : cruises.basePrice;
      
      query = query.orderBy(
        filters.sortOrder === 'desc' ? desc(column) : asc(column)
      );
    }
    
    return await query;
  }

  async getCruise(id: string): Promise<Cruise | undefined> {
    const [cruise] = await db.select().from(cruises).where(eq(cruises.id, id));
    return cruise;
  }

  async createCruise(cruiseData: InsertCruise): Promise<Cruise> {
    const [cruise] = await db.insert(cruises).values(cruiseData).returning();
    return cruise;
  }

  // Cabin Type operations
  async getCabinTypesByCruise(cruiseId: string): Promise<CabinType[]> {
    return await db.select().from(cabinTypes).where(eq(cabinTypes.cruiseId, cruiseId));
  }

  async getCabinType(id: string): Promise<CabinType | undefined> {
    const [cabinType] = await db.select().from(cabinTypes).where(eq(cabinTypes.id, id));
    return cabinType;
  }

  async createCabinType(cabinTypeData: InsertCabinType): Promise<CabinType> {
    const [cabinType] = await db.insert(cabinTypes).values(cabinTypeData).returning();
    return cabinType;
  }

  // Booking operations
  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByConfirmation(confirmationNumber: string, lastName: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(
      and(
        eq(bookings.confirmationNumber, confirmationNumber),
        ilike(bookings.primaryGuestName, `%${lastName}%`)
      )
    );
    return booking;
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const confirmationNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
    const [booking] = await db.insert(bookings).values({
      ...bookingData,
      confirmationNumber,
    }).returning();
    return booking;
  }

  async updateBookingPaymentStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Booking> {
    const updateData: any = { paymentStatus: status };
    if (stripePaymentIntentId) {
      updateData.stripePaymentIntentId = stripePaymentIntentId;
    }
    
    const [booking] = await db.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Extra operations
  async getExtras(): Promise<Extra[]> {
    return await db.select().from(extras);
  }

  async getExtrasByCategory(category: string): Promise<Extra[]> {
    return await db.select().from(extras).where(eq(extras.category, category));
  }

  async createExtra(extraData: InsertExtra): Promise<Extra> {
    const [extra] = await db.insert(extras).values(extraData).returning();
    return extra;
  }

  // Cabin Hold operations
  async createCabinHold(cruiseId: string, cabinTypeId: string, quantity: number, userId?: string, sessionId?: string): Promise<any> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    const [hold] = await db.insert(cabinHolds).values({
      id: randomUUID(),
      cruiseId,
      cabinTypeId,
      quantity,
      userId,
      sessionId,
      expiresAt,
    }).returning();
    return hold;
  }

  async releaseCabinHold(holdId: string): Promise<void> {
    await db.delete(cabinHolds).where(eq(cabinHolds.id, holdId));
  }

  async releaseExpiredHolds(): Promise<void> {
    await db.delete(cabinHolds).where(lte(cabinHolds.expiresAt, new Date()));
  }

  async checkCabinAvailability(cruiseId: string, cabinTypeId: string, quantity: number): Promise<boolean> {
    // Release expired holds first
    await this.releaseExpiredHolds();
    
    // Get cabin type to check total availability
    const cabinType = await this.getCabinType(cabinTypeId);
    if (!cabinType) return false;
    
    // Get current holds for this cabin type
    const currentHolds = await db.select().from(cabinHolds).where(
      and(
        eq(cabinHolds.cruiseId, cruiseId),
        eq(cabinHolds.cabinTypeId, cabinTypeId),
        gte(cabinHolds.expiresAt, new Date())
      )
    );
    
    const totalHeld = currentHolds.reduce((sum, hold) => sum + hold.quantity, 0);
    const available = cabinType.availableCount - totalHeld;
    
    return available >= quantity;
  }

  // Promotion operations
  async getActivePromotions(): Promise<any[]> {
    const now = new Date();
    return await db.select().from(promotions).where(
      and(
        lte(promotions.startDate, now),
        gte(promotions.endDate, now),
        eq(promotions.isActive, true)
      )
    );
  }

  async applyPromotion(bookingAmount: number, promotionIds: string[], bookingData: any): Promise<{ discountAmount: number; appliedPromotions: any[] }> {
    const appliedPromotions = [];
    let totalDiscount = 0;

    for (const promoId of promotionIds) {
      const [promotion] = await db.select().from(promotions).where(eq(promotions.id, promoId));
      
      if (!promotion || !promotion.isActive) continue;
      
      // Check if promotion is currently valid
      const now = new Date();
      if (promotion.startDate > now || promotion.endDate < now) continue;
      
      // Check eligibility based on business rules
      if (promotion.eligibilityRules) {
        const rules = promotion.eligibilityRules as any;
        
        // Check cruise line eligibility
        if (rules.cruiseLines && rules.cruiseLines.length > 0) {
          if (!rules.cruiseLines.includes(bookingData.cruiseLine)) continue;
        }
        
        // Check destination eligibility
        if (rules.destinations && rules.destinations.length > 0) {
          if (!rules.destinations.includes(bookingData.destination)) continue;
        }
        
        // Check minimum booking amount
        if (rules.minimumAmount && bookingAmount < rules.minimumAmount) continue;
      }
      
      // Calculate discount
      let discount = 0;
      if (promotion.discountType === 'percentage') {
        discount = (bookingAmount * promotion.discountValue) / 100;
        if (promotion.maxDiscount) {
          discount = Math.min(discount, promotion.maxDiscount);
        }
      } else if (promotion.discountType === 'fixed') {
        discount = promotion.discountValue;
      }
      
      totalDiscount += discount;
      appliedPromotions.push({
        ...promotion,
        discountAmount: discount
      });
    }

    return {
      discountAmount: totalDiscount,
      appliedPromotions
    };
  }

  // Calendar Event operations
  async createCalendarEvent(bookingId: string, eventData: any): Promise<any> {
    const [event] = await db.insert(calendarEvents).values({
      id: randomUUID(),
      bookingId,
      ...eventData,
    }).returning();
    return event;
  }

  async getCalendarEventsByBooking(bookingId: string): Promise<any[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.bookingId, bookingId));
  }
}

export const storage = new DatabaseStorage();