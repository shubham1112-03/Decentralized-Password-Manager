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
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";


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
  
  useState(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
         // In a real app, you would fetch this from a secure backend (e.g., Firestore)
        const storedMasterPasswordHash = localStorage.getItem(`masterPasswordHash_${currentUser.uid}`);
        if (storedMasterPasswordHash) {
          setMasterPasswordHash(storedMasterPasswordHash);
          setAuthState("unlock");
        } else {
          setAuthState("createMasterPassword");
        }
      } else {
        setAuthState("login");
      }
    });
    return () => unsubscribe();
  }, []);


  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        setUser(userCredential.user);
        toast({ title: "Logged In", description: "Welcome back!" });
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: e.message || "An unexpected error occurred during login. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        setUser(userCredential.user);
        toast({ title: "Account Created", description: "Please create your master password." });
    } catch (e: any) {
         toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: e.message || "An unexpected error occurred during sign-up. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
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
        // In a real app, save this hash to a secure, user-specific location (e.g., Firestore document)
        localStorage.setItem(`masterPasswordHash_${user.uid}`, hashedPassword);
        setMasterPasswordHash(hashedPassword);
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
  
  const handleLogout = async () => {
    try {
        await auth.signOut();
        setUser(null);
        setRawMasterPassword("");
        setMasterPasswordHash("");
        setAuthState("login");
        toast({title: "Logged Out", description: "You have been successfully logged out."});
    } catch (e) {
        toast({variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again."});
    }
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
    )
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
    
