import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, Users, DollarSign, Tag, Trash2 } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface DealForm {
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  dealType: 'early_booking' | 'last_minute' | 'group_booking' | 'coupon_code' | 'minimum_spend';
  validFrom: string;
  validTo: string;

  // Conditions
  minBookingAmount?: number;
  minGuests?: number;
  maxGuests?: number;
  earlyBookingDays?: number;
  lastMinuteDays?: number;
  couponCode?: string;
  isActive: boolean;
}

export default function AdminSimple() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<DealForm>({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    dealType: 'early_booking',
    validFrom: '',
    validTo: '',
    isActive: true,
  });

  // Fetch existing deals
  const { data: deals, isLoading } = useQuery({
    queryKey: ['/api/admin/promotions/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/promotions/stats');
      return response.json();
    },
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData),
      });
      if (!response.ok) throw new Error('Failed to create deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/stats'] });
      setShowCreateForm(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Deal created successfully!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create deal: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const response = await fetch(`/api/admin/promotions/${dealId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/stats'] });
      toast({
        title: 'Success',
        description: 'Deal deleted successfully',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      dealType: 'early_booking',
      validFrom: '',
      validTo: '',
      isActive: true,
      // Reset all condition fields
      minBookingAmount: undefined,
      minGuests: undefined,
      maxGuests: undefined,
      earlyBookingDays: undefined,
      lastMinuteDays: undefined,
      couponCode: undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 ADMIN: Form data at submission:', formData);
    console.log('🎯 ADMIN: Deal type:', formData.dealType);

    // Build conditions based on deal type
    const conditions: any = {};

    switch (formData.dealType) {
      case 'early_booking':
        // Use provided value or default to 180 days (6 months)
        conditions.earlyBookingDays = formData.earlyBookingDays || 180;
        console.log('📅 ADMIN: Early booking - days:', conditions.earlyBookingDays);
        break;
      case 'last_minute':
        // Use provided value or default to 30 days
        conditions.lastMinuteDays = formData.lastMinuteDays || 30;
        console.log('⏰ ADMIN: Last minute - days:', conditions.lastMinuteDays);
        break;
      case 'group_booking':
        console.log(
          '👥 ADMIN: Group booking - minGuests:',
          formData.minGuests,
          'maxGuests:',
          formData.maxGuests
        );
        // Use provided value or default to 4 guests for group bookings
        conditions.minGuests = formData.minGuests || 4;
        console.log('✅ ADMIN: Added minGuests condition:', conditions.minGuests);
        if (formData.maxGuests) {
          conditions.maxGuests = formData.maxGuests;
          console.log('✅ ADMIN: Added maxGuests condition:', formData.maxGuests);
        }
        break;
      case 'minimum_spend':
        if (formData.minBookingAmount) {
          conditions.minBookingAmount = formData.minBookingAmount;
          console.log('💰 ADMIN: Min spend - amount:', conditions.minBookingAmount);
        } else {
          console.warn('⚠️ ADMIN: No minimum booking amount specified for minimum_spend deal');
        }
        break;
      case 'coupon_code':
        if (formData.couponCode) {
          conditions.couponCode = formData.couponCode.toUpperCase();
          console.log('🎫 ADMIN: Coupon code:', conditions.couponCode);
        } else {
          console.warn('⚠️ ADMIN: No coupon code specified for coupon_code deal');
        }
        break;
    }

    console.log('📋 ADMIN: Built conditions:', conditions);

    const dealData = {
      name: formData.name,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      conditions,
      isActive: formData.isActive,
    };

    console.log('🚀 ADMIN: Sending deal data:', dealData);

    createDealMutation.mutate(dealData);
  };

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case 'early_booking':
        return <Calendar className="w-4 h-4" />;
      case 'last_minute':
        return <Clock className="w-4 h-4" />;
      case 'group_booking':
        return <Users className="w-4 h-4" />;
      case 'minimum_spend':
        return <DollarSign className="w-4 h-4" />;
      case 'coupon_code':
        return <Tag className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getDealTypeFromConditions = (conditions: any) => {
    if (conditions?.earlyBookingDays) return 'early_booking';
    if (conditions?.lastMinuteDays) return 'last_minute';
    if (conditions?.minGuests || conditions?.maxGuests) return 'group_booking';
    if (conditions?.minBookingAmount) return 'minimum_spend';
    if (conditions?.couponCode) return 'coupon_code';
    return 'general';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal Management</h1>
            <p className="text-gray-600 mt-2">Create and manage cruise booking deals</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Deal
          </Button>
        </div>

        {/* Stats Overview */}
        {deals && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deals.totalPromotions || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {deals.activePromotions || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deals.totalUses || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Deals</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {deals.inactivePromotions || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Deal Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Deal Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Early Bird Special"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dealType">Deal Type *</Label>
                    <Select
                      value={formData.dealType}
                      onValueChange={(value: any) => setFormData({ ...formData, dealType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="early_booking">
                          Early Booking (6 months advance)
                        </SelectItem>
                        <SelectItem value="last_minute">Last Minute (within 30 days)</SelectItem>
                        <SelectItem value="group_booking">Group Booking (4+ guests)</SelectItem>
                        <SelectItem value="minimum_spend">Minimum Spend Amount</SelectItem>
                        <SelectItem value="coupon_code">Coupon Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the deal conditions and benefits..."
                    required
                  />
                </div>

                {/* Discount Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, discountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discountValue">
                      Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Valid From *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validTo">Valid Until *</Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Deal-Specific Conditions */}
                {formData.dealType === 'early_booking' && (
                  <div>
                    <Label htmlFor="earlyBookingDays">Days Before Departure Required *</Label>
                    <Input
                      id="earlyBookingDays"
                      type="number"
                      min="1"
                      value={formData.earlyBookingDays || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          earlyBookingDays: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="180 (6 months)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Customer must book at least this many days before departure
                    </p>
                  </div>
                )}

                {formData.dealType === 'last_minute' && (
                  <div>
                    <Label htmlFor="lastMinuteDays">Maximum Days Before Departure *</Label>
                    <Input
                      id="lastMinuteDays"
                      type="number"
                      min="1"
                      value={formData.lastMinuteDays || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastMinuteDays: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="30"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Customer must book within this many days of departure
                    </p>
                  </div>
                )}

                {formData.dealType === 'group_booking' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minGuests">Minimum Guests *</Label>
                      <Input
                        id="minGuests"
                        type="number"
                        min="1"
                        value={formData.minGuests || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minGuests: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGuests">Maximum Guests (Optional)</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        min="1"
                        value={formData.maxGuests || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxGuests: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="Leave empty for no limit"
                      />
                    </div>
                  </div>
                )}

                {formData.dealType === 'minimum_spend' && (
                  <div>
                    <Label htmlFor="minBookingAmount">Minimum Booking Amount ($) *</Label>
                    <Input
                      id="minBookingAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minBookingAmount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minBookingAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g., 2000.00"
                    />
                  </div>
                )}

                {formData.dealType === 'coupon_code' && (
                  <div>
                    <Label htmlFor="couponCode">Coupon Code *</Label>
                    <Input
                      id="couponCode"
                      value={formData.couponCode || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., SAVE20"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Customers will need to enter this code at checkout
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={createDealMutation.isPending}>
                    {createDealMutation.isPending ? 'Creating...' : 'Create Deal'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Deals List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading deals...</div>
            ) : deals?.promotions && deals.promotions.length > 0 ? (
              <div className="space-y-4">
                {deals.promotions.map((deal: any) => {
                  const dealType = getDealTypeFromConditions(deal.conditions);

                  return (
                    <div key={deal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getDealTypeIcon(dealType)}
                            <h3 className="font-medium text-gray-900">{deal.name}</h3>
                            <Badge variant={deal.isActive ? 'default' : 'secondary'}>
                              {deal.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {deal.discountType === 'percentage'
                                ? `${deal.discountValue}%`
                                : `$${deal.discountValue}`}
                            </Badge>
                          </div>

                          <p className="text-gray-600 text-sm mb-2">{deal.description}</p>

                          {/* Deal Conditions Display */}
                          {deal.conditions && (
                            <div className="text-xs text-gray-500">
                              <strong>Conditions: </strong>
                              {deal.conditions.earlyBookingDays &&
                                `Book ${deal.conditions.earlyBookingDays} days early • `}
                              {deal.conditions.lastMinuteDays &&
                                `Book within ${deal.conditions.lastMinuteDays} days • `}
                              {deal.conditions.minBookingAmount &&
                                `Min $${deal.conditions.minBookingAmount} • `}
                              {deal.conditions.minGuests &&
                                `Min ${deal.conditions.minGuests} guests • `}
                              {deal.conditions.couponCode && `Code: ${deal.conditions.couponCode}`}
                            </div>
                          )}

                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>Uses: {deal.currentUses || 0}</span>
                            <span>Valid until: {new Date(deal.validTo).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteDealMutation.mutate(deal.id)}
                          disabled={deleteDealMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-600">Create your first deal to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
