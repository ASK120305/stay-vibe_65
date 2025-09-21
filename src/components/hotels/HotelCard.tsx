import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import useFavorites from "@/hooks/useFavorites";
import useWindowSize from "@/hooks/useWindowSize";

export type Hotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  image: string;
  amenities?: string[];
};

const HotelCard = ({ hotel }: { hotel: Hotel }) => {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const { width } = useWindowSize();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMobile = width ? width < 768 : false;

  useEffect(() => {
    // Preload image for better UX
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = hotel.image;
  }, [hotel.image]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: hotel.id,
      name: hotel.name,
      image: hotel.image,
      price: hotel.pricePerNight,
    });
  };
  return (
    <Card className="overflow-hidden group card-elevated hover:translate-y-[-2px] transition-transform">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <img
            src={hotel.image}
            alt={`${hotel.name} hotel exterior`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white/95 p-2 h-auto"
          onClick={handleFavoriteClick}
          disabled={isLoading}
          aria-label={isFavorite(hotel.id) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite(hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`} 
          />
        </Button>
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
