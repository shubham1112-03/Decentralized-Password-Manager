"use client";

import { useState, useEffect } from "react";
import type { Credential } from "@/components/ciphersafe/types";
import { Button } from "@/components/ui/button";
import { Lock, LogOut, Loader2 } from "lucide-react";
import AddPasswordDialog from "./add-password-dialog";
import PasswordCard from "./password-card";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, writeBatch } from "firebase/firestore";

type PasswordDashboardProps = {
  onLock: () => void;
  masterPassword: string;
  onLogout: () => void;
};

export default function PasswordDashboard({ onLock, masterPassword, onLogout }: PasswordDashboardProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCredentials = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "credentials"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const creds: Credential[] = [];
        querySnapshot.forEach((doc) => {
          creds.push({ id: doc.id, ...doc.data() } as Credential);
        });
        setCredentials(creds);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load credentials",
          description: error.message || "Could not fetch data from Firestore."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredentials();
  }, [toast]);


  const addCredentialToState = (newCredential: Omit<Credential, "id">, docId: string) => {
    setCredentials(prev => [...prev, { ...newCredential, id: docId }]);
    toast({
        title: "Success!",
        description: `Credential for ${newCredential.service} has been added to your vault.`,
    });
  };

  const deleteCredential = async (id: string) => {
    const originalCredentials = [...credentials];
    let serviceName = "";
    
    setCredentials(prev => prev.filter(cred => {
        if(cred.id === id) {
            serviceName = cred.service;
            return false;
        }
        return true;
    }));

    try {
      await deleteDoc(doc(db, "credentials", id));
      toast({
          variant: "destructive",
          title: "Credential Deleted",
          description: `Credential for ${serviceName} has been removed.`,
      });
    } catch (error: any) {
      toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: `Could not delete ${serviceName}. Please try again.`
      });
      setCredentials(originalCredentials);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <AddPasswordDialog onAddCredential={addCredentialToState} masterPassword={masterPassword} />
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
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : credentials.length > 0 ? (
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
