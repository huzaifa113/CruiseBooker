-- Production Database Import Script
-- Run this on your production database to copy promotional data

-- Insert Promotions (if they don't exist)
INSERT INTO promotions (id, name, description, discount_type, discount_value, valid_from, valid_to, max_uses, current_uses, conditions, is_active, created_at)
VALUES 
  ('promo-early-bird', 'Early Bird Special', 'Book 6 months in advance and save up to 30%', 'percentage', '30.00', '2024-12-01 00:00:00', '2025-12-31 00:00:00', 1000, 147, '{"minBookingAmount":2000}', true, NOW()),
  ('promo-family', 'Family Fun Package', 'Fixed $300 discount for families with children', 'fixed_amount', '300.00', '2025-02-01 00:00:00', '2025-08-31 00:00:00', 300, 67, '{"minBookingAmount":3000}', true, NOW()),
  ('promo-group', 'Group Booking Discount', 'Special rates for groups of 8 or more', 'percentage', '20.00', '2025-01-01 00:00:00', '2025-12-31 00:00:00', 100, 23, '{"minBookingAmount":10000}', true, NOW()),
  ('promo-last-minute', 'Last Minute Deals', 'Book within 30 days and enjoy 25% savings', 'percentage', '25.00', '2025-01-01 00:00:00', '2025-12-31 00:00:00', 500, 89, '{"minBookingAmount":1500}', true, NOW()),
  ('promo-loyalty', 'Loyalty Member Exclusive', 'Exclusive discount for returning customers', 'percentage', '15.00', '2025-01-01 00:00:00', '2025-12-31 00:00:00', 2000, 456, '{"minBookingAmount":1000}', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Missing Extras (if they don't exist)
INSERT INTO extras (id, name, description, price, category, is_per_person, is_per_day, image_url)
VALUES 
  ('dining-chef', 'Chef''s Table Experience', 'Multi-course meal with wine pairings', '199.00', 'dining', false, false, ''),
  ('dining-specialty', 'Specialty Dining Package', 'Access to all specialty restaurants', '299.00', 'dining', false, false, ''),
  ('dining-wine', 'Premium Wine Package', 'Unlimited premium wines and cocktails', '599.00', 'dining', false, false, 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop'),
  ('excursion-adventure', 'Adventure Activities', 'Thrilling outdoor adventures', '799.00', 'excursions', false, false, ''),
  ('excursion-cultural', 'Cultural Immersion Tours', 'Deep dive into local culture', '599.00', 'excursions', false, false, ''),
  ('excursion-premium', 'Premium Shore Excursions', 'Small group premium excursions', '899.00', 'excursions', false, false, ''),
  ('spa-couples', 'Couples Massage', 'Relaxing couples massage treatment', '299.00', 'spa', false, false, ''),
  ('spa-fitness', 'Personal Training Sessions', 'Private fitness training sessions', '149.00', 'spa', false, false, ''),
  ('spa-package', 'Ultimate Spa Package', 'Full day spa treatments and relaxation', '399.00', 'spa', false, false, '')
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Promotions inserted:' as message, COUNT(*) as count FROM promotions;
SELECT 'Extras inserted:' as message, COUNT(*) as count FROM extras;