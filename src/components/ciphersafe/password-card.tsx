"use client";

import { useState } from "react";
import type { Credential } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Loader2, Trash2, ShieldQuestion, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { revealCredential } from "@/ai/flows/credential-flow";
import type { RevealCredentialInput } from "@/ai/flows/credential-types";
import ReAuthDialog from "./re-auth-dialog";

type PasswordCardProps = {
  credential: Credential;
  onDelete: (id: string) => void;
  masterPasswordHash: string;
};

export default function PasswordCard({ credential, onDelete, masterPasswordHash }: PasswordCardProps) {
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const { toast } = useToast();

  const isLegacyCredential = !credential.sharesCids || !credential.zkProof;
  const isRevealed = revealedPassword !== null;

  const handleRevealToggle = () => {
    if (isRevealed) {
      setRevealedPassword(null);
      return;
    }
    
    if (isLegacyCredential) return;

    // Open the re-auth dialog instead of revealing directly
    setIsReAuthOpen(true);
  };
  
  const handleRevealPassword = async (masterPassword: string) => {
    setIsReAuthOpen(false); // Close re-auth dialog
    if (isRevealing) return;

    setIsRevealing(true);
    toast({ title: "Revealing Password...", description: "Fetching from IPFS and verifying proof. This may take a moment." });

    try {
        const flowInput: RevealCredentialInput = {
            masterPassword,
            sharesCids: credential.sharesCids,
            zkProof: credential.zkProof,
        };

        const result = await revealCredential(flowInput);

      if (!result?.plaintextPassword) {
        throw new Error("Failed to decrypt password.");
      }
      setRevealedPassword(result.plaintextPassword);

    } catch (e: any) {
      console.error(e);
      setRevealedPassword(null);
      toast({
        variant: "destructive",
        title: "Error Revealing Credential",
        description: e.message || "Could not decrypt the password. Please check your master password and try again."
      });
    } finally {
      setIsRevealing(false);
    }
  };


  const handleCopy = () => {
    if (!revealedPassword) return;
    navigator.clipboard.writeText(revealedPassword);
    toast({
      title: "Password Copied!",
      description: `Password for ${credential.service} has been copied to your clipboard.`,
    });
  };


  return (
    <>
      <Card className="flex flex-col justify-between">
        <div>
          <CardHeader className="flex-row items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
              {isLegacyCredential ? <AlertTriangle className="h-6 w-6 text-destructive" /> : <ShieldQuestion className="h-6 w-6 text-secondary-foreground" />}
              </div>
              <div className="min-w-0">
                  <CardTitle className="truncate">{credential.service}</CardTitle>
                  <CardDescription className="truncate">{credential.username}</CardDescription>
              </div>
          </CardHeader>
          <CardContent>
              <div className="flex h-16 items-center justify-center rounded-md border border-dashed bg-card p-4 text-center">
                  {isRevealing ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Revealing...
                      </div>
                  ) : isRevealed ? (
                      <div className="flex w-full items-center justify-between gap-2">
                          <span className="font-mono text-lg tracking-wider truncate">{revealedPassword}</span>
                          <Button variant="ghost" size="icon" onClick={handleCopy} className="flex-shrink-0">
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy password</span>
                          </Button>
                      </div>
                  ) : isLegacyCredential ? (
                      <div className="flex items-center text-sm text-destructive">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Legacy Data
                      </div>
                  ) : (
                      <span className="font-mono text-2xl tracking-widest text-muted-foreground/50">••••••••••••</span>
                  )}
              </div>
              {isLegacyCredential && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">This credential was saved in an old format and cannot be revealed. Please delete and re-add it.</p>
              )}
          </CardContent>
        </div>
        <CardFooter className="grid grid-cols-[1fr,auto] gap-2">
          <Button variant="outline" onClick={handleRevealToggle} disabled={isRevealing || isLegacyCredential}>
            {isRevealed ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {isRevealed ? "Hide" : "Reveal"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" aria-label="Delete credential">
                  <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the credential for {credential.service}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(credential.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      <ReAuthDialog 
        isOpen={isReAuthOpen}
        onOpenChange={setIsReAuthOpen}
        onVerified={handleRevealPassword}
        masterPasswordHash={masterPasswordHash}
        title="Confirm to Reveal"
        description="Please enter your master password to decrypt and reveal this credential."
      />
    </>
  );
}

    