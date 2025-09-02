import { useState } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, Users, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { SearchFormData } from "@/lib/types";

export default function HeroSearch() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SearchFormData>({
    destination: "",
    departureDate: "",
    returnDate: "",
    guestCount: "",
    departurePort: ""
  });
  
  const [guestDetails, setGuestDetails] = useState({
    adults: 2,
    children: 0,
    seniors: 0
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const totalGuests = guestDetails.adults + guestDetails.children + guestDetails.seniors;
  
  const updateGuestCount = (type: 'adults' | 'children' | 'seniors', increment: boolean) => {
    setGuestDetails(prev => {
      const newValue = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1);
      if (type === 'adults' && newValue < 1) return prev; // At least 1 adult required
      return { ...prev, [type]: newValue };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.departureDate || !formData.returnDate || totalGuests === 0) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields to search for cruises.",
        variant: "destructive"
      });
      return;
    }

    const params = new URLSearchParams({
      destination: formData.destination,
      departureDate: formData.departureDate,
      returnDate: formData.returnDate,
      guestCount: totalGuests.toString(),
      adults: guestDetails.adults.toString(),
      children: guestDetails.children.toString(),
      seniors: guestDetails.seniors.toString(),
      ...(formData.departurePort && { departurePort: formData.departurePort })
    });

    setLocation(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=2070&h=1080&fit=crop&crop=center')"
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Discover Your Perfect Cruise
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore the world's most beautiful destinations aboard luxury cruise ships
          </p>
        </div>

        <Card className="p-6 md:p-8 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </Label>
                <Select value={formData.destination} onValueChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}>
                  <SelectTrigger data-testid="select-destination">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caribbean">Caribbean</SelectItem>
                    <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="Alaska">Alaska</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                    <SelectItem value="Northern Europe">Northern Europe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date
                </Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => {
                    const newDepartureDate = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      departureDate: newDepartureDate,
                      // Clear return date if it's before the new departure date
                      returnDate: prev.returnDate && prev.returnDate <= newDepartureDate ? "" : prev.returnDate
                    }));
                  }}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow
                  max={new Date(new Date().getFullYear() + 2, 11, 31).toISOString().split('T')[0]} // 2 years from now
                  className="focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  data-testid="input-departure-date"
                />
              </div>
              
              <div>
                <Label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date <span className="text-xs text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                  min={formData.departureDate ? 
                    new Date(new Date(formData.departureDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Day after departure or day after tomorrow
                  }
                  max={new Date(new Date().getFullYear() + 2, 11, 31).toISOString().split('T')[0]} // 2 years from now
                  className="focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  data-testid="input-return-date"
                />
              </div>
              
              <div>
                <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between text-left font-normal h-10 px-3 py-2"
                      data-testid="button-guests"
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>
                          {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
                          {guestDetails.children > 0 && ` (${guestDetails.children} Child${guestDetails.children > 1 ? 'ren' : ''})`}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Adults</span>
                          <p className="text-xs text-gray-500">Ages 18+</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuestCount('adults', false)}
                            disabled={guestDetails.adults <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{guestDetails.adults}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuestCount('adults', true)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Children</span>
                          <p className="text-xs text-gray-500">Ages 2-17</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuestCount('children', false)}
                            disabled={guestDetails.children <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{guestDetails.children}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuestCount('children', true)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Seniors</span>
                          <p className="text-xs text-gray-500">Ages 65+</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuestCount('seniors', false)}
                            disabled={guestDetails.seniors <= 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{guestDetails.seniors}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateGuestCount('seniors', true)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Sheet open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center"
                    data-testid="button-advanced-filters"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-96">
                  <SheetHeader>
                    <SheetTitle>Advanced Search Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label htmlFor="priceRange" className="text-sm font-medium">Price Range (USD)</Label>
                      <div className="mt-2 space-y-2">
                        <Input placeholder="Minimum price" type="number" />
                        <Input placeholder="Maximum price" type="number" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-5">3-5 days</SelectItem>
                          <SelectItem value="6-8">6-8 days</SelectItem>
                          <SelectItem value="9-14">9-14 days</SelectItem>
                          <SelectItem value="15+">15+ days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cruiseLine" className="text-sm font-medium">Cruise Line</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select cruise line" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="royal-caribbean">Royal Caribbean</SelectItem>
                          <SelectItem value="celebrity">Celebrity Cruises</SelectItem>
                          <SelectItem value="norwegian">Norwegian Cruise Line</SelectItem>
                          <SelectItem value="princess">Princess Cruises</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="departurePort" className="text-sm font-medium">Departure Port</Label>
                      <Input 
                        className="mt-2"
                        placeholder="e.g., Miami, Barcelona"
                        value={formData.departurePort}
                        onChange={(e) => setFormData(prev => ({ ...prev, departurePort: e.target.value }))}
                      />
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowAdvancedFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                data-testid="button-search-cruises"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Cruises
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
