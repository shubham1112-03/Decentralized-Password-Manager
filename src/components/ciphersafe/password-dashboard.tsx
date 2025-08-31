"use client";

import { useState } from "react";
import type { Credential } from "@/components/ciphersafe/types";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import AddPasswordDialog from "./add-password-dialog";
import PasswordCard from "./password-card";
import { useToast } from "@/hooks/use-toast";

const initialCredentials: Omit<Credential, 'id' | 'plaintextPassword'>[] = [
  {
    service: "GitHub",
    username: "dev-user",
    // This is "supersecretpassword123!" encrypted with master key "password123"
    encryptedPassword: "d2d147314e357361733a41a4a62c58a8:64a8a5e78b27376c6c449c256038373b9347517036618d35688a2a95c93d489b9d3113",
  },
  {
    service: "Google",
    username: "personal.email@gmail.com",
    // This is "mygooglepass&Secure" encrypted with master key "password123"
    encryptedPassword: "97223b207137731a523a518e974579c3:32c8a2b5dd21386d38408f23343a6d368d555c703b688c3535873b95c3",
  },
  {
    service: "Firebase",
    username: "project-admin",
    // This is "FirebaseR0cks!" encrypted with master key "password123"
    encryptedPassword: "3b2e3f7465357467773243a4e44f65c9:60c8b6b1df253b6f67428e213b3d683a93545b733a35",
  },
];

type PasswordDashboardProps = {
  onLock: () => void;
  masterPassword: string;
};

export default function PasswordDashboard({ onLock, masterPassword }: PasswordDashboardProps) {
  const [credentials, setCredentials] = useState<Credential[]>(() => initialCredentials.map(c => ({...c, id: crypto.randomUUID(), plaintextPassword: '' })));
  const { toast } = useToast();

  const addCredential = (newCredential: Omit<Credential, "id" | "plaintextPassword">) => {
    setCredentials(prev => [...prev, { ...newCredential, id: crypto.randomUUID(), plaintextPassword: '' }]);
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
        <Button variant="secondary" onClick={onLock}>
          <Lock className="mr-2 h-4 w-4" />
          Lock Vault
        </Button>
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
