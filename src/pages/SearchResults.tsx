import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";
import useDebounce from "@/hooks/useDebounce";
import SearchForm from "@/components/search/SearchForm";
import HotelCard, { Hotel } from "@/components/hotels/HotelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const hotels: Hotel[] = [
  { id: "grand-boulevard", name: "Grand Boulevard", location: "Miami, FL", rating: 4.7, pricePerNight: 189, image: hotel1 },
  { id: "alpine-lodge", name: "Alpine Lodge", location: "Aspen, CO", rating: 4.8, pricePerNight: 249, image: hotel2 },
  { id: "cityscape-hotel", name: "Cityscape Hotel", location: "New York, NY", rating: 4.6, pricePerNight: 209, image: hotel3 },
];

const SearchResults = () => {
  const { filters, isSearching, setIsSearching } = useSearch();
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      <section aria-label="Search results">
        {isLoading || isSearching ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-muted-foreground mb-4">
              Found {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </main>
  );
};

export default SearchResults;
