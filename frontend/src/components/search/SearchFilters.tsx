import { useState, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";

const amenitiesList = [
  "Free Wi-Fi",
  "Swimming Pool",
  "Fitness Center",
  "Spa & Wellness",
  "Restaurant",
  "Room Service",
  "Parking",
  "Pet Friendly",
  "Business Center",
  "Airport Shuttle"
];

const SearchFilters = () => {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const [localAmenities, setLocalAmenities] = useState(filters.amenities);
  const [localRating, setLocalRating] = useState(filters.rating);

  // Sync local state with context state
  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
    setLocalAmenities(filters.amenities);
    setLocalRating(filters.rating);
  }, [filters.priceRange, filters.amenities, filters.rating]);

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
    updateFilters({ priceRange: [value[0], value[1]] });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    let newAmenities;
    if (checked) {
      newAmenities = [...localAmenities, amenity];
    } else {
      newAmenities = localAmenities.filter(a => a !== amenity);
    }
    setLocalAmenities(newAmenities);
    updateFilters({ amenities: newAmenities });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = localRating === rating ? null : rating;
    setLocalRating(newRating);
    updateFilters({ rating: newRating });
  };

  const removeAmenity = (amenity: string) => {
    const newAmenities = localAmenities.filter(a => a !== amenity);
    setLocalAmenities(newAmenities);
    updateFilters({ amenities: newAmenities });
  };

  const clearAllFilters = () => {
    setLocalPriceRange([0, 500]);
    setLocalAmenities([]);
    setLocalRating(null);
    resetFilters();
  };

  const hasActiveFilters = localAmenities.length > 0 || localRating !== null || 
    (localPriceRange[0] !== 0 || localPriceRange[1] !== 500);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-base font-medium">Price per night</Label>
          <div className="mt-4 mb-2">
            <Slider
              value={localPriceRange}
              onValueChange={handlePriceChange}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${localPriceRange[0]}</span>
            <span>${localPriceRange[1]}+</span>
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <Label className="text-base font-medium">Minimum Rating</Label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={localRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleRatingChange(rating)}
                className="flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                {rating}+
              </Button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <Label className="text-base font-medium">Amenities</Label>
          <div className="mt-3 space-y-3">
            {amenitiesList.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={localAmenities.includes(amenity)}
                  onCheckedChange={(checked) => 
                    handleAmenityChange(amenity, checked as boolean)
                  }
                />
                <Label htmlFor={amenity} className="text-sm font-normal">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(localAmenities.length > 0 || localRating !== null) && (
          <div>
            <Label className="text-base font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {localRating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {localRating}+ stars
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleRatingChange(localRating)}
                  />
                </Badge>
              )}
              {localAmenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;