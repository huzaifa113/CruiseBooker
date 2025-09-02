import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface PromotionForm {
  name: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  validFrom: string;
  validTo: string;
  maxUses: number;
  promotionType: "early_booking" | "minimum_amount" | "guest_count" | "coupon_code";
  // Conditions
  earlyBookingDays?: number;
  minBookingAmount?: number;
  minGuests?: number;
  maxGuests?: number;
  couponCode?: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<PromotionForm>({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    validFrom: "",
    validTo: "",
    maxUses: 1000,
    promotionType: "early_booking"
  });

  // Fetch promotion statistics
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["/api/admin/promotions/stats"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionData)
      });
      if (!response.ok) throw new Error('Failed to create promotion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions/stats"] });
      setShowCreateForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Promotion created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create promotion: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Deactivate promotion mutation
  const deactivatePromotionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to deactivate promotion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions/stats"] });
      toast({
        title: "Success",
        description: "Promotion deactivated successfully"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      validFrom: "",
      validTo: "",
      maxUses: 1000,
      promotionType: "early_booking"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build conditions object based on promotion type
    const conditions: any = {};
    
    switch (formData.promotionType) {
      case "early_booking":
        if (formData.earlyBookingDays) {
          conditions.earlyBookingDays = formData.earlyBookingDays;
        }
        break;
      case "minimum_amount":
        if (formData.minBookingAmount) {
          conditions.minBookingAmount = formData.minBookingAmount;
        }
        break;
      case "guest_count":
        if (formData.minGuests) conditions.minGuests = formData.minGuests;
        if (formData.maxGuests) conditions.maxGuests = formData.maxGuests;
        break;
      case "coupon_code":
        if (formData.couponCode) {
          conditions.requiredCouponCode = formData.couponCode;
        }
        break;
    }

    const promotionData = {
      name: formData.name,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      maxUses: formData.maxUses,
      conditions,
      couponCode: formData.couponCode
    };

    createPromotionMutation.mutate(promotionData);
  };

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case "early_booking": return <Calendar className="w-4 h-4" />;
      case "minimum_amount": return <DollarSign className="w-4 h-4" />;
      case "guest_count": return <Users className="w-4 h-4" />;
      case "coupon_code": return <Edit className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getPromotionTypeFromConditions = (conditions: any) => {
    if (conditions?.earlyBookingDays) return "early_booking";
    if (conditions?.minBookingAmount) return "minimum_amount";
    if (conditions?.minGuests || conditions?.maxGuests) return "guest_count";
    if (conditions?.requiredCouponCode) return "coupon_code";
    return "general";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotion Management</h1>
            <p className="text-gray-600 mt-2">Create and manage promotional deals for cruise bookings</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
            data-testid="button-create-promotion"
          >
            <Plus className="w-4 h-4" />
            Create New Deal
          </Button>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-promotions">
                  {(stats as any).totalPromotions || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-active-promotions">
                  {(stats as any).activePromotions || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-uses">
                  {(stats as any).totalUses || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Deals</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="stat-inactive-promotions">
                  {(stats as any).inactivePromotions || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Promotion Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Promotional Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Promotion Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Early Bird Special"
                      required
                      data-testid="input-promotion-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="promotionType">Promotion Type *</Label>
                    <Select
                      value={formData.promotionType}
                      onValueChange={(value: any) => setFormData({...formData, promotionType: value})}
                    >
                      <SelectTrigger data-testid="select-promotion-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="early_booking">Early Booking Discount</SelectItem>
                        <SelectItem value="minimum_amount">Minimum Spend Deal</SelectItem>
                        <SelectItem value="guest_count">Group Booking Deal</SelectItem>
                        <SelectItem value="coupon_code">Coupon Code Deal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the promotional offer..."
                    required
                    data-testid="textarea-promotion-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: any) => setFormData({...formData, discountType: value})}
                    >
                      <SelectTrigger data-testid="select-discount-type">
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
                      step={formData.discountType === 'percentage' ? "1" : "0.01"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                      required
                      data-testid="input-discount-value"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxUses">Max Uses</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value) || 1000})}
                      data-testid="input-max-uses"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Valid From *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                      required
                      data-testid="input-valid-from"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="validTo">Valid Until *</Label>
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                      required
                      data-testid="input-valid-to"
                    />
                  </div>
                </div>

                {/* Conditional Fields Based on Promotion Type */}
                {formData.promotionType === "early_booking" && (
                  <div>
                    <Label htmlFor="earlyBookingDays">Days Before Departure Required *</Label>
                    <Input
                      id="earlyBookingDays"
                      type="number"
                      min="1"
                      value={formData.earlyBookingDays || ""}
                      onChange={(e) => setFormData({...formData, earlyBookingDays: parseInt(e.target.value) || undefined})}
                      placeholder="e.g., 30"
                      data-testid="input-early-booking-days"
                    />
                  </div>
                )}

                {formData.promotionType === "minimum_amount" && (
                  <div>
                    <Label htmlFor="minBookingAmount">Minimum Booking Amount ($) *</Label>
                    <Input
                      id="minBookingAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minBookingAmount || ""}
                      onChange={(e) => setFormData({...formData, minBookingAmount: parseFloat(e.target.value) || undefined})}
                      placeholder="e.g., 500.00"
                      data-testid="input-min-booking-amount"
                    />
                  </div>
                )}

                {formData.promotionType === "guest_count" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minGuests">Minimum Guests</Label>
                      <Input
                        id="minGuests"
                        type="number"
                        min="1"
                        value={formData.minGuests || ""}
                        onChange={(e) => setFormData({...formData, minGuests: parseInt(e.target.value) || undefined})}
                        placeholder="e.g., 4"
                        data-testid="input-min-guests"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGuests">Maximum Guests</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        min="1"
                        value={formData.maxGuests || ""}
                        onChange={(e) => setFormData({...formData, maxGuests: parseInt(e.target.value) || undefined})}
                        placeholder="e.g., 8"
                        data-testid="input-max-guests"
                      />
                    </div>
                  </div>
                )}

                {formData.promotionType === "coupon_code" && (
                  <div>
                    <Label htmlFor="couponCode">Coupon Code *</Label>
                    <Input
                      id="couponCode"
                      value={formData.couponCode || ""}
                      onChange={(e) => setFormData({...formData, couponCode: e.target.value.toUpperCase()})}
                      placeholder="e.g., SAVE20"
                      data-testid="input-coupon-code"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createPromotionMutation.isPending}
                    data-testid="button-submit-promotion"
                  >
                    {createPromotionMutation.isPending ? "Creating..." : "Create Promotion"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    data-testid="button-cancel-promotion"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Promotions List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats as any)?.promotions && (stats as any).promotions.length > 0 ? (
              <div className="space-y-4">
                {(stats as any).promotions.map((promotion: any, index: number) => {
                  const promotionType = getPromotionTypeFromConditions(promotion.conditions);
                  
                  return (
                    <div 
                      key={promotion.id} 
                      className="border border-gray-200 rounded-lg p-4"
                      data-testid={`promotion-card-${promotion.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{promotion.name}</h3>
                            <div className="flex items-center gap-2">
                              {getPromotionTypeIcon(promotionType)}
                              <Badge variant={promotion.isActive ? "default" : "secondary"}>
                                {promotion.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">
                                {promotion.discountType === 'percentage' 
                                  ? `${promotion.discountValue}%` 
                                  : `$${promotion.discountValue}`}
                              </Badge>
                              {promotion.isExpired && (
                                <Badge variant="destructive">Expired</Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{promotion.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Usage:</span>
                              <span className="ml-1 font-medium">{promotion.currentUses || 0}/{promotion.maxUses}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rate:</span>
                              <span className="ml-1 font-medium">{promotion.usageRate}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Valid Until:</span>
                              <span className="ml-1 font-medium">
                                {new Date(promotion.validTo).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Days Left:</span>
                              <span className="ml-1 font-medium">
                                {promotion.daysRemaining > 0 ? promotion.daysRemaining : "Expired"}
                              </span>
                            </div>
                          </div>

                          {/* Conditions Display */}
                          {promotion.conditions && Object.keys(promotion.conditions).length > 0 && (
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <span className="text-xs font-medium text-gray-700">Conditions: </span>
                              {promotion.conditions.earlyBookingDays && (
                                <span className="text-xs text-gray-600">Book {promotion.conditions.earlyBookingDays} days early • </span>
                              )}
                              {promotion.conditions.minBookingAmount && (
                                <span className="text-xs text-gray-600">Min ${promotion.conditions.minBookingAmount} • </span>
                              )}
                              {promotion.conditions.minGuests && (
                                <span className="text-xs text-gray-600">Min {promotion.conditions.minGuests} guests • </span>
                              )}
                              {promotion.conditions.maxGuests && (
                                <span className="text-xs text-gray-600">Max {promotion.conditions.maxGuests} guests • </span>
                              )}
                              {promotion.conditions.requiredCouponCode && (
                                <span className="text-xs text-gray-600">Code: {promotion.conditions.requiredCouponCode}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {promotion.isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deactivatePromotionMutation.mutate(promotion.id)}
                              disabled={deactivatePromotionMutation.isPending}
                              data-testid={`button-deactivate-${promotion.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
                <p className="text-gray-600">Create your first promotional deal to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}