import { Helmet } from "react-helmet-async";
import heroImage from "@/assets/hero-hotel.jpg";
import SearchForm from "@/components/search/SearchForm";
import { CheckCircle2, MapPin, CalendarDays, Users } from "lucide-react";

const Index = () => {
  return (
    <main>
      <Helmet>
        <title>Hotel Booking | StayVibe – Book Modern Stays</title>
        <meta name="description" content="Discover and book modern hotels with StayVibe. Search by location, dates, and guests. Explore amenities and room previews." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury hotel lobby with warm lighting" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/40 to-background" />
        </div>
        <div className="relative container mx-auto flex min-h-[72vh] flex-col items-center justify-center text-center gap-8">
          <h1 className="max-w-3xl text-4xl md:text-5xl font-bold leading-tight">
            Book Your Next Stay with Confidence
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Sleek, modern hotels curated for comfort. Search across top destinations and preview rooms before you book.
          </p>
          <div className="w-full max-w-4xl rounded-xl border bg-background/80 p-4 shadow-xl glass">
            <SearchForm compact />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle2 className="text-primary" />Free cancellation</div>
            <div className="flex items-center gap-2"><MapPin className="text-primary" />Top locations</div>
            <div className="flex items-center gap-2"><CalendarDays className="text-primary" />Flexible dates</div>
            <div className="flex items-center gap-2"><Users className="text-primary" />Group-friendly</div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container mx-auto py-16">
        <h2 className="text-2xl font-semibold mb-6">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          <div className="rounded-lg border p-5">
            <h3 className="font-semibold mb-2">1. Search</h3>
            <p className="text-muted-foreground">Enter your destination, dates, and guests to find the perfect stay.</p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-semibold mb-2">2. Preview</h3>
            <p className="text-muted-foreground">Use the unique floor plan to preview rooms before booking.</p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-semibold mb-2">3. Check-in</h3>
            <p className="text-muted-foreground">Enjoy a seamless digital check-in on arrival day.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
