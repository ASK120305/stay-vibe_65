import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Users, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import hotel1 from "@/assets/hotel-1.jpg";
import hotel2 from "@/assets/hotel-2.jpg";
import hotel3 from "@/assets/hotel-3.jpg";

const IMAGES: Record<string, string> = {
  "grand-boulevard": hotel1,
  "alpine-lodge": hotel2,
  "cityscape-hotel": hotel3,
};

const HOTEL_NAMES: Record<string, string> = {
  "grand-boulevard": "Grand Boulevard",
  "alpine-lodge": "Alpine Lodge",
  "cityscape-hotel": "Cityscape Hotel",
};

const HOTEL_LOCATIONS: Record<string, string> = {
  "grand-boulevard": "Miami, FL",
  "alpine-lodge": "Aspen, CO",
  "cityscape-hotel": "New York, NY",
};

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hotelId = searchParams.get("hotelId") || "grand-boulevard";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";
  const total = searchParams.get("total") || "0";

  const image = IMAGES[hotelId] ?? hotel1;
  const hotelName = HOTEL_NAMES[hotelId] ?? "Grand Boulevard";
  const location = HOTEL_LOCATIONS[hotelId] ?? "Miami, FL";

  // Generate booking reference
  const bookingRef = `SV${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

  useEffect(() => {
    // Show success toast
    toast({
      title: "Booking Confirmed!",
      description: `Your room has been successfully booked. Confirmation sent to your email.`,
    });
  }, []);

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));

  return (
    <>
      <Helmet>
        <title>Booking Confirmed | StayVibe</title>
        <meta name="description" content="Your hotel booking has been confirmed successfully." />
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Your room has been successfully booked
          </p>
          <Badge variant="secondary" className="mt-2">
            Booking Reference: {bookingRef}
          </Badge>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <img src={image} alt={hotelName} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h2 className="text-xl">{hotelName}</h2>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Check-in</p>
                  <p className="text-sm text-muted-foreground">
                    {checkInDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Check-out</p>
                  <p className="text-sm text-muted-foreground">
                    {checkOutDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Guests</p>
                  <p className="text-sm text-muted-foreground">{guests} guests</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Total Paid</p>
                  <p className="text-sm font-semibold text-green-600">${total}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Confirmation Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                A confirmation email with your booking details and check-in instructions 
                has been sent to your email address.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check your spam folder if you don't see it in your inbox.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about your booking or need to make changes, 
                our support team is here to help.
              </p>
              <p className="text-sm font-medium">
                Support: +1 (555) 123-4567
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/search">
              Book Another Stay
            </Link>
          </Button>
        </div>

        {/* Important Information */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Important Information:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check-in time: 3:00 PM</li>
              <li>• Check-out time: 11:00 AM</li>
              <li>• Please bring a valid ID for check-in</li>
              <li>• Free cancellation up to 24 hours before check-in</li>
              <li>• Contact the hotel directly for special requests</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default BookingSuccess;