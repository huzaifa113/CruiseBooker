import { useState } from 'react';
import { Plus, Minus, User, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDeals } from '@/lib/deals-context';
import type { GuestInfo } from '@/lib/types';

const guestSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    passportNumber: z.string().optional(),
    passportCountry: z.string().optional(),
    passportExpiry: z
      .string()
      .optional()
      .refine((date) => {
        if (!date || date.trim() === '') return true;
        const expiryDate = new Date(date);
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

        // Passport expiry must be at least 6 months in the future and reasonable
        return (
          expiryDate > sixMonthsFromNow &&
          expiryDate < new Date(today.getFullYear() + 50, today.getMonth(), today.getDate())
        );
      }, 'Passport must be valid for at least 6 months from today and not exceed 50 years'),
    specialNeeds: z.string().optional(),
    isChild: z.boolean(),
    isSenior: z.boolean(),
  })
  .refine(
    (guest) => {
      // If any basic field is filled, all basic fields must be filled
      const hasAnyBasicInfo =
        guest.firstName.trim() || guest.lastName.trim() || guest.dateOfBirth.trim();

      if (hasAnyBasicInfo) {
        // Validate all required fields are filled
        if (!guest.firstName.trim()) return false;
        if (!guest.lastName.trim()) return false;
        if (!guest.dateOfBirth.trim()) return false;

        // Validate date of birth
        const birthDate = new Date(guest.dateOfBirth);
        const today = new Date();
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);

        return birthDate < today && birthDate > hundredYearsAgo;
      }

      return true; // Allow empty guests
    },
    {
      message:
        'Please complete all required fields (first name, last name, date of birth) or leave guest information empty',
      path: ['firstName'], // This will show the error on the firstName field
    }
  );

const guestDetailsSchema = z.object({
  primaryGuestName: z.string().min(1, 'Primary guest name is required'),
  primaryGuestEmail: z.string().email('Valid email is required'),
  primaryGuestPhone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  specialRequests: z.string().optional(),
  departureDate: z.string().optional(),
  guests: z.array(guestSchema).refine((guests) => {
    // At least one guest must have complete information
    const completeGuests = guests.filter(
      (guest) => guest.firstName.trim() && guest.lastName.trim() && guest.dateOfBirth.trim()
    );
    return completeGuests.length >= 1;
  }, 'At least one guest must have complete information'),
});

type GuestDetailsForm = z.infer<typeof guestDetailsSchema>;

interface GuestDetailsProps {
  adultCount: number;
  childCount: number;
  seniorCount: number;
  onGuestCountChange: (adults: number, children: number, seniors: number) => void;
  formData: Partial<GuestDetailsForm>;
  onFormDataChange: (data: Partial<GuestDetailsForm>) => void;
  onContinue: () => void;
  onBack: () => void;
  cruise?: {
    name: string;
    departureDate: string;
    destination: string;
  };
}

