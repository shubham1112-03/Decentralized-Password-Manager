"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnlockForm from "./unlock-form";
import PasswordDashboard from "./password-dashboard";
import { useToast } from "@/hooks/use-toast";
import { hashPassword } from "@/ai/flows/crypto-flow";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";


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

// Helper function to check if Supabase is configured
const isSupabaseConfigured = () => {
    // This function checks if the Supabase client is configured with placeholder values.
    // It's a client-side safe way to check for configuration.
    const supabaseUrl = supabase.realtime.channel('any').conn?.channel.conn.ws.url;
    return supabaseUrl && !supabaseUrl.includes("YOUR_SUPABASE_URL");
}

export default function Auth() {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [rawMasterPassword, setRawMasterPassword] = useState<string>("");
  const [masterPasswordHash, setMasterPasswordHash] = useState<string>(""); 
  const [user, setUser] = useState<User | null>(null);
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
  
  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured()) {
          setIsAuthLoading(false);
          setAuthState("login");
          return;
      }
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('master_password_hash')
          .eq('id', currentUser.id)
          .single();
        
        if (profile && profile.master_password_hash) {
          setMasterPasswordHash(profile.master_password_hash);
          setAuthState("unlock");
        } else {
          setAuthState("createMasterPassword");
        }
      } else {
        setAuthState("login");
      }
      setIsAuthLoading(false);
    };

    if (isSupabaseConfigured()) {
        checkUser();
    } else {
        setIsAuthLoading(false);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
            setAuthState("login");
        } else {
            if (isSupabaseConfigured()) {
                checkUser();
            }
        }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
        toast({
            variant: "destructive",
            title: "App Not Configured",
            description: "Please provide Supabase credentials in your .env file to log in.",
        });
        setIsLoading(false);
        return;
    }
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "An unexpected error occurred during login. Please try again."
        });
    } else {
        toast({ title: "Logged In", description: "Welcome back!" });
    }
    setIsLoading(false);
  };

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
     if (!isSupabaseConfigured()) {
        toast({
            variant: "destructive",
            title: "App Not Configured",
            description: "Please provide Supabase credentials in your .env file to sign up.",
        });
        setIsLoading(false);
        return;
    }
    const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password
    });

    if (error) {
         toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: error.message || "An unexpected error occurred during sign-up. Please try again."
        });
    } else if (data.user) {
        toast({ title: "Account Created", description: "Please create your master password." });
        setAuthState("createMasterPassword");
    }
    setIsLoading(false);
  };

  const handleSetMasterPassword = async (values: z.infer<typeof masterPasswordSchema>) => {
    setIsLoading(true);
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to set a master password."});
        setIsLoading(false);
        return;
    }

    try {
        const { hashedPassword } = await hashPassword({ password: values.masterPassword });
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, master_password_hash: hashedPassword, updated_at: new Date().toISOString() }, { onConflict: 'id' });

        if (error) throw error;
        
        setMasterPasswordHash(hashedPassword);
        setAuthState("unlock");
        toast({ title: "Master Password Set!", description: "It has been securely hashed. You can now unlock your vault." });
    } catch (e: any) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error",
            description: e.message || "Could not set master password. Please try again."
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
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error){
        toast({variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again."});
    } else {
        setUser(null);
        setRawMasterPassword("");
        setMasterPasswordHash("");
        setAuthState("login");
        toast({title: "Logged Out", description: "You have been successfully logged out."});
    }
  }

  if (isAuthLoading) {
    return (
        <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle>Configuration Needed</CardTitle>
                <CardDescription>
                    This application is not yet configured. Please add your Supabase URL and Anon Key to the <code>.env</code> file.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mt-4 rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                    <p>Create a <code>.env</code> file in the root of your project and add the following:</p>
                    <pre className="mt-2 text-xs">
                        {`NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
  }

  if (authState === "dashboard") {
    return <PasswordDashboard onLock={handleLock} masterPassword={rawMasterPassword} onLogout={handleLogout} />;
  }
  
  if (authState === "unlock") {
    return <UnlockForm onUnlock={handleUnlock} masterPasswordHash={masterPasswordHash} />;
  }

  if (authState === "createMasterPassword") {
    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle>Create Master Password</CardTitle>
                <CardDescription>This password encrypts your vault. Choose a strong, unique password and **do not forget it**. We cannot recover it for you.</CardDescription>
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
                            {isLoading ? <Loader2 className="animate-spin" /> : "Set Master Password & Encrypt Vault"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
             <CardFooter>
                <Button variant="link" onClick={handleLogout} className="w-full">Logout</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
        <CardHeader>
             <CardTitle>CipherSafe</CardTitle>
            <CardDescription>A decentralized password vault. Please log in or create an account.</CardDescription>
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
    