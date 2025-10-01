"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyPassword } from "@/ai/flows/crypto-flow";

const formSchema = z.object({
  masterPassword: z.string().min(1, "Master password cannot be empty."),
});

type UnlockFormProps = {
  masterPasswordHash: string;
  onUnlock: (masterPassword: string) => void;
};

export default function UnlockForm({ masterPasswordHash, onUnlock }: UnlockFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      masterPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
        if (!masterPasswordHash) {
            throw new Error("Master password hash is not set. Please create a master password first.");
        }

        const { isVerified } = await verifyPassword({
            hashedPassword: masterPasswordHash,
            password: values.masterPassword
        });

        if (!isVerified) {
            toast({
            variant: "destructive",
            title: "Invalid Password",
            description: "The master password you entered is incorrect.",
            });
            setIsLoading(false);
            return;
        }

        onUnlock(values.masterPassword);
        toast({
            title: "Vault Unlocked",
            description: "Welcome back! Your vault is now accessible.",
        });

    } catch (e: any) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: e.message || "An error occurred while verifying the password. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <KeyRound className="h-6 w-6 text-primary" />
          Unlock Your Vault
        </CardTitle>
        <CardDescription>Enter your master password to access your vault.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="masterPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Master Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••••" {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
