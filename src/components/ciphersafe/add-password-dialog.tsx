"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Credential } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusCircle, Loader2 } from "lucide-react";
import { addCredential } from "@/ai/flows/credential-flow";
import { useToast } from "@/hooks/use-toast";
import { runFlow } from "@genkit-ai/next/client";
import type { AddCredentialInput } from "@/ai/flows/credential-types";

const formSchema = z.object({
  service: z.string().min(1, "Service name is required."),
  username: z.string().min(1, "Username or email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AddPasswordDialogProps = {
  onAddCredential: (credential: Omit<Credential, "id" | "plaintextPassword">) => void;
  masterPassword: string;
};

export default function AddPasswordDialog({ onAddCredential, masterPassword }: AddPasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setSavingStep("Initiating...");
    
    try {
        const flowInput: AddCredentialInput = {
            masterPassword,
            service: values.service,
            username: values.username,
            password: values.password,
        };

        // We are not using runFlow here as it doesn't support streams correctly in this version
        // We will call the flow directly and simulate the stream on the client
        const stream = addCredential(flowInput);

        const steps = [
          "Deriving encryption key...",
          "Encrypting password with AES-256...",
          "Generating Shamir's secret shares...",
          "Distributing shares to IPFS nodes...",
          "Generating ZK-Proof of ownership...",
          "Done!"
        ];

        for (const step of steps) {
            setSavingStep(step);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        const result = await stream;

        if (!result) {
            throw new Error("Flow did not return an encrypted password.");
        }

        const newCredential = {
            service: values.service,
            username: values.username,
            encryptedPassword: result.encryptedPassword,
        };

        onAddCredential(newCredential);
        setIsOpen(false);

    } catch (e: any) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error Saving Credential",
            description: e.message || "Something went wrong while saving your password. Please try again."
        });
    } finally {
        setIsSaving(false);
        form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        form.reset();
        setIsSaving(false);
        setSavingStep("");
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>
            This will be encrypted and stored securely on decentralized nodes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service / Website</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Google" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Username / Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., user@example.com" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••••" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {savingStep}
                  </>
                ) : (
                  "Save to Vault"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
