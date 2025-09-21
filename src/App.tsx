import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import HotelDetail from "./pages/HotelDetail";
import CheckIn from "./pages/CheckIn";
import Auth from "./pages/Auth";
import OwnerDashboard from "./pages/OwnerDashboard";
import BookingConfirmation from "./pages/BookingConfirmation";
import Payment from "./pages/Payment";
import BookingSuccess from "./pages/BookingSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <SearchProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SiteHeader />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/hotel/:id" element={<HotelDetail />} />
                <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/owner" element={
                  <ProtectedRoute requiredRole="owner">
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <SiteFooter />
            </BrowserRouter>
          </SearchProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
