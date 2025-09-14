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
import type { AddCredentialInput } from "@/ai/flows/credential-types";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  service: z.string().min(1, "Service name is required."),
  username: z.string().min(1, "Username or email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AddPasswordDialogProps = {
  onAddCredential: (credential: Omit<Credential, "id">, docId: string) => void;
  masterPassword: string;
};

export default function AddPasswordDialog({ onAddCredential, masterPassword }: AddPasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to add a password."
        });
        setIsSaving(false);
        return;
    }

    try {
        const flowInput: AddCredentialInput = {
            masterPassword,
            service: values.service,
            username: values.username,
            password: values.password,
        };
        
        toast({ title: "Saving to Vault...", description: "Encrypting, generating proof, and uploading to IPFS. This may take a moment." });

        const result = await addCredential(flowInput);
        
        if (!result || !result.sharesCids || !result.zkProof) {
            throw new Error("Flow did not return the required credential data.");
        }

        const newCredentialData = {
            user_id: user.id,
            service: values.service,
            username: values.username,
            encrypted_password: result.encryptedPassword,
            shares_cids: result.sharesCids,
            zk_proof: result.zkProof,
        };

        const { data: insertedData, error } = await supabase
            .from('credentials')
            .insert(newCredentialData)
            .select()
            .single();
        
        if (error) throw error;
        if (!insertedData) throw new Error("Failed to get inserted credential data.");
        
        const returnedCredential = {
          uid: insertedData.user_id,
          service: insertedData.service,
          username: insertedData.username,
          encryptedPassword: insertedData.encrypted_password,
          sharesCids: insertedData.shares_cids,
          zkProof: insertedData.zk_proof
        };

        onAddCredential(returnedCredential, insertedData.id);
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
            This will be encrypted, split into shares, and stored securely on IPFS.
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
                    Saving to Vault...
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
