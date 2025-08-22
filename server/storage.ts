import { cruises, cabinTypes, bookings, extras, users, cabinHolds, promotions, calendarEvents, type Cruise, type CabinType, type Booking, type Extra, type User, type UpsertUser, type InsertCruise, type InsertCabinType, type InsertBooking, type InsertExtra } from "@shared/schema";
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
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  async getCruises(filters?: SearchFilters): Promise<Cruise[]> {
    let query = db.select().from(cruises);
    
    if (filters) {
      const conditions: any[] = [];
      
      // Simplified destination-only filtering
      if (filters.destination) {
        conditions.push(sql`LOWER(${cruises.destination}) = LOWER(${filters.destination})`);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const order = filters.sortOrder === 'desc' ? desc : asc;
        switch (filters.sortBy) {
          case 'price':
            query = query.orderBy(order(cruises.basePrice));
            break;
          case 'rating':
            query = query.orderBy(order(cruises.rating));
            break;
          case 'duration':
            query = query.orderBy(order(cruises.duration));
            break;
          default:
            query = query.orderBy(desc(cruises.rating));
        }
      } else {
        query = query.orderBy(desc(cruises.rating));
      }
    } else {
      query = query.orderBy(desc(cruises.rating));
    }
    
    return await query;
  }

  async getCruise(id: string): Promise<Cruise | undefined> {
    const [cruise] = await db.select().from(cruises).where(eq(cruises.id, id));
    return cruise || undefined;
  }

  async createCruise(cruise: InsertCruise): Promise<Cruise> {
    const [newCruise] = await db.insert(cruises).values(cruise).returning();
    return newCruise;
  }

  async getCabinTypesByCruise(cruiseId: string): Promise<CabinType[]> {
    return await db.select().from(cabinTypes).where(eq(cabinTypes.cruiseId, cruiseId));
  }

  async getCabinType(id: string): Promise<CabinType | undefined> {
    const [cabinType] = await db.select().from(cabinTypes).where(eq(cabinTypes.id, id));
    return cabinType || undefined;
  }

  async createCabinType(cabinType: InsertCabinType): Promise<CabinType> {
    const [newCabinType] = await db.insert(cabinTypes).values(cabinType).returning();
    return newCabinType;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingWithDetails(bookingId: string): Promise<any> {
    const [booking] = await db
      .select()
      .from(bookings)
      .leftJoin(cruises, eq(bookings.cruiseId, cruises.id))
      .leftJoin(cabinTypes, eq(bookings.cabinTypeId, cabinTypes.id))
      .where(eq(bookings.id, bookingId));
    
    if (!booking) return null;
    
    return {
      ...booking.bookings,
      cruise: booking.cruises,
      cabinType: booking.cabin_types
    };
  }

  async getBookingByConfirmation(confirmationNumber: string, lastName: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(
      and(
        eq(bookings.confirmationNumber, confirmationNumber),
        ilike(bookings.primaryGuestName, `%${lastName}%`)
      )
    );
    return booking || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const confirmationNumber = this.generateConfirmationNumber();
    const [newBooking] = await db.insert(bookings).values({
      ...booking,
      confirmationNumber
    }).returning();
    return newBooking;
  }

  async updateBookingPaymentStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Booking> {
    const [updatedBooking] = await db.update(bookings)
      .set({ 
        paymentStatus: status,
        stripePaymentIntentId,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async updateBookingPayment(id: string, paymentData: {
    paymentIntentId: string;
    paymentStatus: string;
    paidAmount: number;
    paidCurrency: string;
    paidAt: Date;
  }): Promise<Booking> {
    const [updatedBooking] = await db.update(bookings)
      .set({ 
        paymentStatus: paymentData.paymentStatus,
        stripePaymentIntentId: paymentData.paymentIntentId,
        totalAmount: paymentData.paidAmount.toString(),
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getExtras(): Promise<Extra[]> {
    return await db.select().from(extras);
  }

  async getExtrasByCategory(category: string): Promise<Extra[]> {
    return await db.select().from(extras).where(eq(extras.category, category));
  }

  async createExtra(extra: InsertExtra): Promise<Extra> {
    const [newExtra] = await db.insert(extras).values(extra).returning();
    return newExtra;
  }
  
  // Inventory Hold System
  async createCabinHold(cruiseId: string, cabinTypeId: string, quantity: number, userId?: string, sessionId?: string): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute hold
    
    const [hold] = await db.insert(cabinHolds).values({
      cruiseId,
      cabinTypeId,
      userId,
      sessionId,
      quantity,
      expiresAt
    }).returning();
    
    return hold;
  }
  
  async releaseCabinHold(holdId: string): Promise<void> {
    await db.delete(cabinHolds).where(eq(cabinHolds.id, holdId));
  }
  
  async releaseExpiredHolds(): Promise<void> {
    const now = new Date();
    await db.delete(cabinHolds).where(sql`${cabinHolds.expiresAt} < ${now}`);
  }
  
  async checkCabinAvailability(cruiseId: string, cabinTypeId: string, quantity: number): Promise<boolean> {
    // Release expired holds first
    await this.releaseExpiredHolds();
    
    // Get cabin type availability
    const [cabinType] = await db.select().from(cabinTypes).where(
      and(eq(cabinTypes.id, cabinTypeId), eq(cabinTypes.cruiseId, cruiseId))
    );
    
    if (!cabinType) return false;
    
    // Count current holds
    const holds = await db.select().from(cabinHolds).where(
      and(
        eq(cabinHolds.cruiseId, cruiseId),
        eq(cabinHolds.cabinTypeId, cabinTypeId),
        sql`${cabinHolds.expiresAt} > ${new Date()}`
      )
    );
    
    const heldQuantity = holds.reduce((sum, hold) => sum + hold.quantity, 0);
    const availableQuantity = cabinType.availableCount - heldQuantity;
    
    return availableQuantity >= quantity;
  }
  
  // Promotion System
  async getActivePromotions(): Promise<any[]> {
    const now = new Date();
    return await db.select().from(promotions).where(
      and(
        eq(promotions.isActive, true),
        sql`${promotions.validFrom} <= ${now}`,
        sql`${promotions.validTo} >= ${now}`
      )
    );
  }
  
  async applyPromotion(bookingAmount: number, promotionIds: string[], bookingData: any): Promise<{ discountAmount: number; appliedPromotions: any[] }> {
    const appliedPromotions: any[] = [];
    let totalDiscount = 0;
    
    for (const promotionId of promotionIds) {
      const [promotion] = await db.select().from(promotions).where(eq(promotions.id, promotionId));
      
      if (!promotion || !promotion.isActive) continue;
      
      // Check promotion conditions
      const conditions = promotion.conditions as any;
      let eligible = true;
      
      if (conditions?.minBookingAmount && bookingAmount < conditions.minBookingAmount) {
        eligible = false;
      }
      
      if (conditions?.cruiseLines && !conditions.cruiseLines.includes(bookingData.cruiseLine)) {
        eligible = false;
      }
      
      if (conditions?.destinations && !conditions.destinations.includes(bookingData.destination)) {
        eligible = false;
      }
      
      if (eligible) {
        let discount = 0;
        if (promotion.discountType === 'percentage') {
          discount = (bookingAmount * parseFloat(promotion.discountValue)) / 100;
        } else {
          discount = parseFloat(promotion.discountValue);
        }
        
        totalDiscount += discount;
        appliedPromotions.push(promotion);
        
        // Update usage count
        await db.update(promotions)
          .set({ currentUses: sql`${promotions.currentUses} + 1` })
          .where(eq(promotions.id, promotionId));
      }
    }
    
    return { discountAmount: totalDiscount, appliedPromotions };
  }
  
  // Calendar Events
  async createCalendarEvent(bookingId: string, eventData: any): Promise<any> {
    const [event] = await db.insert(calendarEvents).values({
      bookingId,
      ...eventData
    }).returning();
    return event;
  }
  
  async getCalendarEventsByBooking(bookingId: string): Promise<any[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.bookingId, bookingId));
  }

  async updateBookingPayment(bookingId: string, paymentData: {
    paymentIntentId: string;
    paymentStatus: string;
    paidAmount: number;
    paidCurrency: string;
    paidAt: Date;
  }): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        stripePaymentIntentId: paymentData.paymentIntentId,
        paymentStatus: paymentData.paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();
    return booking;
  }

  async getBooking(bookingId: string): Promise<any> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    return booking;
  }

  private generateConfirmationNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const storage = new DatabaseStorage();
