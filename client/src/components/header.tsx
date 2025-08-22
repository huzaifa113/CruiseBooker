import { Link, useLocation } from "wouter";
import { Ship, Phone, Globe, Menu, MapPin, Tag, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useLanguageContext } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguageContext();
  // Authentication removed - no user menu needed
  const user = null;
  const isAuthenticated = false;

  const handleDestinationsClick = () => {
    // Navigate to home page if not there, then scroll to destinations
    if (location !== '/') {
      window.location.href = '/#destinations-section';
    } else {
      const destinationsSection = document.getElementById('destinations-section');
      if (destinationsSection) {
        destinationsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDealsClick = () => {
    // Navigate to home page if not there, then scroll to deals
    if (location !== '/') {
      window.location.href = '/#deals-section';
    } else {
      const dealsSection = document.getElementById('deals-section');
      if (dealsSection) {
        dealsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer group" data-testid="link-home">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <Ship className="text-white text-sm md:text-xl" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Phoenix Vacation Group
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Luxury Cruise Experiences</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Phoenix
                </h1>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link href="/">
                <div className={`${location === '/' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-2' : 'text-gray-700 hover:text-blue-600'} transition-all duration-200 cursor-pointer h-10 flex items-center`} data-testid="link-cruises">
                  {t('cruises')}
                </div>
              </Link>
              <button
                onClick={handleDestinationsClick}
                className="text-gray-700 hover:text-blue-600 transition-all duration-200 flex items-center space-x-1 h-10"
                data-testid="link-destinations"
              >
                <MapPin className="w-4 h-4" />
                <span>{t('destinations')}</span>
              </button>
              <button
                onClick={handleDealsClick}
                className="text-gray-700 hover:text-blue-600 transition-all duration-200 flex items-center space-x-1 h-10"
                data-testid="link-deals"
              >
                <Tag className="w-4 h-4" />
                <span>{t('deals')}</span>
              </button>
              <Link href="/reservations">
                <div className={`${location === '/reservations' ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-2' : 'text-gray-700 hover:text-blue-600'} transition-all duration-200 cursor-pointer h-10 flex items-center`} data-testid="link-reservations">
                  {t('myReservations')}
                </div>
              </Link>
          </nav>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-1 md:space-x-3 lg:space-x-4">
            {/* Phone number - hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="font-medium">+66 2 123 4567</span>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage("EN")}
                className={`px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium transition-all ${
                  language === "EN"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                data-testid="button-lang-en"
              >
                <Globe className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                EN
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage("TH")}
                className={`px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium transition-all ${
                  language === "TH"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                data-testid="button-lang-th"
              >
                TH
              </Button>
            </div>
            
            {/* User Menu - hidden on small screens */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(user as any)?.profileImageUrl || ''} alt={(user as any)?.firstName || 'User'} />
                      <AvatarFallback>
                        {(user as any)?.firstName ? (user as any).firstName[0] : (user as any)?.email ? (user as any).email[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {(user as any)?.firstName && (user as any)?.lastName ? `${(user as any).firstName} ${(user as any).lastName}` : (user as any)?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(user as any)?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-reservations" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Reservations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="hidden md:flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold px-4 lg:px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all text-sm lg:text-base" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-signin"
              >
                {t('signIn')}
              </Button>
            )}
            
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  <Link href="/">
                    <div className="text-gray-700 hover:text-blue-600 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                      {t('cruises')}
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleDestinationsClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{t('destinations')}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDealsClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-2"
                  >
                    <Tag className="w-4 h-4" />
                    <span>{t('deals')}</span>
                  </button>
                  <Link href="/reservations">
                    <div className="text-gray-700 hover:text-blue-600 transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
                      {t('myReservations')}
                    </div>
                  </Link>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold">
                    {t('signIn')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
