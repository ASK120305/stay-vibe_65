import { Helmet } from "react-helmet-async";
import SearchForm from "@/components/search/SearchForm";
import HotelCard, { Hotel } from "@/components/hotels/HotelCard";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const hotels: Hotel[] = [
  { id: "grand-boulevard", name: "Grand Boulevard", location: "Miami, FL", rating: 4.7, pricePerNight: 189, image: hotel1 },
  { id: "alpine-lodge", name: "Alpine Lodge", location: "Aspen, CO", rating: 4.8, pricePerNight: 249, image: hotel2 },
  { id: "cityscape-hotel", name: "Cityscape Hotel", location: "New York, NY", rating: 4.6, pricePerNight: 209, image: hotel3 },
];

const SearchResults = () => {
  return (
    <main className="container mx-auto py-10">
      <Helmet>
        <title>Search Hotels | StayVibe</title>
        <meta name="description" content="Search modern hotels by location, dates, and guests. Compare prices and amenities with StayVibe." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Find your perfect stay</h1>
      <div className="rounded-lg border p-4 mb-8">
        <SearchForm />
      </div>

      <section aria-label="Search results">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default SearchResults;
