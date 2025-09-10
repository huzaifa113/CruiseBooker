# Discount Module Test Scenarios

## Test the Fixed Discount System

### 1. Early Booking Discount (6 months / 180 days)

**Admin Setup:**
1. Go to `/admin`
2. Create new promotion:
   - Name: "Early Bird Special"
   - Type: "Early Booking Discount"
   - Discount: 30% or $500
   - Days Before Departure: 180
   - Valid dates: Set future dates

**User Test:**
1. Find a cruise departing more than 180 days from now
2. Book the cruise and proceed to checkout
3. Verify discount appears and conditions are validated

### 2. Last Minute Deal (30 days)

**Admin Setup:**
1. Create new promotion:
   - Name: "Last Minute Saver"
   - Type: "Last Minute Deal"
   - Discount: 20% or $300
   - Maximum Days Before Departure: 30

**User Test:**
1. Find a cruise departing within 30 days
2. Book and check discount application at checkout

### 3. Group Booking Deal (4+ guests)

**Admin Setup:**
1. Create promotion:
   - Name: "Group Discount"
   - Type: "Group Booking Deal"
   - Minimum Guests: 4
   - Discount: 15%

**User Test:**
1. Book cruise for 4+ guests
2. Verify discount applies based on guest count

### 4. Coupon Code Validation

**Admin Setup:**
1. Create promotion:
   - Name: "Special Code Deal"
   - Type: "Coupon Code Deal"
   - Coupon Code: "SAVE20"
   - Discount: 20%

**User Test:**
1. At checkout, enter coupon code "SAVE20"
2. Verify validation and discount application

## Validation Points

For each test, verify:
- ✅ Conditions are properly checked (dates, guest count, etc.)
- ✅ Discount amount is correctly calculated
- ✅ Pricing breakdown shows discounts
- ✅ Multiple conditions work together
- ✅ Invalid scenarios show proper error messages
- ✅ Final total reflects all applied discounts

## Common Issues to Watch For

1. **Date Validation**: Ensure departure date comparison works correctly
2. **Guest Count**: Verify adult + children + seniors = total guests
3. **Currency Conversion**: Check discount applies before currency conversion
4. **Coupon Codes**: Ensure case-insensitive matching and proper validation
5. **Multiple Promotions**: Test combinable vs non-combinable promotions
