"use client";

import { useState } from "react";
import UnlockForm from "@/components/ciphersafe/unlock-form";
import PasswordDashboard from "@/components/ciphersafe/password-dashboard";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  const handleLock = () => {
    setIsUnlocked(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center rounded-full bg-primary/10 p-4">
                 <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
            CipherSafe
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
            Your decentralized password vault, secured by zero-knowledge proofs and distributed storage.
          </p>
        </header>

        <div className="relative w-full">
            {isUnlocked ? (
              <PasswordDashboard onLock={handleLock} />
            ) : (
              <UnlockForm onUnlock={handleUnlock} />
            )}
        </div>
      </div>
    </main>
  );
}
