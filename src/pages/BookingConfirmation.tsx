import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, MapPin, CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const IMAGES: Record<string, string> = {
  "grand-boulevard": hotel1,
  "alpine-lodge": hotel2,
  "cityscape-hotel": hotel3,
};

const HOTEL_NAMES: Record<string, string> = {
  "grand-boulevard": "Grand Boulevard",
  "alpine-lodge": "Alpine Lodge",
  "cityscape-hotel": "Cityscape Hotel",
};

const HOTEL_LOCATIONS: Record<string, string> = {
  "grand-boulevard": "Miami, FL",
  "alpine-lodge": "Aspen, CO",
  "cityscape-hotel": "New York, NY",
};

const BookingConfirmation = () => {
  const { id = "grand-boulevard" } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = parseInt(searchParams.get("guests") || "2");
  const pricePerNight = parseInt(searchParams.get("price") || "189");

  const image = IMAGES[id] ?? hotel1;
  const hotelName = HOTEL_NAMES[id] ?? "Grand Boulevard";
  const location = HOTEL_LOCATIONS[id] ?? "Miami, FL";

  // Calculate nights and total
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.12); // 12% tax
  const fees = 25; // Service fee
  const total = subtotal + taxes + fees;

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue with your booking.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate to payment page
    navigate(`/payment?hotelId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&total=${total}`);
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Booking Confirmation | StayVibe</title>
        <meta name="description" content="Confirm your hotel booking details and proceed to payment." />
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Confirm Your Booking</h1>
          <p className="text-muted-foreground">Review your booking details before proceeding to payment</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <img src={image} alt={hotelName} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <h2 className="text-xl">{hotelName}</h2>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {location}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">
                        {checkInDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">
                        {checkOutDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Guests</p>
                      <p className="text-sm text-muted-foreground">{guests} guests</p>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {nights} night{nights !== 1 ? 's' : ''}
                </Badge>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={user?.name?.split(' ')[0] || ''} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        defaultValue={user?.name?.split(' ')[1] || ''} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 123-4567" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Input 
                      id="specialRequests" 
                      placeholder="Early check-in, late check-out, etc." 
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Price Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>${pricePerNight} × {nights} nights</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & fees</span>
                    <span>${taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${fees}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <Button 
                  onClick={handleConfirmBooking}
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Proceed to Payment"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You won't be charged until you complete your booking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default BookingConfirmation;