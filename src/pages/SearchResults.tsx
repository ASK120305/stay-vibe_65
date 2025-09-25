import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";
import useDebounce from "@/hooks/useDebounce";
import useApi from "@/hooks/useApi";
import SearchForm from "@/components/search/SearchForm";
import SearchFilters from "@/components/search/SearchFilters";
import HotelCard, { Hotel } from "@/components/hotels/HotelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

// Function to get default hotel image based on hotel name
const getDefaultHotelImage = (hotelName: string) => {
  const name = hotelName.toLowerCase();
  if (name.includes('fern')) return hotel1;
  if (name.includes('bhavna') || name.includes('bar')) return hotel2;
  if (name.includes('test')) return hotel3;
  return hotel1; // Default fallback
};

const SearchResults = () => {
  const { filters, isSearching, setIsSearching } = useSearch();
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedFilters = useDebounce(filters, 500);
  const { execute: searchHotelsApi } = useApi();

  useEffect(() => {
    const searchHotels = async () => {
      setIsLoading(true);
      setIsSearching(true);
      
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        console.log('Search filters:', debouncedFilters);
        
        if (debouncedFilters.location) {
          queryParams.append('city', debouncedFilters.location);
        }
        
        if (debouncedFilters.priceRange) {
          queryParams.append('minPrice', debouncedFilters.priceRange[0].toString());
          queryParams.append('maxPrice', debouncedFilters.priceRange[1].toString());
        }

        if (debouncedFilters.rating) {
          queryParams.append('minRating', debouncedFilters.rating.toString());
        }

        if (debouncedFilters.amenities.length > 0) {
          queryParams.append('amenities', debouncedFilters.amenities.join(','));
        }

        console.log('Query params:', queryParams.toString());

        // Call the backend API
        const response = await searchHotelsApi(async () => {
          const url = `/api/hotels?${queryParams.toString()}`;
          console.log('Fetching from URL:', url);
          
          const response = await fetch(url);
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Failed to fetch hotels: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API Response:', data);
          return data;
        });

        // Transform backend data to frontend format
        const hotels: Hotel[] = response.data.hotels.map((hotel: any) => ({
          id: hotel._id,
          name: hotel.name,
          location: `${hotel.address.city}, ${hotel.address.state || hotel.address.country}`,
          rating: hotel.averageRating || 0,
          pricePerNight: hotel.priceRange?.min || 0,
          image: hotel.images?.[0]?.url || getDefaultHotelImage(hotel.name),
          amenities: hotel.amenities || [],
          description: hotel.description,
          starRating: hotel.starRating,
          isVerified: hotel.isVerified || false
        }));

        setFilteredHotels(hotels);
      } catch (error) {
        console.error('Error searching hotels:', error);
        // Fallback to empty results on error
        setFilteredHotels([]);
        // Show error message to user
        toast({
          title: "Search Error",
          description: "Failed to load hotels. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    searchHotels();
  }, [debouncedFilters, setIsSearching, searchHotelsApi]);
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
