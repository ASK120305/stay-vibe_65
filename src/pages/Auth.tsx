import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
  const [role, setRole] = useState<Role>("customer");
  const formSignIn = useForm<AuthFormValues>({
    defaultValues: { email: "", password: "" },
  });
  const formSignUp = useForm<AuthFormValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (values: AuthFormValues, mode: "signin" | "signup") => {
    console.log(mode, role, values);
    toast({
      title: mode === "signin" ? "Signed in (UI only)" : "Account created (UI only)",
      description: `Role: ${role}. No backend connected.`,
    });
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
                  onSubmit={formSignIn.handleSubmit((v) => onSubmit(v, "signin"))}
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
                    <Button type="submit" className="mt-2">Continue</Button>
                  </Form>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form
                  onSubmit={formSignUp.handleSubmit((v) => onSubmit(v, "signup"))}
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
                    <Button type="submit" className="mt-2">Create account</Button>
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
