"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnlockForm from "./unlock-form";
import PasswordDashboard from "./password-dashboard";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const masterPasswordSchema = z.object({
    masterPassword: z.string().min(12, "Master password must be at least 12 characters."),
    confirmMasterPassword: z.string()
}).refine(data => data.masterPassword === data.confirmMasterPassword, {
    message: "Passwords do not match.",
    path: ["confirmMasterPassword"],
});

type AuthState = "login" | "createMasterPassword" | "unlock" | "dashboard";

export default function Auth() {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const masterPasswordForm = useForm<z.infer<typeof masterPasswordSchema>>({
    resolver: zodResolver(masterPasswordSchema),
    defaultValues: { masterPassword: "", confirmMasterPassword: "" },
  });


  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
        // This is a simulation. In a real app, you'd check if the user has a master password stored.
        // We'll simulate that existing users need to unlock, new users need to create a master password.
        if (values.email.includes("new")) {
             setAuthState("createMasterPassword");
        } else {
            setAuthState("unlock");
        }
        toast({ title: "Logged In", description: "Welcome back!" });
        setIsLoading(false);
    }, 1000);
  };

  const handleSignup = (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
        setAuthState("createMasterPassword");
        toast({ title: "Account Created", description: "Please create your master password." });
        setIsLoading(false);
    }, 1000);
  };

  const handleSetMasterPassword = (values: z.infer<typeof masterPasswordSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
        setAuthState("unlock");
        toast({ title: "Master Password Set!", description: "You can now unlock your vault." });
        setIsLoading(false);
    }, 1000);
  };
  
  const handleUnlock = () => setAuthState("dashboard");
  const handleLock = () => setAuthState("unlock");


  if (authState === "dashboard") {
    return <PasswordDashboard onLock={handleLock} />;
  }
  
  if (authState === "unlock") {
    return <UnlockForm onUnlock={handleUnlock} />;
  }

  if (authState === "createMasterPassword") {
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle>Create Master Password</CardTitle>
                <CardDescription>This password will be used to encrypt and decrypt your vault. Choose a strong, unique password and do not forget it.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...masterPasswordForm}>
                    <form onSubmit={masterPasswordForm.handleSubmit(handleSetMasterPassword)} className="space-y-4">
                        <FormField
                            control={masterPasswordForm.control}
                            name="masterPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Master Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={masterPasswordForm.control}
                            name="confirmMasterPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Master Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Set Master Password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-md">
        <CardHeader>
             <CardTitle>Authentication</CardTitle>
            <CardDescription>Login or create an account to access your vault.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 pt-4">
                            <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="user@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="signup">
                     <Form {...signupForm}>
                        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 pt-4">
                            <FormField
                                control={signupForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="new-user@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={signupForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={signupForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
