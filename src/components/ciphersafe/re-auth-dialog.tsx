"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyPassword } from "@/ai/flows/crypto-flow";

const formSchema = z.object({
  masterPassword: z.string().min(1, "Master password cannot be empty."),
});

type ReAuthDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  masterPasswordHash: string;
  onVerified: (masterPassword: string) => void;
  title: string;
  description: string;
};

export default function ReAuthDialog({ isOpen, onOpenChange, masterPasswordHash, onVerified, title, description }: ReAuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { masterPassword: "" },
  });
  
  useEffect(() => {
    if (!isOpen) {
        form.reset();
        setIsLoading(false);
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
        if (!masterPasswordHash) {
            throw new Error("Master password hash is not set.");
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
        
        // If verified, call the callback with the master password.
        // The calling component will then close the dialog.
        onVerified(values.masterPassword);

    } catch (e: any) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: e.message || "An error occurred while verifying the password.",
        });
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                "Confirm"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
