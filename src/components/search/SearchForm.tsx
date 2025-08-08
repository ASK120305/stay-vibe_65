import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SearchForm = ({ compact = false }: { compact?: boolean }) => {
  const navigate = useNavigate();
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/search");
  };

  return (
    <form onSubmit={onSubmit} className={`w-full ${compact ? "grid grid-cols-2 md:grid-cols-5 gap-3" : "grid grid-cols-1 md:grid-cols-5 gap-4"}`} aria-label="Search hotels">
      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" placeholder="Where to?" aria-label="Location" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="checkin">Check-in</Label>
        <Input id="checkin" name="checkin" type="date" aria-label="Check-in date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout">Check-out</Label>
        <Input id="checkout" name="checkout" type="date" aria-label="Check-out date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="guests">Guests</Label>
        <Input id="guests" name="guests" type="number" min={1} defaultValue={2} aria-label="Number of guests" />
      </div>
      <div className="flex items-end">
        <Button type="submit" variant="hero" className="w-full">Search Rooms</Button>
      </div>
    </form>
  );
};

export default SearchForm;
