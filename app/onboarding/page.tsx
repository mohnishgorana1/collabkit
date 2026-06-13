"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return null; // Wait for Clerk to load

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to CollabKit, {user?.firstName || "there"}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Let&apos;s set up your first workspace so your team can start chatting and collaborating.
        </p>

        <div className="pt-8 flex flex-col gap-4">
          {/* Yeh buttons abhi dummy hain, hum isme Workspace logic add karenge */}
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-[1.02]"
          >
            Create a Workspace <ArrowRight size={18} />
          </button>
          
          <button className="w-full py-3.5 rounded-lg font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors">
            Have an invite code? Join Workspace
          </button>
        </div>
      </div>
    </div>
  );
}