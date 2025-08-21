-- Create cruises table in Supabase
CREATE TABLE IF NOT EXISTS cruises (
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

-- Insert cruise data
INSERT INTO cruises VALUES ('cruise-3', 'Norwegian Fjords Explorer', 'Celebrity Eclipse', 'Celebrity Cruises', 'Northern Europe', 'Copenhagen, Denmark', 10, 1899.00, '2024-08-12 17:00:00'::timestamp, '2024-08-22 08:00:00'::timestamp, '[
    {"day": 1, "date": "2024-08-12", "port": "Copenhagen", "country": "Denmark", "arrival": null, "departure": "17:00", "description": "Embark in Danish capital"},
    {"day": 2, "date": "2024-08-13", "port": "At Sea", "country": "", "arrival": null, "departure": null, "description": "North Sea sailing"},
    {"day": 3, "date": "2024-08-14", "port": "Stavanger", "country": "Norway", "arrival": "08:00", "departure": "18:00", "description": "Gateway to Preikestolen"},
    {"day": 4, "date": "2024-08-15", "port": "Alesund", "country": "Norway", "arrival": "08:00", "departure": "18:00", "description": "Art Nouveau architecture"},
    {"day": 5, "date": "2024-08-16", "port": "Geiranger", "country": "Norway", "arrival": "08:00", "departure": "18:00", "description": "UNESCO fjord heritage"},
    {"day": 6, "date": "2024-08-17", "port": "Bergen", "country": "Norway", "arrival": "08:00", "departure": "18:00", "description": "Colorful Bryggen wharf"},
    {"day": 7, "date": "2024-08-18", "port": "At Sea", "country": "", "arrival": null, "departure": null, "description": "North Sea crossing"},
    {"day": 8, "date": "2024-08-19", "port": "Amsterdam", "country": "Netherlands", "arrival": "08:00", "departure": "18:00", "description": "Canals and museums"},
    {"day": 9, "date": "2024-08-20", "port": "At Sea", "country": "", "arrival": null, "departure": null, "description": "Return journey"},
    {"day": 10, "date": "2024-08-21", "port": "Copenhagen", "country": "Denmark", "arrival": "08:00", "departure": null, "description": "Disembark"}
  ]'::json, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=100&fit=crop', 2850, 85, 4.9, '2025-08-20 08:36:33.190282'::timestamp);

INSERT INTO cruises VALUES ('cruise-1', 'Mediterranean Odyssey', 'Symphony of the Seas', 'Royal Caribbean', 'Mediterranean', 'Barcelona, Spain', 7, 1299.00, '2024-06-15 17:00:00'::timestamp, '2024-06-22 07:00:00'::timestamp, '[
    {"day": 1, "date": "2024-06-15", "port": "Barcelona", "country": "Spain", "arrival": null, "departure": "17:00", "description": "Embark and explore Gaudí architecture"},
    {"day": 2, "date": "2024-06-16", "port": "Palma", "country": "Spain", "arrival": "08:00", "departure": "18:00", "description": "Beautiful beaches and historic cathedral"},
    {"day": 3, "date": "2024-06-17", "port": "Marseille", "country": "France", "arrival": "07:00", "departure": "19:00", "description": "Gateway to Provence"},
    {"day": 4, "date": "2024-06-18", "port": "Genoa", "country": "Italy", "arrival": "07:00", "departure": "19:00", "description": "Maritime heritage city"},
    {"day": 5, "date": "2024-06-19", "port": "Rome (Civitavecchia)", "country": "Italy", "arrival": "07:00", "departure": "19:00", "description": "The Eternal City"},
    {"day": 6, "date": "2024-06-20", "port": "Monaco", "country": "Monaco", "arrival": "08:00", "departure": "18:00", "description": "Glamorous principality"},
    {"day": 7, "date": "2024-06-21", "port": "Barcelona", "country": "Spain", "arrival": "07:00", "departure": null, "description": "Disembark"}
  ]'::json, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop', 5400, 120, 4.8, '2025-08-20 08:36:33.190282'::timestamp);

INSERT INTO cruises VALUES ('cruise-4', 'Alaska Wilderness Adventure', 'Norwegian Bliss', 'Norwegian Cruise Line', 'Alaska', 'Seattle, WA', 7, 1599.00, '2024-09-05 16:00:00'::timestamp, '2024-09-12 07:00:00'::timestamp, '[
    {"day": 1, "date": "2024-09-05", "port": "Seattle", "country": "USA", "arrival": null, "departure": "16:00", "description": "Embark from Emerald City"},
    {"day": 2, "date": "2024-09-06", "port": "Inside Passage", "country": "USA", "arrival": null, "departure": null, "description": "Scenic cruising"},
    {"day": 3, "date": "2024-09-07", "port": "Ketchikan", "country": "USA", "arrival": "06:00", "departure": "14:00", "description": "Salmon capital"},
    {"day": 4, "date": "2024-09-08", "port": "Juneau", "country": "USA", "arrival": "13:00", "departure": "22:00", "description": "State capital and glaciers"},
    {"day": 5, "date": "2024-09-09", "port": "Skagway", "country": "USA", "arrival": "07:00", "departure": "20:00", "description": "Gold Rush history"},
    {"day": 6, "date": "2024-09-10", "port": "Glacier Bay", "country": "USA", "arrival": "06:00", "departure": "15:00", "description": "UNESCO glacial wilderness"},
    {"day": 7, "date": "2024-09-11", "port": "Inside Passage", "country": "USA", "arrival": null, "departure": null, "description": "Return journey"},
    {"day": 8, "date": "2024-09-12", "port": "Seattle", "country": "USA", "arrival": "07:00", "departure": null, "description": "Disembark"}
  ]'::json, 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=200&h=100&fit=crop', 4004, 110, 4.7, '2025-08-20 08:36:33.190282'::timestamp);

INSERT INTO cruises VALUES ('cruise-2', 'Caribbean Paradise', 'Harmony of the Seas', 'Royal Caribbean', 'Caribbean', 'Miami, FL', 7, 899.00, '2024-07-08 16:00:00'::timestamp, '2024-07-15 08:00:00'::timestamp, '[
    {"day": 1, "date": "2024-07-08", "port": "Miami", "country": "USA", "arrival": null, "departure": "16:00", "description": "Embark from Magic City"},
    {"day": 2, "date": "2024-07-09", "port": "At Sea", "country": "", "arrival": null, "departure": null, "description": "Enjoy ship amenities"},
    {"day": 3, "date": "2024-07-10", "port": "Cozumel", "country": "Mexico", "arrival": "08:00", "departure": "17:00", "description": "Mayan ruins and diving"},
    {"day": 4, "date": "2024-07-11", "port": "Costa Maya", "country": "Mexico", "arrival": "08:00", "departure": "17:00", "description": "Beaches and culture"},
    {"day": 5, "date": "2024-07-12", "port": "Roatan", "country": "Honduras", "arrival": "08:00", "departure": "17:00", "description": "Coral reefs and adventures"},
    {"day": 6, "date": "2024-07-13", "port": "At Sea", "country": "", "arrival": null, "departure": null, "description": "Relax onboard"},
    {"day": 7, "date": "2024-07-14", "port": "Miami", "country": "USA", "arrival": "08:00", "departure": null, "description": "Disembark"}
  ]'::json, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=100&fit=crop', 5479, 95, 4.6, '2025-08-20 08:36:33.190282'::timestamp);