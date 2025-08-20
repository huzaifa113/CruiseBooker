import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/language-provider";
import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout";
import Confirmation from "@/pages/confirmation";
import Reservations from "@/pages/reservations";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/booking/:cruiseId" component={Booking} />
      <Route path="/checkout/:bookingId" component={Checkout} />
      <Route path="/confirmation/:confirmationNumber" component={Confirmation} />
      <Route path="/reservations" component={Reservations} />
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
