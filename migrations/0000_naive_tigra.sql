CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"confirmation_number" text NOT NULL,
	"user_id" varchar,
	"cruise_id" varchar NOT NULL,
	"cabin_type_id" varchar NOT NULL,
	"selected_promotion_id" varchar,
	"guest_count" integer NOT NULL,
	"adult_count" integer NOT NULL,
	"child_count" integer NOT NULL,
	"senior_count" integer NOT NULL,
	"dining_time" text,
	"special_requests" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) NOT NULL,
	"gratuity_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"primary_guest_name" text NOT NULL,
	"primary_guest_email" text NOT NULL,
	"primary_guest_phone" text,
	"coupon_code" text,
	"departure_date" text,
	"guests" json NOT NULL,
	"extras" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_confirmation_number_unique" UNIQUE("confirmation_number")
);
--> statement-breakpoint
CREATE TABLE "cabin_holds" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cruise_id" varchar NOT NULL,
	"cabin_type_id" varchar NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"quantity" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cabin_types" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cruise_id" varchar NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price_modifier" numeric(5, 2) NOT NULL,
	"max_occupancy" integer NOT NULL,
	"amenities" json NOT NULL,
	"image_url" text NOT NULL,
	"available_count" integer NOT NULL,
	"cabin_images" json DEFAULT '[]'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"location" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cruises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"ship" text NOT NULL,
	"cruise_line" text NOT NULL,
	"destination" text NOT NULL,
	"departure_port" text NOT NULL,
	"duration" integer NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"departure_date" timestamp NOT NULL,
	"return_date" timestamp NOT NULL,
	"itinerary" json NOT NULL,
	"image_url" text NOT NULL,
	"cruise_line_logo_url" text NOT NULL,
	"max_guests" integer NOT NULL,
	"available_cabins" integer NOT NULL,
	"rating" numeric(2, 1),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "extras" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" text NOT NULL,
	"is_per_person" boolean DEFAULT false NOT NULL,
	"is_per_day" boolean DEFAULT false NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"cruise_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"stripe_payment_intent_id" text,
	"transaction_id" text,
	"failure_reason" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_to" timestamp NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"combinable_with" json,
	"conditions" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"phone" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cruise_id_cruises_id_fk" FOREIGN KEY ("cruise_id") REFERENCES "public"."cruises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cabin_type_id_cabin_types_id_fk" FOREIGN KEY ("cabin_type_id") REFERENCES "public"."cabin_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_selected_promotion_id_promotions_id_fk" FOREIGN KEY ("selected_promotion_id") REFERENCES "public"."promotions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cabin_holds" ADD CONSTRAINT "cabin_holds_cruise_id_cruises_id_fk" FOREIGN KEY ("cruise_id") REFERENCES "public"."cruises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cabin_holds" ADD CONSTRAINT "cabin_holds_cabin_type_id_cabin_types_id_fk" FOREIGN KEY ("cabin_type_id") REFERENCES "public"."cabin_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cabin_holds" ADD CONSTRAINT "cabin_holds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cabin_types" ADD CONSTRAINT "cabin_types_cruise_id_cruises_id_fk" FOREIGN KEY ("cruise_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_cruise_id_cruises_id_fk" FOREIGN KEY ("cruise_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorites_user_cruise_idx" ON "favorites" USING btree ("user_id","cruise_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");