export default function GuestDetails({
  adultCount,
  childCount,
  seniorCount,
  onGuestCountChange,
  formData,
  onFormDataChange,
  onContinue,
  onBack,
  cruise,
}: GuestDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedDeal } = useDeals();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalGuests = adultCount + childCount + seniorCount;

  const {
    register,
    formState: { errors, isValid, isDirty },
    handleSubmit,
    watch,
    setValue,
    getValues,
  } = useForm<GuestDetailsForm>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      primaryGuestName:
        formData.primaryGuestName ||
        (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ''),
      primaryGuestEmail: formData.primaryGuestEmail || user?.email || '',
      primaryGuestPhone: formData.primaryGuestPhone || user?.phone || '',
      specialRequests: formData.specialRequests || '',
      departureDate: cruise?.departureDate
        ? new Date(cruise.departureDate).toISOString().split('T')[0]
        : '',
      guests:
        formData.guests ||
        Array(totalGuests)
          .fill(null)
          .map((_, index) => ({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            passportNumber: '',
            passportCountry: '',
            passportExpiry: '',
            specialNeeds: '',
            isChild: index >= adultCount && index < adultCount + childCount,
            isSenior: index >= adultCount + childCount,
          })),
    },
  });

  // Auto-fill primary contact information when user data is available
  useState(() => {
    if (user && !formData.primaryGuestName && !formData.primaryGuestEmail) {
      if (user.firstName && user.lastName) {
        setValue('primaryGuestName', `${user.firstName} ${user.lastName}`);
      }
      if (user.email) {
        setValue('primaryGuestEmail', user.email);
      }
      if (user.phone) {
        setValue('primaryGuestPhone', user.phone);
      }
    }
  });

  const onSubmit = async (data: GuestDetailsForm) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      // Validate passport expiry for filled passports
      if (data.guests) {
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

        const invalidPassports = data.guests.filter((guest: any, index: number) => {
          if (guest.passportExpiry && guest.passportExpiry.trim()) {
            const expiryDate = new Date(guest.passportExpiry);
            return expiryDate < sixMonthsFromNow;
          }
          return false;
        });

        if (invalidPassports.length > 0) {
          toast({
            title: 'Passport Validation Error',
            description: 'All passports must be valid for at least 6 months from today',
            variant: 'destructive',
          });
          return;
        }
      }

      // Validate deal requirements if a deal is selected
      if (selectedDeal && selectedDeal.conditions) {
        const conditions = selectedDeal.conditions;

        // Check minimum guest count for group deals (using minGuests from database)
        if (conditions.minGuests && totalGuests < conditions.minGuests) {
          toast({
            title: 'Deal Requirements Not Met',
            description: `${selectedDeal.name} requires at least ${conditions.minGuests} guests. You currently have ${totalGuests} guests.`,
            variant: 'destructive',
          });
          return;
        }

        // Check early booking requirements (using earlyBookingDays from database)
        if ((conditions as any).earlyBookingDays && cruise?.departureDate) {
          const departureDate = new Date(cruise.departureDate);
          const today = new Date();
          const daysUntilDeparture = Math.ceil(
            (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilDeparture < (conditions as any).earlyBookingDays) {
            toast({
              title: 'Deal Requirements Not Met',
              description: `${selectedDeal.name} requires booking at least ${(conditions as any).earlyBookingDays} days in advance. Your departure is only ${daysUntilDeparture} days away.`,
              variant: 'destructive',
            });
            return;
          }
        }
      }

      onFormDataChange(data);
      onContinue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateGuestCount = (type: 'adults' | 'children' | 'seniors', change: number) => {
    const newCounts = {
      adults: type === 'adults' ? Math.max(1, adultCount + change) : adultCount,
      children: type === 'children' ? Math.max(0, childCount + change) : childCount,
      seniors: type === 'seniors' ? Math.max(0, seniorCount + change) : seniorCount,
    };
    onGuestCountChange(newCounts.adults, newCounts.children, newCounts.seniors);
  };

  // Calculate days until departure for early bird validation
  const daysUntilDeparture = cruise?.departureDate
    ? Math.ceil(
        (new Date(cruise.departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-8" data-testid="guest-details">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Details</h2>

        {/* Booking Information Display */}
        {cruise && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Calendar className="w-5 h-5 mr-2" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Cruise</div>
                  <div className="text-gray-900">{cruise.name}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Destination</div>
                  <div className="text-gray-900">{cruise.destination}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Departure Date</div>
                  <div className="text-gray-900">
                    {new Date(cruise.departureDate).toLocaleDateString()}
                  </div>
                  {daysUntilDeparture !== null && (
                    <div className="text-xs text-blue-600 mt-1">
                      {daysUntilDeparture > 0
                        ? `${daysUntilDeparture} days from now`
                        : 'Departure date has passed'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Guest Count Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Number of Guests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Adults</div>
                    <div className="text-sm text-gray-600">Ages 18+</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount('adults', -1)}
                      disabled={adultCount <= 1}
                      className="w-8 h-8 p-0"
                      data-testid="button-decrease-adults"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium" data-testid="count-adults">
                      {adultCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount('adults', 1)}
                      className="w-8 h-8 p-0"
                      data-testid="button-increase-adults"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Children</div>
                    <div className="text-sm text-gray-600">Ages 2-17</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount('children', -1)}
                      disabled={childCount <= 0}
                      className="w-8 h-8 p-0"
                      data-testid="button-decrease-children"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium" data-testid="count-children">
                      {childCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount('children', 1)}
                      className="w-8 h-8 p-0"
                      data-testid="button-increase-children"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Seniors</div>
                    <div className="text-sm text-gray-600">Ages 55+</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount('seniors', -1)}
                      disabled={seniorCount <= 0}
                      className="w-8 h-8 p-0"
                      data-testid="button-decrease-seniors"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium" data-testid="count-seniors">
                      {seniorCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount('seniors', 1)}
                      className="w-8 h-8 p-0"
                      data-testid="button-increase-seniors"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Primary Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">✓ Signed in as {user.email}</span> - Your contact
                    information has been auto-filled below.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryGuestName">Full Name *</Label>
                  <Input
                    id="primaryGuestName"
                    {...register('primaryGuestName')}
                    placeholder="Enter full name"
                    className={
                      errors.primaryGuestName ? 'border-red-500' : 'placeholder:text-gray-400'
                    }
                    data-testid="input-primary-name"
                  />
                  {errors.primaryGuestName && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryGuestName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="primaryGuestEmail">Email Address *</Label>
                  <Input
                    id="primaryGuestEmail"
                    type="email"
                    {...register('primaryGuestEmail')}
                    placeholder="Enter email address"
                    className={
                      errors.primaryGuestEmail ? 'border-red-500' : 'placeholder:text-gray-400'
                    }
                    data-testid="input-primary-email"
                  />
                  {errors.primaryGuestEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.primaryGuestEmail.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="primaryGuestPhone">Phone Number</Label>
                <Input
                  id="primaryGuestPhone"
                  {...register('primaryGuestPhone')}
                  placeholder="Enter phone number"
                  className={
                    errors.primaryGuestPhone
                      ? 'border-red-500 focus:border-red-500 ring-red-500'
                      : 'placeholder:text-gray-400'
                  }
                  data-testid="input-primary-phone"
                />
                {errors.primaryGuestPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.primaryGuestPhone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <textarea
                  id="specialRequests"
                  {...register('specialRequests')}
                  placeholder="Any dietary restrictions, accessibility needs, or special occasions?"
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none placeholder:text-gray-400"
                  data-testid="textarea-special-requests"
                />
              </div>
            </CardContent>
          </Card>

          {/* Individual Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array(totalGuests)
                .fill(null)
                .map((_, index) => {
                  const isChild = index >= adultCount && index < adultCount + childCount;
                  const isSenior = index >= adultCount + childCount;
                  const guestType = isChild ? 'Child' : isSenior ? 'Senior' : 'Adult';

                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4
                        className="font-medium text-gray-900 mb-4"
                        data-testid={`guest-header-${index}`}
                      >
                        Guest {index + 1} ({guestType})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`guests.${index}.firstName`}>First Name *</Label>
                          <Input
                            {...register(`guests.${index}.firstName`)}
                            className={
                              errors.guests?.[index]?.firstName
                                ? 'border-red-500 focus:border-red-500 ring-red-500'
                                : ''
                            }
                            data-testid={`input-guest-firstname-${index}`}
                          />
                          {errors.guests?.[index]?.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`guests.${index}.lastName`}>Last Name *</Label>
                          <Input
                            {...register(`guests.${index}.lastName`)}
                            className={
                              errors.guests?.[index]?.lastName
                                ? 'border-red-500 focus:border-red-500 ring-red-500'
                                : ''
                            }
                            data-testid={`input-guest-lastname-${index}`}
                          />
                          {errors.guests?.[index]?.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].lastName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`guests.${index}.dateOfBirth`}>Date of Birth *</Label>
                          <Input
                            type="date"
                            {...register(`guests.${index}.dateOfBirth`)}
                            className={
                              errors.guests?.[index]?.dateOfBirth
                                ? 'border-red-500 focus:border-red-500 ring-red-500'
                                : ''
                            }
                            max={new Date().toISOString().split('T')[0]} // Can't select future dates
                            min={
                              new Date(new Date().getFullYear() - 100, 0, 1)
                                .toISOString()
                                .split('T')[0]
                            } // 100 years ago limit
                            data-testid={`input-guest-dob-${index}`}
                          />
                          {errors.guests?.[index]?.dateOfBirth && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].dateOfBirth.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`guests.${index}.passportNumber`}>Passport Number</Label>
                          <Input
                            {...register(`guests.${index}.passportNumber`)}
                            className={
                              errors.guests?.[index]?.passportNumber
                                ? 'border-red-500 focus:border-red-500 ring-red-500'
                                : ''
                            }
                            data-testid={`input-guest-passport-${index}`}
                          />
                          {errors.guests?.[index]?.passportNumber && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].passportNumber.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`guests.${index}.passportCountry`}>
                            Passport Country
                          </Label>
                          <Select
                            onValueChange={(value) => {
                              console.log(`🌍 Setting passport country for guest ${index}:`, value);
                              setValue(`guests.${index}.passportCountry`, value);
                            }}
                            value={watch(`guests.${index}.passportCountry`) || ''}
                          >
                            <SelectTrigger
                              className={
                                errors.guests?.[index]?.passportCountry
                                  ? 'border-red-500 focus:border-red-500 ring-red-500'
                                  : ''
                              }
                              data-testid={`select-guest-country-${index}`}
                            >
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="TH">Thailand</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register(`guests.${index}.passportCountry`)} />
                          {errors.guests?.[index]?.passportCountry && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].passportCountry.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`guests.${index}.passportExpiry`}>Passport Expiry</Label>
                          <Input
                            type="date"
                            {...register(`guests.${index}.passportExpiry`)}
                            className={
                              errors.guests?.[index]?.passportExpiry
                                ? 'border-red-500 focus:border-red-500 ring-red-500'
                                : ''
                            }
                            min={new Date().toISOString().split('T')[0]} // Must be in the future
                            max={
                              new Date(new Date().getFullYear() + 50, 11, 31)
                                .toISOString()
                                .split('T')[0]
                            } // 50 years from now limit
                            data-testid={`input-guest-passport-expiry-${index}`}
                          />
                          {errors.guests?.[index]?.passportExpiry && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].passportExpiry.message}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`guests.${index}.specialNeeds`}>
                            Special Needs/Dietary Requirements
                          </Label>
                          <Textarea
                            {...register(`guests.${index}.specialNeeds`)}
                            className={
                              errors.guests?.[index]?.specialNeeds
                                ? 'border-red-500 focus:border-red-500 ring-red-500'
                                : ''
                            }
                            placeholder="Please specify any special requirements, medical needs, or dietary restrictions"
                            data-testid={`textarea-guest-special-needs-${index}`}
                          />
                          {errors.guests?.[index]?.specialNeeds && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.guests[index].specialNeeds.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="specialRequests">Additional Requests</Label>
              <Textarea
                id="specialRequests"
                {...register('specialRequests')}
                placeholder="Any special requests, celebrations, or additional information"
                data-testid="textarea-special-requests"
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 w-full sm:w-auto"
              data-testid="button-back-guests"
            >
              Back to Extras
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-ocean-600 text-white hover:bg-ocean-700 font-semibold px-8 py-3 w-full sm:w-auto"
              data-testid="button-continue-guests"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </div>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
