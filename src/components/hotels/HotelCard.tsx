import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export type Hotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  image: string;
};

const HotelCard = ({ hotel }: { hotel: Hotel }) => {
  return (
    <Card className="overflow-hidden group card-elevated hover:translate-y-[-2px] transition-transform">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image}
          alt={`${hotel.name} hotel exterior`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{hotel.name}</h3>
            <p className="text-sm text-muted-foreground">{hotel.location}</p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="text-primary" size={16} />
            <span className="font-medium">{hotel.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="text-base font-semibold">${hotel.pricePerNight}/night</p>
          </div>
          <Button asChild variant="secondary">
            <Link to={`/hotel/${hotel.id}`} aria-label={`View details for ${hotel.name}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelCard;
