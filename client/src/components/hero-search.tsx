import { useState } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.departureDate || !formData.returnDate || !formData.guestCount) {
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
      guestCount: formData.guestCount,
      ...(formData.departurePort && { departurePort: formData.departurePort })
    });

    setLocation(`/search?${params.toString()}`);
  };

  return (
    <section className="relative ocean-gradient">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  data-testid="input-departure-date"
                />
              </div>
              
              <div>
                <Label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                  className="focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  data-testid="input-return-date"
                />
              </div>
              
              <div>
                <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </Label>
                <Select value={formData.guestCount} onValueChange={(value) => setFormData(prev => ({ ...prev, guestCount: value }))}>
                  <SelectTrigger data-testid="select-guests">
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">2 Adults, 1 Child</SelectItem>
                    <SelectItem value="4">2 Adults, 2 Children</SelectItem>
                    <SelectItem value="4adults">4 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                className="text-ocean-600 font-medium hover:text-ocean-700 transition-colors flex items-center"
                data-testid="button-advanced-filters"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-coral-500 text-white hover:bg-coral-600 transition-colors font-semibold"
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
