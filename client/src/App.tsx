import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/components/language-provider';
import { DealsProvider } from '@/lib/deals-context';
import { useEffect } from 'react';
import Home from '@/pages/home';
import SearchResults from '@/pages/search-results';
import Booking from '@/pages/booking';
import CheckoutWorking from '@/pages/checkout-working';
import CheckoutSimple from '@/pages/checkout-simple';
import Confirmation from '@/pages/confirmation';
import ConfirmationSuccess from '@/pages/confirmation-success';
import Reservations from '@/pages/reservations';
import MyReservations from '@/pages/my-reservations-fixed';
import Favorites from '@/pages/favorites';
import AdminSimple from '@/pages/admin-simple';
import NotFound from '@/pages/not-found';

// Component to handle scrolling to top on route changes
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* All routes available to all users - no authentication required */}
        <Route path="/" component={Home} />
        <Route path="/search" component={SearchResults} />
        <Route path="/booking/:cruiseId" component={Booking} />
        <Route path="/checkout/:bookingId" component={CheckoutWorking} />
        <Route path="/checkout" component={CheckoutWorking} />
        <Route path="/checkout-simple/:bookingId" component={CheckoutSimple} />
        <Route path="/confirmation/:confirmationNumber" component={Confirmation} />
        <Route path="/confirmation-success/:bookingId" component={ConfirmationSuccess} />
        <Route path="/reservations" component={Reservations} />
        <Route path="/my-reservations" component={MyReservations} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/admin" component={AdminSimple} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <DealsProvider>
            <Toaster />
            <Router />
          </DealsProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
