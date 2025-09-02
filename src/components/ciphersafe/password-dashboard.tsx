"use client";

import { useState } from "react";
import type { Credential } from "@/components/ciphersafe/types";
import { Button } from "@/components/ui/button";
import { Lock, LogOut } from "lucide-react";
import AddPasswordDialog from "./add-password-dialog";
import PasswordCard from "./password-card";
import { useToast } from "@/hooks/use-toast";

const initialCredentials: Omit<Credential, 'id' | 'plaintextPassword' | 'shares' | 'zkProof' | 'publicSignals'>[] = [
  // These initial credentials will not work with the new crypto system
  // as they lack the required shares and ZKP data. They are left here
  // as placeholders but will throw an error if "reveal" is clicked.
  // A proper implementation would have a migration path.
  {
    service: "GitHub (Legacy)",
    username: "dev-user",
    encryptedPassword: "d2d147314e357361733a41a4a62c58a8:64a8a5e78b27376c6c449c256038373b9347517036618d35688a2a95c93d489b9d3113",
  },
  {
    service: "Google (Legacy)",
    username: "personal.email@gmail.com",
    encryptedPassword: "97223b207137731a523a518e974579c3:32c8a2b5dd21386d38408f23343a6d368d555c703b688c3535873b95c3",
  },
];

type PasswordDashboardProps = {
  onLock: () => void;
  masterPassword: string;
  onLogout: () => void;
};

export default function PasswordDashboard({ onLock, masterPassword, onLogout }: PasswordDashboardProps) {
  const [credentials, setCredentials] = useState<Credential[]>(() => initialCredentials.map(c => ({
      ...c,
      id: crypto.randomUUID(),
      shares: [],
      zkProof: "",
      publicSignals: ""
    })));
  const { toast } = useToast();

  const addCredential = (newCredential: Omit<Credential, "id" | "plaintextPassword">) => {
    setCredentials(prev => [...prev, { ...newCredential, id: crypto.randomUUID() }]);
    toast({
        title: "Success!",
        description: `Credential for ${newCredential.service} has been added to your vault.`,
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
        <AddPasswordDialog onAddCredential={addCredential} masterPassword={masterPassword} />
        <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onLock}>
              <Lock className="mr-2 h-4 w-4" />
              Lock Vault
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </div>
      </div>
      
      {credentials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map(cred => (
            <PasswordCard key={cred.id} credential={cred} onDelete={deleteCredential} masterPassword={masterPassword} />
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
