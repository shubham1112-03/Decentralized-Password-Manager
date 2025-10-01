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
import { auth, db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { isIpfsConfigured } from "@/lib/ipfs";
import ReAuthDialog from "./re-auth-dialog";


const formSchema = z.object({
  service: z.string().min(1, "Service name is required."),
  username: z.string().min(1, "Username or email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AddPasswordDialogProps = {
  onAddCredential: (credential: Credential) => void;
  masterPasswordHash: string;
};

export default function AddPasswordDialog({ onAddCredential, masterPasswordHash }: AddPasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: "",
      username: "",
      password: "",
    },
  });
  
  const handleOpenAndCheck = () => {
    if (!isIpfsConfigured()) {
        toast({
            variant: "destructive",
            title: "IPFS Not Configured",
            description: "Pinata is not set up correctly. Please add your NEXT_PUBLIC_PINATA_API_KEY and PINATA_API_SECRET to the .env file."
        });
        return;
    }
    setIsOpen(true);
  }

  // This function is triggered when the user clicks the initial "Save to Vault" button.
  // It opens the re-authentication dialog.
  const handleInitialSubmit = (values: z.infer<typeof formSchema>) => {
    setIsReAuthOpen(true);
  };
  
  // This is the final submit handler, called after the user successfully enters their master password.
  const onSubmit = async (masterPassword: string) => {
    setIsReAuthOpen(false); // Close re-auth dialog
    setIsSaving(true);
    
    const values = form.getValues();

    if (!auth || !db) {
        toast({
            variant: "destructive",
            title: "App Not Configured",
            description: "Firebase is not configured. Please check your environment variables."
        });
        setIsSaving(false);
        return;
    }
    
    const user = auth.currentUser;
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
        
        toast({ title: "Saving to Vault...", description: "Encrypting, generating proof, and preparing data. This may take a moment." });

        const result = await addCredential(flowInput);
        
        if (!result || !result.sharesCids || !result.zkProof) {
            throw new Error("Flow did not return the required credential data.");
        }

        const newCredentialData = {
            user_id: user.uid,
            service: values.service,
            username: values.username,
            encryptedPassword: result.encryptedPassword,
            sharesCids: result.sharesCids,
            zkProof: result.zkProof,
        };

        const docRef = await addDoc(collection(db, "credentials"), newCredentialData);
        
        const returnedCredential: Credential = {
          id: docRef.id,
          uid: newCredentialData.user_id,
          service: newCredentialData.service,
          username: newCredentialData.username,
          encryptedPassword: newCredentialData.encryptedPassword,
          sharesCids: newCredentialData.sharesCids,
          zkProof: newCredentialData.zkProof
        };

        onAddCredential(returnedCredential);
        setIsOpen(false); // Close the main dialog

    } catch (e: any) {
        console.error(e);
        const errorMessage = e.message || "Something went wrong while saving your password.";
        
        toast({
            variant: "destructive",
            title: "Error Saving Credential",
            description: errorMessage,
        });

    } finally {
        setIsSaving(false);
        form.reset();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
          setIsSaving(false);
        }
      }}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenAndCheck}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Password
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Credential</DialogTitle>
            <DialogDescription>
              This will be encrypted, split into shares, and stored securely.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-4">
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
      
      <ReAuthDialog 
        isOpen={isReAuthOpen}
        onOpenChange={setIsReAuthOpen}
        onVerified={onSubmit}
        masterPasswordHash={masterPasswordHash}
        title="Confirm to Save"
        description="Please enter your master password to encrypt and save this new credential."
      />
    </>
  );
}

    