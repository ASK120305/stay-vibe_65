import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import useApi from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const amenities = [
  "Free Wi‑Fi",
  "Pool",
  "Gym",
  "Spa",
  "Breakfast",
  "Parking",
  "Airport Shuttle",
  "Pet Friendly",
  "Restaurant",
  "Bar",
  "Air Conditioning",
  "24/7 Reception",
];

type HotelForm = {
  name: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  amenities: Record<string, boolean>;
  photos?: FileList;
  policies?: string;
  authenticityCertificate?: FileList;
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { execute: saveHotel, loading: isSaving } = useApi<HotelForm>();
  const [draftData, setDraftData] = useLocalStorage<Partial<HotelForm>>("hotelDraft", {});
  
  const form = useForm<HotelForm>({
    defaultValues: {
      name: draftData.name || "",
      description: draftData.description || "",
      price: draftData.price || 120,
      currency: draftData.currency || "USD",
      address: draftData.address || "",
      city: draftData.city || "",
      state: draftData.state || "",
      country: draftData.country || "",
      postalCode: draftData.postalCode || "",
      checkIn: draftData.checkIn || "14:00",
      checkOut: draftData.checkOut || "11:00",
      amenities: draftData.amenities || Object.fromEntries(amenities.map((a) => [a, false])) as Record<string, boolean>,
    },
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "owner") {
      navigate("/auth");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Auto-save draft every 30 seconds
    const interval = setInterval(() => {
      const currentValues = form.getValues();
      setDraftData(currentValues);
    }, 30000);

    return () => clearInterval(interval);
  }, [form, setDraftData]);

  const onSubmit = async (values: HotelForm) => {
    try {
      await saveHotel(async () => {
        // Prepare hotel data for backend
        const hotelData = {
          name: values.name,
          description: values.description,
          address: {
            street: values.address,
            city: values.city,
            state: values.state,
            country: values.country,
            zipCode: values.postalCode
          },
          phone: values.phone || '',
          email: values.email || '',
          starRating: 3, // Default rating, can be updated later
          amenities: Object.entries(values.amenities)
            .filter(([_, checked]) => checked)
            .map(([amenity, _]) => amenity),
          policies: {
            checkIn: values.checkIn,
            checkOut: values.checkOut,
            cancellation: values.policies || 'Free cancellation up to 24 hours before check-in'
          },
          priceRange: {
            min: values.price,
            max: values.price
          }
        };

        // Create hotel
        const response = await fetch('/api/hotels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // For now, we'll create a simple mock token for testing
            'Authorization': `Bearer mock-token-for-testing`
          },
          body: JSON.stringify(hotelData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Hotel creation error:', errorData);
          throw new Error(errorData.message || 'Failed to create hotel');
        }

        const result = await response.json();
        const hotelId = result.data.hotel._id;

        // Upload authenticity certificate if provided
        if (values.authenticityCertificate && values.authenticityCertificate[0]) {
          const formData = new FormData();
          formData.append('certificate', values.authenticityCertificate[0]);

          const certResponse = await fetch(`/api/hotels/${hotelId}/authenticity-certificate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer mock-token-for-testing`
            },
            body: formData
          });

          if (!certResponse.ok) {
            console.warn('Failed to upload authenticity certificate');
          }
        }

        return result.data.hotel;
      });
      
      toast({ 
        title: "Hotel created successfully!", 
        description: "Your hotel is now visible to customers and ready for bookings." 
      });
      
      // Clear draft after successful save
      setDraftData({});
      form.reset();
    } catch (error) {
      console.error('Error creating hotel:', error);
      toast({ 
        title: "Error creating hotel", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  };

  const handleSaveDraft = () => {
    const currentValues = form.getValues();
    setDraftData(currentValues);
    toast({ 
      title: "Draft saved", 
      description: "Your progress has been saved locally." 
    });
  };

  return (
    <>
      <Helmet>
        <title>Add Hotel | Owner Portal | StayVibe</title>
        <meta name="description" content="Hotel owner portal to add your hotel details for customers to see." />
        <link rel="canonical" href="/owner" />
      </Helmet>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Add Your Hotel</h1>
              <p className="text-muted-foreground mt-2">Provide details customers need to see. Your hotel will be visible to customers after creation.</p>
            </div>
            {Object.keys(draftData).length > 0 && (
              <Badge variant="secondary">Draft saved</Badge>
            )}
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <section aria-labelledby="basic-info">
              <Card>
                <CardHeader>
                  <CardTitle id="basic-info">Basic information</CardTitle>
                  <CardDescription>Hotel name and description</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel name</FormLabel>
                        <FormControl>
                          <Input placeholder="StayVibe Downtown" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Modern hotel in the city center with ..." rows={5} required {...field} />
                        </FormControl>
                        <FormDescription>What makes your hotel special?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="location">
              <Card>
                <CardHeader>
                  <CardTitle id="location">Location & contact</CardTitle>
                  <CardDescription>Address shown to guests</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="postalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input placeholder="94105" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-555-5555" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@stayvibe.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="pricing">
              <Card>
                <CardHeader>
                  <CardTitle id="pricing">Pricing</CardTitle>
                  <CardDescription>Base nightly rate</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Price per night</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" placeholder="120" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="times">
              <Card>
                <CardHeader>
                  <CardTitle id="times">Check-in & Check-out</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="checkIn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in time</FormLabel>
                      <FormControl>
                        <Input type="time" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="checkOut" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out time</FormLabel>
                      <FormControl>
                        <Input type="time" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="amenities">
              <Card>
                <CardHeader>
                  <CardTitle id="amenities">Amenities</CardTitle>
                  <CardDescription>Select all that apply</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((a) => (
                      <FormField
                        key={a}
                        control={form.control}
                        name={`amenities.${a}` as const}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{a}</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="media">
              <Card>
                <CardHeader>
                  <CardTitle id="media">Photos</CardTitle>
                  <CardDescription>Upload images</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="photos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" multiple onChange={(e) => field.onChange(e.target.files)} />
                        </FormControl>
                        <FormDescription>Add at least 3 high-quality photos.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="certificate">
              <Card>
                <CardHeader>
                  <CardTitle id="certificate">Authenticity Certificate</CardTitle>
                  <CardDescription>Upload your hotel's authenticity certificate (required)</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="authenticityCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificate File</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => field.onChange(e.target.files)} 
                            required 
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a clear image or PDF of your hotel's authenticity certificate. 
                          This helps build trust with potential guests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="policies">
              <Card>
                <CardHeader>
                  <CardTitle id="policies">Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="policies" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policies</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Cancellation, house rules, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </section>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button type="button" variant="secondary" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Hotel"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </>
  );
};

export default OwnerDashboard;
