import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Tag, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromotionsProps {
  bookingAmount: number;
  onPromotionApplied: (discount: number, appliedPromotions: any[]) => void;
  bookingData?: any;
}

export default function PromotionsSection({ bookingAmount, onPromotionApplied, bookingData }: PromotionsProps) {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([]);

  // Fetch active promotions
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['/api/promotions'],
    enabled: bookingAmount > 0
  });

  // Apply promotion mutation
  const applyPromotionMutation = useMutation({
    mutationFn: async (promotionIds: string[]) => {
      const response = await fetch('/api/promotions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingAmount,
          promotionIds,
          bookingData: bookingData || {}
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply promotion');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAppliedPromotions(data.appliedPromotions);
      onPromotionApplied(data.discountAmount, data.appliedPromotions);
      
      if (data.appliedPromotions.length > 0) {
        toast({
          title: "Promotion Applied!",
          description: `You saved $${data.discountAmount.toFixed(2)} with ${data.appliedPromotions.length} promotion(s)`,
        });
      } else {
        toast({
          title: "No Eligible Promotions",
          description: "The selected promotions are not applicable to this booking",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Promotion Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleApplyPromotion = (promotionId: string) => {
    applyPromotionMutation.mutate([promotionId]);
  };

  const handleApplyPromoCode = () => {
    const promotion = (promotions as any[]).find((p: any) => 
      p.name.toLowerCase().includes(promoCode.toLowerCase()) ||
      p.id.toLowerCase() === promoCode.toLowerCase()
    );
    
    if (promotion) {
      handleApplyPromotion(promotion.id);
      setPromoCode('');
    } else {
      toast({
        title: "Invalid Promo Code",
        description: "The promo code you entered is not valid or has expired",
        variant: "destructive"
      });
    }
  };

  const isPromotionEligible = (promotion: any) => {
    if (!promotion.conditions) return true;
    
    const conditions = promotion.conditions;
    
    // Check minimum booking amount
    if (conditions.minBookingAmount && bookingAmount < conditions.minBookingAmount) {
      return false;
    }
    
    // Check cruise lines
    if (conditions.cruiseLines && bookingData?.cruiseLine && 
        !conditions.cruiseLines.includes(bookingData.cruiseLine)) {
      return false;
    }
    
    // Check destinations
    if (conditions.destinations && bookingData?.destination && 
        !conditions.destinations.includes(bookingData.destination)) {
      return false;
    }
    
    return true;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Loading Promotions...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const eligiblePromotions = (promotions as any[]).filter(isPromotionEligible);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Promotions & Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promo Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Have a promo code?</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              data-testid="input-promo-code"
            />
            <Button 
              onClick={handleApplyPromoCode}
              disabled={!promoCode.trim() || applyPromotionMutation.isPending}
              data-testid="button-apply-promo"
            >
              Apply
            </Button>
          </div>
        </div>

        <Separator />

        {/* Available Promotions */}
        <div className="space-y-3">
          <h4 className="font-medium">Available Deals</h4>
          {eligiblePromotions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No promotions available for this booking
            </p>
          ) : (
            eligiblePromotions.map((promotion: any) => {
              const isApplied = appliedPromotions.some(p => p.id === promotion.id);
              
              return (
                <div key={promotion.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{promotion.name}</span>
                      {promotion.discountType === 'percentage' ? (
                        <Badge variant="secondary">{promotion.discountValue}% OFF</Badge>
                      ) : (
                        <Badge variant="secondary">${promotion.discountValue} OFF</Badge>
                      )}
                    </div>
                    {isApplied ? (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleApplyPromotion(promotion.id)}
                        disabled={applyPromotionMutation.isPending}
                        data-testid={`button-apply-${promotion.id}`}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {promotion.description}
                  </p>
                  
                  {/* Promotion conditions */}
                  {promotion.conditions && (
                    <div className="text-xs text-muted-foreground">
                      {promotion.conditions.minBookingAmount && (
                        <div>• Minimum booking: ${promotion.conditions.minBookingAmount}</div>
                      )}
                      {promotion.conditions.cruiseLines && (
                        <div>• Valid for: {promotion.conditions.cruiseLines.join(', ')}</div>
                      )}
                      {promotion.conditions.destinations && (
                        <div>• Destinations: {promotion.conditions.destinations.join(', ')}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Applied Promotions Summary */}
        {appliedPromotions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Applied Promotions</h4>
              {appliedPromotions.map((promotion: any) => (
                <div key={promotion.id} className="flex justify-between text-sm">
                  <span>{promotion.name}</span>
                  <span className="text-green-600">
                    {promotion.discountType === 'percentage' 
                      ? `-${promotion.discountValue}%`
                      : `-$${promotion.discountValue}`
                    }
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}