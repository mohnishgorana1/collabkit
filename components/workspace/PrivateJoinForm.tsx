"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function PrivateJoinForm({ publicId }: { publicId: string }) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault(); // Page refresh hone se rokne ke liye
    
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/workspace/join", {
        publicId,
        inviteCode: inviteCode.trim(), 
      });

      if (response.data.success) {
        toast.success("Code accepted! Welcome to the team 🎉");
        router.refresh();
      } else {
        toast.error(response.data.message || "Invalid invite code");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Invalid invite code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="w-full max-w-sm flex flex-col gap-3">
      <input
        type="text"
        placeholder="Enter 8-digit code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
        className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-foreground text-center tracking-[0.3em] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        maxLength={8}
      />
      <button
        type="submit"
        disabled={isLoading || inviteCode.length < 3}
        className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {isLoading ? "Verifying..." : "Unlock & Join"}
      </button>
    </form>
  );
}