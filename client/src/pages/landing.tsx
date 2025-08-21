import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Ship, Anchor, MapPin } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Perfect
              <span className="text-blue-600"> Cruise Adventure</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience luxury cruising at unbeatable prices. From Caribbean paradise to Mediterranean culture, 
              your dream vacation awaits.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-sign-in"
              >
                <Ship className="w-5 h-5 mr-2" />
                Sign In to Book Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-gray-300"
                onClick={() => document.getElementById('destinations-section')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-explore"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Explore Destinations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-white/80 backdrop-blur-sm" id="destinations-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Cruise Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the world's most beautiful destinations with our carefully curated cruise experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Caribbean",
                image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
                description: "Tropical paradise with crystal clear waters"
              },
              {
                name: "Mediterranean",
                image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
                description: "Rich history and stunning coastal cities"
              },
              {
                name: "Norwegian Fjords",
                image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
                description: "Breathtaking natural beauty and wilderness"
              },
              {
                name: "Alaska",
                image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop",
                description: "Glaciers, wildlife, and pristine landscapes"
              }
            ].map((destination) => (
              <Card key={destination.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-r from-blue-100 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Phoenix Vacation Group?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">25+ Years Experience</h3>
              <p className="text-gray-600">
                Trusted by thousands of travelers for luxury cruise experiences worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Anchor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Price Guarantee</h3>
              <p className="text-gray-600">
                We'll match any competitor's price and beat it by 5%.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ship className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Expert cruise consultants available around the clock to help you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Set Sail?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied travelers and book your dream cruise today.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            <Ship className="w-5 h-5 mr-2" />
            Get Started Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}