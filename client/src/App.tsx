import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import SearchResults from "@/pages/search-results";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout-redesigned";
import Confirmation from "@/pages/confirmation";
import ConfirmationSuccess from "@/pages/confirmation-success";
import Reservations from "@/pages/reservations";
import MyReservations from "@/pages/my-reservations-fixed";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/search" component={SearchResults} />
          <Route path="/booking/:cruiseId" component={Booking} />
          <Route path="/checkout/:bookingId" component={Checkout} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/reservations" component={Reservations} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={SearchResults} />
          <Route path="/booking/:cruiseId" component={Booking} />
          <Route path="/checkout/:bookingId" component={Checkout} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/confirmation/:confirmationNumber" component={Confirmation} />
          <Route path="/confirmation-success/:bookingId" component={ConfirmationSuccess} />
          <Route path="/reservations" component={Reservations} />
          <Route path="/my-reservations" component={MyReservations} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
