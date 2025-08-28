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

const formSchema = z.object({
  masterPassword: z.string().min(1, "Master password cannot be empty."),
});

type UnlockFormProps = {
  onUnlock: () => void;
};

export default function UnlockForm({ onUnlock }: UnlockFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      masterPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Simulate ZKP verification and vault decryption
    setTimeout(() => {
      if (values.masterPassword === 'password123') {
        setIsLoading(false);
        onUnlock();
        toast({
          title: "Vault Unlocked",
          description: "Welcome back!",
        });
      } else {
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Unlock Failed",
            description: "Invalid master password.",
        });
        form.setError("masterPassword", { message: " " });
      }
    }, 1500);
  };

  return (
    <Card className="mx-auto max-w-md border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <KeyRound className="h-6 w-6 text-primary" />
          Unlock Your Vault
        </CardTitle>
        <CardDescription>Enter your master password to decrypt your data. (Hint: use 'password123')</CardDescription>
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
                    <Input type="password" placeholder="••••••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying & Decrypting...
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
