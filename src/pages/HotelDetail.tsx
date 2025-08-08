import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { BadgeCheck, Bed, Coffee, Dumbbell, Car, Wifi, Bath } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FloorPlan from "@/components/hotels/FloorPlan";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const IMAGES: Record<string, string> = {
  "grand-boulevard": hotel1,
  "alpine-lodge": hotel2,
  "cityscape-hotel": hotel3,
};

const HotelDetail = () => {
  const { id = "grand-boulevard" } = useParams();
  const image = IMAGES[id] ?? hotel1;

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
              <form className="space-y-3" onSubmit={(e)=>e.preventDefault()} aria-label="Booking form">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input id="checkin" type="date" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="checkout">Check-out</Label>
                    <Input id="checkout" type="date" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Input id="guests" type="number" min={1} defaultValue={2} />
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
