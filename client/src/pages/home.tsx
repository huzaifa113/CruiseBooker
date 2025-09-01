import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { useDeals } from "@/lib/deals-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import HeroSearch from "@/components/hero-search";
import CruiseCard from "@/components/cruise-card";
import ItineraryModal from "@/components/itinerary-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Award, DollarSign, Headphones } from "lucide-react";
import type { Cruise } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const { setSelectedDeal } = useDeals();

  // Fetch featured cruises (limit to 6 for homepage)
  const { data: cruises, isLoading, error } = useQuery({
    queryKey: ["/api/cruises", "sortBy=rating&sortOrder=desc"],
    queryFn: async () => {
      const response = await fetch("/api/cruises?sortBy=rating&sortOrder=desc", {
        credentials: "include"
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cruises: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data.slice(-3); // Show last 3 cruises for featured section
    }
  });

  // Fetch active promotions/deals
  const { data: promotions, isLoading: promotionsLoading } = useQuery({
    queryKey: ["/api/promotions"],
    queryFn: async () => {
      const response = await fetch("/api/promotions", {
        credentials: "include"
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch promotions: ${response.status} ${errorText}`);
      }
      return response.json();
    }
  });

  const handleViewItinerary = (cruise: Cruise) => {
    setSelectedCruise(cruise);
    setIsItineraryModalOpen(true);
  };

  const handleSelectCruise = (cruise: Cruise) => {
    setLocation(`/booking/${cruise.id}`);
  };

  const handleBookCruise = (cruise: Cruise) => {
    setIsItineraryModalOpen(false);
    setLocation(`/booking/${cruise.id}`);
  };

  const handleDealClick = (promotion: any) => {
    // Store the selected promotion using the deals context
    setSelectedDeal({
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      selectedAt: new Date().toISOString(),
      conditions: promotion.conditions
    });
    
    // Navigate to search page to select a cruise for this deal
    setLocation('/search?promotion=' + encodeURIComponent(promotion.id));
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  const handleDestinationClick = (destination: string) => {
    // Navigate to search filtered by destination and scroll to top
    setLocation(`/search?destination=${encodeURIComponent(destination)}`);
    setTimeout(() => window.scrollTo(0, 0), 100);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section with Search */}
      <HeroSearch />



      {/* Featured Cruises Section */}
      <section className="py-16 bg-gradient-to-r from-blue-100 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Cruises
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked luxury cruise experiences at unbeatable prices
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Skeleton className="w-12 h-8 rounded mr-3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <i className="fas fa-exclamation-triangle text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Featured Cruises
              </h3>
              <p className="text-gray-600 mb-4">
                We're experiencing technical difficulties. Please try again later or use the search above to find cruises.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left max-w-md mx-auto">
                  <summary className="text-sm text-gray-500 cursor-pointer">Debug Error</summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                    {error.toString()}
                  </pre>
                </details>
              )}
            </div>
          )}

          {cruises && cruises.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-ship text-4xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Featured Cruises Available
              </h3>
              <p className="text-gray-600">
                Check back soon for our latest cruise offerings, or use the search above to explore available options.
              </p>
            </div>
          )}

          {cruises && cruises.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cruises.map((cruise: Cruise) => (
                <CruiseCard
                  key={cruise.id}
                  cruise={cruise}
                  onViewItinerary={handleViewItinerary}
                  onSelectCruise={handleSelectCruise}
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Special Deals Section - Dynamic from Promotions */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50" id="deals-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Special Deals & Offers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Limited time offers and exclusive deals for our cruise experiences
            </p>
          </div>

          {/* Loading state for promotions */}
          {promotionsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(3).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-20 rounded-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Dynamic promotions grid */}
          {!promotionsLoading && promotions && promotions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.slice(0, 6).map((promotion: any, index: number) => {
                const discountText = promotion.discountType === 'percentage' 
                  ? `${promotion.discountValue}% OFF`
                  : `$${promotion.discountValue} OFF`;
                
                const colorClasses = [
                  "bg-green-600", "bg-orange-600", "bg-blue-600", 
                  "bg-purple-600", "bg-red-600", "bg-indigo-600"
                ];
                const colorClass = colorClasses[index % colorClasses.length];

                return (
                  <Card 
                    key={promotion.id} 
                    className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" 
                    onClick={() => handleDealClick(promotion)}
                    data-testid={`deal-card-${promotion.id}`}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className={`absolute top-4 right-4 ${colorClass} text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap z-10`}>
                        {discountText}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16" data-testid={`deal-title-${promotion.id}`}>
                        {promotion.name}
                      </h3>
                      <p className="text-gray-600 mb-4 flex-1" data-testid={`deal-description-${promotion.id}`}>
                        {promotion.description}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        Valid until: {new Date(promotion.validTo).toLocaleDateString()}
                      </div>
                      {promotion.conditions?.minBookingAmount && (
                        <div className="text-xs text-gray-400 mb-4">
                          Minimum booking: ${promotion.conditions.minBookingAmount}
                        </div>
                      )}
                      <button 
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors group-hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDealClick(promotion);
                        }}
                        data-testid={`button-apply-deal-${promotion.id}`}
                      >
                        Select This Deal
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty state for promotions */}
          {!promotionsLoading && (!promotions || promotions.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <DollarSign className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Active Deals
              </h3>
              <p className="text-gray-600">
                Check back soon for exciting cruise deals and special offers!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Phoenix Vacation Group?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-ocean-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">25+ Years Experience</h3>
              <p className="text-gray-600">Trusted by thousands of travelers for luxury cruise experiences worldwide.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-ocean-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">We'll match any competitor's price and beat it by 5%.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-ocean-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Expert cruise consultants available around the clock to help you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm" id="destinations-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover breathtaking destinations across the world's most beautiful waters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Generate destination cards dynamically from cruise data */}
            {cruises && cruises.length > 0 && 
              // Get unique destinations with counts from actual cruise data
              Object.values(
                cruises.reduce((acc: any, cruise: Cruise) => {
                  const dest = cruise.destination;
                  if (!acc[dest]) {
                    acc[dest] = {
                      name: dest,
                      image: cruise.imageUrl,
                      description: `Experience the beauty of ${dest}`,
                      cruiseCount: 1,
                      cruises: [cruise]
                    };
                  } else {
                    acc[dest].cruiseCount += 1;
                    acc[dest].cruises.push(cruise);
                  }
                  return acc;
                }, {})
              ).slice(0, 4).map((destination: any) => (
              <Card key={destination.name} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleDestinationClick(destination.name)}>
                <div className="relative h-48">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.currentTarget;
                      // Try with different parameters first
                      if (!target.src.includes('auto=compress')) {
                        target.src = destination.image + '&auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
                      } else {
                        target.src = `data:image/svg+xml;base64,${btoa(`<svg width="800" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#4285f4"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle" dy=".3em">${destination.name}</text></svg>`)}`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.description}</p>
                    <p className="text-xs mt-1 text-blue-200">{destination.cruiseCount} cruise{destination.cruiseCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Read authentic reviews from thousands of satisfied customers who've sailed with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review 1 */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Our Mediterranean cruise was absolutely spectacular! The staff was incredibly attentive, 
                  the ship was immaculate, and every port was a new adventure. Phoenix Vacation Group made 
                  our dream vacation come true."
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Mediterranean Odyssey • July 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review 2 */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The Alaska cruise exceeded all expectations! Watching glaciers calve while enjoying 
                  world-class dining was unforgettable. The booking process was seamless and the customer 
                  service was outstanding."
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="Michael Chen" />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                    <p className="text-sm text-gray-500">Alaska Wilderness • September 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review 3 */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="w-5 h-5 text-gray-300" />
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Family vacation of a lifetime! The kids loved the activities, parents enjoyed the 
                  relaxation, and grandparents appreciated the accessibility. Great value for money 
                  and memories we'll treasure forever."
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" alt="Emily Rodriguez" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">Emily Rodriguez</h4>
                    <p className="text-sm text-gray-500">Caribbean Paradise • August 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review 4 */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "The Norwegian fjords were breathtaking! Every morning brought new stunning views. 
                  The ship was luxurious and the excursions were well-organized. Definitely booking 
                  our next cruise with Phoenix!"
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="David Thompson" />
                    <AvatarFallback>DT</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">David Thompson</h4>
                    <p className="text-sm text-gray-500">Norwegian Fjords • June 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review 5 */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "First time cruising and it won't be our last! Phoenix made everything so easy from 
                  booking to boarding. The staff went above and beyond to make our honeymoon special. 
                  Thank you for the perfect start to our marriage!"
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face" alt="Lisa Park" />
                    <AvatarFallback>LP</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lisa Park</h4>
                    <p className="text-sm text-gray-500">Mediterranean Romance • May 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review 6 */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Exceptional service from start to finish. The dining was incredible, 
                  entertainment was top-notch, and our suite was absolutely perfect. 
                  Phoenix Vacation Group delivers on their promise of luxury experiences."
                </p>
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" alt="Robert Wilson" />
                    <AvatarFallback>RW</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">Robert Wilson</h4>
                    <p className="text-sm text-gray-500">Caribbean Luxury • October 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Stats */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">4.8</div>
                <div className="flex items-center justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  ))}
                </div>
                <div className="text-blue-100">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15,000+</div>
                <div className="text-blue-100">Happy Travelers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">25+</div>
                <div className="text-blue-100">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Modal */}
      <ItineraryModal
        cruise={selectedCruise}
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        onBookCruise={handleBookCruise}
      />

      <Footer />
    </div>
  );
}
