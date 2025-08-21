-- Cruise Booking Platform Database Export
-- Generated for migration to AWS RDS/Aurora

-- Table structure for cruises
CREATE TABLE cruises (
    id varchar PRIMARY KEY,
    name text,
    ship text,
    cruise_line text,
    destination text,
    departure_port text,
    duration integer,
    base_price numeric,
    departure_date timestamp without time zone,
    return_date timestamp without time zone,
    itinerary json,
    image_url text,
    cruise_line_logo_url text,
    max_guests integer,
    available_cabins integer,
    rating numeric,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Sample data structure (will be populated with your actual data)
-- INSERT INTO cruises VALUES (...);

-- Instructions for migration:
-- 1. Create AWS RDS PostgreSQL instance 
-- 2. Connect to new database
-- 3. Run this CREATE TABLE statement
-- 4. Export data from current database
-- 5. Import data to AWS RDS
-- 6. Update environment variables