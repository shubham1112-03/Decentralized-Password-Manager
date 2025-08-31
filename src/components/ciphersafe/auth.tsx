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
import { hashPassword, verifyPassword } from "@/ai/flows/crypto-flow";

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

// In a real app, this would come from a database.
// We'll simulate it here with a component-level state that persists across re-renders.
let simulatedUser = {
    email: "user@example.com",
    // This is the Argon2 hash for "password123"
    hashedPassword: "$argon2id$v=19$m=65536,t=3,p=4$iR1EnUq+2b4B92gCjggVng$h/CI6C0iXA4uIqQUQd8A23JkCp8dM9sP5u5U8zO7P14"
};
let simulatedUserHasMasterPassword = false;
let simulatedMasterPasswordHash = "";


export default function Auth() {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [rawMasterPassword, setRawMasterPassword] = useState<string>("");
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


  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    // Simulate checking if user exists
    if (values.email !== simulatedUser.email) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "No user found with that email address."
        });
        setIsLoading(false);
        return;
    }

    try {
        const { isVerified } = await verifyPassword({ 
            hashedPassword: simulatedUser.hashedPassword,
            password: values.password 
        });

        if (!isVerified) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "The password you entered is incorrect."
            });
            setIsLoading(false);
            return;
        }

        // Password is correct, proceed
        if (simulatedUserHasMasterPassword) {
            setAuthState("unlock");
            toast({ title: "Logged In", description: "Welcome back! Please unlock your vault." });
        } else {
            setAuthState("createMasterPassword");
            toast({ title: "Logged In", description: "Welcome! Please create a master password for your new vault." });
        }
    } catch (e: any) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred during login. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignup = (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
        setAuthState("createMasterPassword");
        toast({ title: "Account Created", description: "Please create your master password." });
        setIsLoading(false);
    }, 1000);
  };

  const handleSetMasterPassword = async (values: z.infer<typeof masterPasswordSchema>) => {
    setIsLoading(true);
    try {
        const { hashedPassword } = await hashPassword({ password: values.masterPassword });
        // Persist the hash in our simulation
        simulatedMasterPasswordHash = hashedPassword;
        simulatedUserHasMasterPassword = true;
        
        setRawMasterPassword(values.masterPassword); // Store the raw password for the session
        setAuthState("unlock");
        toast({ title: "Master Password Set!", description: "It has been securely hashed. You can now unlock your vault." });
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not hash master password. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleUnlock = (verifiedMasterPassword: string) => {
    setRawMasterPassword(verifiedMasterPassword);
    setAuthState("dashboard");
  }
  const handleLock = () => {
    setRawMasterPassword(""); 
    setAuthState("unlock");
  }


  if (authState === "dashboard") {
    return <PasswordDashboard onLock={handleLock} masterPassword={rawMasterPassword} />;
  }
  
  if (authState === "unlock") {
    return <UnlockForm onUnlock={handleUnlock} masterPasswordHash={simulatedMasterPasswordHash} />;
  }

  if (authState === "createMasterPassword") {
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle>Create Master Password</CardTitle>
                <CardDescription>This password will be used to encrypt and decrypt your vault. Choose a strong, unique password and do not forget it. It will be securely hashed with Argon2.</CardDescription>
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
            <CardDescription>Login with user@example.com and password "password123". Or create a new account.</CardDescription>
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
    