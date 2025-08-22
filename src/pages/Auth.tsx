import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/use-toast";

const roles = ["customer", "owner"] as const;

type Role = typeof roles[number];

type AuthFormValues = {
  email: string;
  password: string;
  name?: string;
};

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading, isAuthenticated } = useAuth();
  const [role, setRole] = useState<Role>("customer");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  const formSignIn = useForm<AuthFormValues>({
    defaultValues: { email: "", password: "" },
  });
  const formSignUp = useForm<AuthFormValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmitSignIn = async (values: AuthFormValues) => {
    try {
      await login(values.email, values.password, role);
      toast({
        title: "Login successful!",
        description: `Welcome back, ${values.email.split("@")[0]}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmitSignUp = async (values: AuthFormValues) => {
    try {
      await signup(values.name || "", values.email, values.password, role);
      toast({
        title: "Account created!",
        description: `Welcome to StayVibe, ${values.name}!`,
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again with different credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login or Sign Up | StayVibe</title>
        <meta name="description" content="Sign in or create an account as customer or hotel owner on StayVibe." />
        <link rel="canonical" href="/auth" />
      </Helmet>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Login or Sign Up</h1>
          <p className="text-muted-foreground mt-2">Choose your role and continue.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to StayVibe</CardTitle>
            <CardDescription>Select role and authentication method (UI only)</CardDescription>
          </CardHeader>
          <CardContent>
            <section aria-labelledby="role-select" className="mb-6">
              <h2 id="role-select" className="sr-only">Select role</h2>
              <ToggleGroup type="single" value={role} onValueChange={(v) => v && setRole(v as Role)}>
                <ToggleGroupItem value="customer" aria-label="Customer">Customer</ToggleGroupItem>
                <ToggleGroupItem value="owner" aria-label="Hotel Owner">Hotel Owner</ToggleGroupItem>
              </ToggleGroup>
            </section>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form
                  onSubmit={formSignIn.handleSubmit(onSubmitSignIn)}
                  className="grid gap-4"
                >
                  <Form {...formSignIn}>
                    <FormField
                      control={formSignIn.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formSignIn.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-2" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Continue"}
                    </Button>
                  </Form>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form
                  onSubmit={formSignUp.handleSubmit(onSubmitSignUp)}
                  className="grid gap-4"
                >
                  <Form {...formSignUp}>
                    <FormField
                      control={formSignUp.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Alex Doe" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formSignUp.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formSignUp.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-2" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </Form>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Auth;
