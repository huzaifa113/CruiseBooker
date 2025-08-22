import { cruises, cabinTypes, bookings, extras, users, type Cruise, type CabinType, type Booking, type Extra, type User, type UpsertUser, type InsertCruise, type InsertCabinType, type InsertBooking, type InsertExtra } from "@shared/schema";
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
      
      if (filters.destination) {
        // Use exact match for destination filtering (case-insensitive)
        conditions.push(sql`LOWER(${cruises.destination}) = LOWER(${filters.destination})`);
      }
      
      if (filters.departurePort) {
        conditions.push(eq(cruises.departurePort, filters.departurePort));
      }
      
      if (filters.departureDate) {
        conditions.push(gte(cruises.departureDate, filters.departureDate));
      }
      
      if (filters.returnDate) {
        conditions.push(lte(cruises.returnDate, filters.returnDate));
      }
      
      if (filters.minPrice) {
        conditions.push(gte(cruises.basePrice, filters.minPrice.toString()));
      }
      
      if (filters.maxPrice) {
        conditions.push(lte(cruises.basePrice, filters.maxPrice.toString()));
      }
      
      if (filters.duration && filters.duration.length > 0) {
        const durationConditions = filters.duration.map(d => eq(cruises.duration, d));
        conditions.push(sql`${cruises.duration} IN (${sql.join(filters.duration.map(d => sql`${d}`), sql`,`)})`);
      }
      
      if (filters.cruiseLines && filters.cruiseLines.length > 0) {
        const lineConditions = filters.cruiseLines.map(line => ilike(cruises.cruiseLine, `%${line}%`));
        conditions.push(sql`(${sql.join(lineConditions, sql` OR `)})`);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Sorting
      if (filters.sortBy) {
        const order = filters.sortOrder === 'desc' ? desc : asc;
        switch (filters.sortBy) {
          case 'price':
            query = query.orderBy(order(cruises.basePrice));
            break;
          case 'departure':
            query = query.orderBy(order(cruises.departureDate));
            break;
          case 'duration':
            query = query.orderBy(order(cruises.duration));
            break;
          case 'rating':
            query = query.orderBy(order(cruises.rating));
            break;
        }
      } else {
        query = query.orderBy(asc(cruises.departureDate));
      }
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
