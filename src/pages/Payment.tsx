import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Shield, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const hotelId = searchParams.get("hotelId") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";
  const total = searchParams.get("total") || "0";

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Navigate to success page
    navigate(`/booking-success?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&total=${total}`);
    setIsProcessing(false);
  };

  return (
    <>
      <Helmet>
        <title>Payment | StayVibe</title>
        <meta name="description" content="Secure payment for your hotel booking." />
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment</h1>
          <p className="text-muted-foreground">Complete your booking with secure payment</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Secure Payment
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <Label className="text-base font-medium">Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Card Details */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input 
                          id="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input 
                            id="expiry" 
                            placeholder="MM/YY" 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            placeholder="123" 
                            required 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input 
                          id="cardName" 
                          placeholder="John Doe" 
                          required 
                        />
                      </div>
                    </div>
                  )}

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Billing Address</Label>
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input 
                        id="address" 
                        placeholder="123 Main Street" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          placeholder="New York" 
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input 
                          id="zipCode" 
                          placeholder="10001" 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Lock className="w-4 h-4 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay ${total}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>{new Date(checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>{new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span>{guests}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default Payment;