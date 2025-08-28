"use client";

import { useState } from "react";
import type { Credential } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Copy, Loader2, Trash2, ShieldQuestion } from "lucide-react";
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

type PasswordCardProps = {
  credential: Credential;
  onDelete: (id: string) => void;
};

const revealSteps = [
    "Verifying master key proof...",
    "Fetching secret shares from IPFS...",
    "Reconstructing secret...",
    "Decrypting with AES-256...",
];

export default function PasswordCard({ credential, onDelete }: PasswordCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealStep, setRevealStep] = useState("");
  const { toast } = useToast();

  const handleRevealToggle = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    if (isRevealing) return;

    setIsRevealing(true);
    for (const step of revealSteps) {
        setRevealStep(step);
        await new Promise(resolve => setTimeout(resolve, 600));
    }
    setIsRevealing(false);
    setIsRevealed(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(credential.plaintextPassword);
    toast({
      title: "Password Copied!",
      description: `Password for ${credential.service} has been copied to your clipboard.`,
    });
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex-row items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
            <ShieldQuestion className="h-6 w-6 text-secondary-foreground" />
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
                        {revealStep}
                    </div>
                ) : isRevealed ? (
                    <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-mono text-lg tracking-wider truncate">{credential.plaintextPassword}</span>
                        <Button variant="ghost" size="icon" onClick={handleCopy} className="flex-shrink-0">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy password</span>
                        </Button>
                    </div>
                ) : (
                    <span className="font-mono text-2xl tracking-widest text-muted-foreground/50">••••••••••••</span>
                )}
            </div>
        </CardContent>
      </div>
      <CardFooter className="grid grid-cols-[1fr,auto] gap-2">
        <Button variant="outline" onClick={handleRevealToggle} disabled={isRevealing}>
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
                This action cannot be undone. This will permanently delete the credential for {credential.service} from decentralized storage.
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
  );
}
