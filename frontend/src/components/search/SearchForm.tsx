import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SearchForm = ({ compact = false }: { compact?: boolean }) => {
  const navigate = useNavigate();
  const { filters, updateFilters, addToHistory, setIsSearching } = useSearch();
  const [localLocation, setLocalLocation] = useState(filters.location);
  const debouncedLocation = useDebounce(localLocation, 300);

  useEffect(() => {
    updateFilters({ location: debouncedLocation });
  }, [debouncedLocation, updateFilters]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const searchData = {
      location: formData.get("location") as string,
      checkIn: formData.get("checkin") as string,
      checkOut: formData.get("checkout") as string,
      guests: parseInt(formData.get("guests") as string) || 2,
      priceRange: filters.priceRange,
      amenities: filters.amenities,
      rating: filters.rating,
    };
    
    updateFilters(searchData);
    addToHistory(searchData);
    setIsSearching(true);
    navigate("/search");
  };

  return (
    <form onSubmit={onSubmit} className={`w-full ${compact ? "grid grid-cols-2 md:grid-cols-5 gap-3" : "grid grid-cols-1 md:grid-cols-5 gap-4"}`} aria-label="Search hotels">
      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          name="location" 
          placeholder="Where to?" 
          aria-label="Location"
          value={localLocation}
          onChange={(e) => setLocalLocation(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="checkin">Check-in</Label>
        <Input 
          id="checkin" 
          name="checkin" 
          type="date" 
          aria-label="Check-in date"
          defaultValue={filters.checkIn}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout">Check-out</Label>
        <Input 
          id="checkout" 
          name="checkout" 
          type="date" 
          aria-label="Check-out date"
          defaultValue={filters.checkOut}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="guests">Guests</Label>
        <Input 
          id="guests" 
          name="guests" 
          type="number" 
          min={1} 
          defaultValue={filters.guests} 
          aria-label="Number of guests" 
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" variant="hero" className="w-full">Search Rooms</Button>
      </div>
    </form>
  );
};

export default SearchForm;
