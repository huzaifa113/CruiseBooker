import { Link, useLocation } from "wouter";
import { Ship, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer" data-testid="link-home">
                <div className="w-10 h-10 ocean-gradient rounded-lg flex items-center justify-center">
                  <Ship className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Phoenix Vacation Group</h1>
                  <p className="text-xs text-gray-500">Luxury Cruise Experiences</p>
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <a className={`${location === '/' ? 'text-ocean-700 font-medium border-b-2 border-ocean-700 pb-1' : 'text-gray-600 hover:text-ocean-700'} transition-colors`} data-testid="link-cruises">
                  Cruises
                </a>
              </Link>
              <a href="#" className="text-gray-600 hover:text-ocean-700 transition-colors" data-testid="link-destinations">Destinations</a>
              <a href="#" className="text-gray-600 hover:text-ocean-700 transition-colors" data-testid="link-deals">Deals</a>
              <Link href="/reservations">
                <a className={`${location === '/reservations' ? 'text-ocean-700 font-medium border-b-2 border-ocean-700 pb-1' : 'text-gray-600 hover:text-ocean-700'} transition-colors`} data-testid="link-reservations">
                  My Reservations
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-ocean-600" />
              <span>+66 2 123 4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-ocean-700" data-testid="button-lang-en">
                <Globe className="w-4 h-4 mr-1" />
                EN
              </Button>
              <span className="text-gray-300">|</span>
              <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-ocean-700" data-testid="button-lang-th">
                TH
              </Button>
            </div>
            <Button className="bg-ocean-600 text-white hover:bg-ocean-700 font-medium" data-testid="button-signin">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
