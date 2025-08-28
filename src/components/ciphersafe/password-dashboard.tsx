"use client";

import { useState } from "react";
import type { Credential } from "@/components/ciphersafe/types";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import AddPasswordDialog from "./add-password-dialog";
import PasswordCard from "./password-card";
import { useToast } from "@/hooks/use-toast";

const initialCredentials: Credential[] = [
  {
    id: "1",
    service: "GitHub",
    username: "dev-user",
    encryptedPassword: "encrypted_gibberish_string_1",
    plaintextPassword: "supersecretpassword123!",
  },
  {
    id: "2",
    service: "Google",
    username: "personal.email@gmail.com",
    encryptedPassword: "encrypted_gibberish_string_2",
    plaintextPassword: "mygooglepass&Secure",
  },
  {
    id: "3",
    service: "Firebase",
    username: "project-admin",
    encryptedPassword: "encrypted_gibberish_string_3",
    plaintextPassword: "FirebaseR0cks!",
  },
];

type PasswordDashboardProps = {
  onLock: () => void;
};

export default function PasswordDashboard({ onLock }: PasswordDashboardProps) {
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const { toast } = useToast();

  const addCredential = (newCredential: Omit<Credential, "id">) => {
    const credToAdd = { ...newCredential, id: crypto.randomUUID() };
    setCredentials(prev => [...prev, credToAdd]);
    toast({
        title: "Success!",
        description: `Credential for ${credToAdd.service} has been added to your vault.`,
    });
  };

  const deleteCredential = (id: string) => {
    let serviceName = "";
    setCredentials(prev => prev.filter(cred => {
        if(cred.id === id) {
            serviceName = cred.service;
            return false;
        }
        return true;
    }));
    toast({
        variant: "destructive",
        title: "Credential Deleted",
        description: `Credential for ${serviceName} has been removed.`,
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <AddPasswordDialog onAddCredential={addCredential} />
        <Button variant="secondary" onClick={onLock}>
          <Lock className="mr-2 h-4 w-4" />
          Lock Vault
        </Button>
      </div>
      
      {credentials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map(cred => (
            <PasswordCard key={cred.id} credential={cred} onDelete={deleteCredential} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Your vault is empty</h3>
            <p className="text-muted-foreground mt-2">Click "Add New Password" to get started.</p>
        </div>
      )}
    </div>
  );
}
