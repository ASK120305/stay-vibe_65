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
import { useToast } from "@/components/ui/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import ChatWidget from "@/components/chat/ChatWidget";

const RealtimeClient = () => {
  const { toast } = useToast();
  useWebSocket({
    onMessage: (msg) => {
      switch (msg.type) {
        case "BOOKING_STATUS_UPDATE":
          toast({
            title: `Booking ${msg.newStatus}`,
            description: msg.message || `Booking ${msg.bookingId} status updated`,
          });
          break;
        case "PRICE_ALERT":
          toast({
            title: "Price alert",
            description: `Room ${msg.roomId} changed from ${msg.oldPrice} to ${msg.newPrice}`,
          });
          break;
        case "SUPPORT_MESSAGE":
          toast({ title: `Support: ${msg.sender}`, description: msg.content });
          break;
        default:
          break;
      }
    },
  });
  return null;
};

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
              <RealtimeClient />
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
              <ChatWidget />
            </BrowserRouter>
          </SearchProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
