import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For simple auth, optional for OAuth users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cruises = pgTable("cruises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ship: text("ship").notNull(),
  cruiseLine: text("cruise_line").notNull(),
  destination: text("destination").notNull(),
  departurePort: text("departure_port").notNull(),
  duration: integer("duration").notNull(), // days
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  departureDate: timestamp("departure_date").notNull(),
  returnDate: timestamp("return_date").notNull(),
  itinerary: json("itinerary").$type<Array<{
    day: number;
    date: string;
    port: string;
    country: string;
    arrival: string | null;
    departure: string | null;
    description: string;
  }>>().notNull(),
  imageUrl: text("image_url").notNull(),
  cruiseLineLogoUrl: text("cruise_line_logo_url").notNull(),
  maxGuests: integer("max_guests").notNull(),
  availableCabins: integer("available_cabins").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const cabinTypes = pgTable("cabin_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cruiseId: varchar("cruise_id").notNull().references(() => cruises.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "Interior", "Ocean View", "Balcony", "Suite"
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceModifier: decimal("price_modifier", { precision: 5, scale: 2 }).notNull(), // multiplier for base price
  maxOccupancy: integer("max_occupancy").notNull(),
  amenities: json("amenities").$type<string[]>().notNull(),
  imageUrl: text("image_url").notNull(),
  availableCount: integer("available_count").notNull(),
  cabinImages: json("cabin_images").$type<string[]>().default([]).notNull() // Array of cabin interior images
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  confirmationNumber: text("confirmation_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  cruiseId: varchar("cruise_id").notNull().references(() => cruises.id),
  cabinTypeId: varchar("cabin_type_id").notNull().references(() => cabinTypes.id),
  selectedPromotionId: varchar("selected_promotion_id").references(() => promotions.id), // Track selected deal from home page
  guestCount: integer("guest_count").notNull(),
  adultCount: integer("adult_count").notNull(),
  childCount: integer("child_count").notNull(),
  seniorCount: integer("senior_count").notNull(),
  diningTime: text("dining_time"), // "Early", "Late", "My Time"
  specialRequests: text("special_requests"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  gratuityAmount: decimal("gratuity_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "failed", "refunded"
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  primaryGuestName: text("primary_guest_name").notNull(),
  primaryGuestEmail: text("primary_guest_email").notNull(),
  primaryGuestPhone: text("primary_guest_phone"),
  couponCode: text("coupon_code"), // For promotion validation
  departureDate: text("departure_date"), // User-entered departure date for promotion validation
  guests: json("guests").$type<Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    passportNumber?: string;
    passportCountry?: string;
    passportExpiry?: string;
    specialNeeds?: string;
    isChild: boolean;
    isSenior: boolean;
  }>>().notNull(),
  extras: json("extras").$type<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const extras = pgTable("extras", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // "wifi", "beverages", "dining", "excursions", "spa"
  isPerPerson: boolean("is_per_person").notNull().default(false),
  isPerDay: boolean("is_per_day").notNull().default(false),
  imageUrl: text("image_url")
});

// Cabin inventory holds
export const cabinHolds = pgTable("cabin_holds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cruiseId: varchar("cruise_id").notNull().references(() => cruises.id),
  cabinTypeId: varchar("cabin_type_id").notNull().references(() => cabinTypes.id),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // For non-authenticated users
  quantity: integer("quantity").notNull().default(1),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Promotions and discounts
export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // "percentage", "fixed_amount"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  combinableWith: json("combinable_with").$type<string[]>(), // Array of promotion IDs
  conditions: json("conditions").$type<{
    minBookingAmount?: number;
    maxBookingAmount?: number;
    minGuests?: number;
    maxGuests?: number;
    earlyBookingDays?: number; // Days before departure required for booking
    cruiseLines?: string[];
    destinations?: string[];
    cabinTypes?: string[];
    requiredCouponCode?: string; // Optional coupon code requirement
    ageRequirements?: {
      minSeniors?: number; // Minimum senior count
      maxChildren?: number; // Maximum child count
    };
    groupBooking?: {
      enabled: boolean;
      minCabins?: number; // Minimum cabins for group discount
    };
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// iCal calendar events
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  eventType: text("event_type").notNull(), // "departure", "arrival", "port_call"
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow()
});

// Payment transactions table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // "pending", "processing", "paid", "failed", "refunded"
  paymentMethod: text("payment_method"), // "card", "bank_transfer", etc.
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  transactionId: text("transaction_id"),
  failureReason: text("failure_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  cruiseId: varchar("cruise_id").notNull().references(() => cruises.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Ensure unique user-cruise combinations
  index("favorites_user_cruise_idx").on(table.userId, table.cruiseId)
]);

// Relations
export const cruisesRelations = relations(cruises, ({ many }) => ({
  cabinTypes: many(cabinTypes),
  bookings: many(bookings)
}));

export const cabinTypesRelations = relations(cabinTypes, ({ one, many }) => ({
  cruise: one(cruises, {
    fields: [cabinTypes.cruiseId],
    references: [cruises.id]
  }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  cruise: one(cruises, {
    fields: [bookings.cruiseId],
    references: [cruises.id]
  }),
  cabinType: one(cabinTypes, {
    fields: [bookings.cabinTypeId],
    references: [cabinTypes.id]
  })
}));

// Insert schemas
export const insertCruiseSchema = createInsertSchema(cruises).omit({
  id: true,
  createdAt: true
});

export const insertCabinTypeSchema = createInsertSchema(cabinTypes).omit({
  id: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  confirmationNumber: true,
  createdAt: true,
  updatedAt: true
});

export const insertExtraSchema = createInsertSchema(extras).omit({
  id: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Cruise = typeof cruises.$inferSelect;
export type InsertCruise = z.infer<typeof insertCruiseSchema>;
export type CabinType = typeof cabinTypes.$inferSelect;
export type InsertCabinType = z.infer<typeof insertCabinTypeSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Extra = typeof extras.$inferSelect;
export type InsertExtra = z.infer<typeof insertExtraSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
