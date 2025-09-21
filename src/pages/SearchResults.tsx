import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";
import useDebounce from "@/hooks/useDebounce";
import SearchForm from "@/components/search/SearchForm";
import SearchFilters from "@/components/search/SearchFilters";
import HotelCard, { Hotel } from "@/components/hotels/HotelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const hotels: Hotel[] = [
  { id: "grand-boulevard", name: "Grand Boulevard", location: "Miami, FL", rating: 4.7, pricePerNight: 189, image: hotel1, amenities: ["Free Wi-Fi", "Swimming Pool", "Fitness Center", "Restaurant"] },
  { id: "alpine-lodge", name: "Alpine Lodge", location: "Aspen, CO", rating: 4.8, pricePerNight: 249, image: hotel2, amenities: ["Free Wi-Fi", "Spa & Wellness", "Restaurant", "Parking"] },
  { id: "cityscape-hotel", name: "Cityscape Hotel", location: "New York, NY", rating: 4.6, pricePerNight: 209, image: hotel3, amenities: ["Free Wi-Fi", "Business Center", "Room Service", "Fitness Center"] },
];

const SearchResults = () => {
  const { filters, isSearching, setIsSearching } = useSearch();
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    const searchHotels = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter hotels based on search criteria
      let results = hotels;
      
      if (debouncedFilters.location) {
        results = results.filter(hotel => 
          hotel.location.toLowerCase().includes(debouncedFilters.location.toLowerCase())
        );
      }
      
      if (debouncedFilters.priceRange) {
        results = results.filter(hotel => 
          hotel.pricePerNight >= debouncedFilters.priceRange[0] && 
          hotel.pricePerNight <= debouncedFilters.priceRange[1]
        );
      }

      if (debouncedFilters.rating) {
        results = results.filter(hotel => hotel.rating >= debouncedFilters.rating!);
      }

      if (debouncedFilters.amenities.length > 0) {
        results = results.filter(hotel => 
          debouncedFilters.amenities.every(amenity => 
            hotel.amenities?.includes(amenity)
          )
        );
      }
      
      setFilteredHotels(results);
      setIsLoading(false);
      setIsSearching(false);
    };

    searchHotels();
  }, [debouncedFilters, setIsSearching]);
  return (
    <main className="container mx-auto py-10">
      <Helmet>
        <title>Search Hotels | StayVibe</title>
        <meta name="description" content="Search modern hotels by location, dates, and guests. Compare prices and amenities with StayVibe." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Find your perfect stay</h1>
        {filters.location && (
          <Badge variant="secondary">
            Searching in: {filters.location}
          </Badge>
        )}
      </div>
      
      <div className="rounded-lg border p-4 mb-8">
        <SearchForm />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <SearchFilters />
        </aside>

        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Mobile Filters Dropdown */}
        {showFilters && (
          <div className="lg:hidden mb-6">
            <SearchFilters />
          </div>
        )}

        {/* Results */}
        <section className="flex-1" aria-label="Search results">
          {isLoading || isSearching ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredHotels.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Found {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''}
                </p>
                <div className="lg:hidden">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredHotels.map((h) => (
                  <HotelCard key={h.id} hotel={h} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No hotels found</h2>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or explore different locations.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SearchResults;
