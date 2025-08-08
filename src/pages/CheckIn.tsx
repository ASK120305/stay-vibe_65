import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CheckIn = () => {
  const { toast } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Check-in started", description: "We've received your details. You'll receive a confirmation shortly." });
  };

  return (
    <main className="container mx-auto py-10">
      <Helmet>
        <title>Digital Check-in | StayVibe</title>
        <meta name="description" content="Start your digital hotel check-in. Enter reservation details and upload ID securely with StayVibe." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Digital Check-in</h1>
      <p className="text-muted-foreground mb-6">Speed up your arrival by completing your check-in ahead of time.</p>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form className="grid gap-4" onSubmit={handleSubmit} aria-label="Digital check-in form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Reservation code</Label>
                <Input id="code" placeholder="e.g. SVB1234" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastname">Last name</Label>
                <Input id="lastname" placeholder="Your last name" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="arrival">Arrival date</Label>
                <Input id="arrival" type="date" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="id">Upload government ID</Label>
              <Input id="id" type="file" accept="image/*,.pdf" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Your information is encrypted and secured.</p>
              <Button type="submit" variant="hero">Start Check‑in</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default CheckIn;
