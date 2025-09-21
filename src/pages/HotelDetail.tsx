import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BadgeCheck, Bed, Coffee, Dumbbell, Car, Wifi, Bath } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import FloorPlan from "@/components/hotels/FloorPlan";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const IMAGES: Record<string, string> = {
  "grand-boulevard": hotel1,
  "alpine-lodge": hotel2,
  "cityscape-hotel": hotel3,
};

const HOTEL_PRICES: Record<string, number> = {
  "grand-boulevard": 189,
  "alpine-lodge": 249,
  "cityscape-hotel": 209,
};

const HotelDetail = () => {
  const { id = "grand-boulevard" } = useParams();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  
  const image = IMAGES[id] ?? hotel1;
  const pricePerNight = HOTEL_PRICES[id] ?? 189;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      toast({
        title: "Missing dates",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      toast({
        title: "Invalid dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to booking confirmation
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
      price: pricePerNight.toString(),
    });
    
    navigate(`/booking-confirmation/${id}?${params.toString()}`);
  };

  return (
    <main>
      <Helmet>
        <title>Hotel Details | StayVibe</title>
        <meta name="description" content="View hotel images, amenities, and booking options. Preview rooms via interactive floor plan and book with StayVibe." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      {/* Hero image */}
      <section className="relative">
        <div className="relative h-[36vh] w-full overflow-hidden">
          <img src={image} alt="Hotel hero" className="h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </section>

      <section className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">{id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</h1>
        <p className="text-muted-foreground">Modern comfort and convenience for every traveler.</p>

        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {/* Amenities */}
          <article className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2"><Wifi /> Free Wi‑Fi</div>
                <div className="flex items-center gap-2"><Coffee /> Complimentary coffee</div>
                <div className="flex items-center gap-2"><Car /> Valet parking</div>
                <div className="flex items-center gap-2"><Dumbbell /> Fitness center</div>
                <div className="flex items-center gap-2"><Bath /> Spa & sauna</div>
                <div className="flex items-center gap-2"><Bed /> Premium bedding</div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Room Preview via Floor Plan</h2>
              <FloorPlan />
            </div>
          </article>

          {/* Booking */}
          <aside>
            <Card className="p-4 card-elevated">
              <div className="mb-4 flex items-center gap-2">
                <BadgeCheck className="text-primary" />
                <p className="text-sm text-muted-foreground">Secure booking • No hidden fees</p>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-bold">${pricePerNight}</p>
                <p className="text-sm text-muted-foreground">per night</p>
              </div>
              <form className="space-y-3" onSubmit={handleBooking} aria-label="Booking form">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input 
                      id="checkin" 
                      type="date" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="checkout">Check-out</Label>
                    <Input 
                      id="checkout" 
                      type="date" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Input 
                    id="guests" 
                    type="number" 
                    min={1} 
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full">Book Now</Button>
              </form>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default HotelDetail;
