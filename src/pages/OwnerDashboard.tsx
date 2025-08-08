import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
};

const OwnerDashboard = () => {
  const form = useForm<HotelForm>({
    defaultValues: {
      name: "",
      description: "",
      price: 120,
      currency: "USD",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      checkIn: "14:00",
      checkOut: "11:00",
      amenities: Object.fromEntries(amenities.map((a) => [a, false])) as Record<string, boolean>,
    },
  });

  const onSubmit = (values: HotelForm) => {
    console.log("Hotel form (UI only)", values);
    toast({ title: "Hotel saved (UI only)", description: "No backend connected yet." });
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
          <h1 className="text-3xl font-semibold tracking-tight">Add Your Hotel</h1>
          <p className="text-muted-foreground mt-2">Provide details customers need to see. This is UI only.</p>
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
                  <CardDescription>Upload images (UI only)</CardDescription>
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
              <Button type="button" variant="secondary" onClick={() => form.reset()}>Reset</Button>
              <Button type="submit">Save hotel</Button>
            </div>
          </form>
        </Form>
      </main>
    </>
  );
};

export default OwnerDashboard;
