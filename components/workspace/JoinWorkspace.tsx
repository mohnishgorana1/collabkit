"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface JoinWorkspaceProps {
  publicId?: string; 
  initialInviteCode?: string; 
  showInput?: boolean; 
  redirectUrl?: string; 
}

export default function JoinWorkspace({
  publicId,
  initialInviteCode = "",
  showInput = false,
  redirectUrl,
}: JoinWorkspaceProps) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (showInput && !inviteCode.trim()) {
      toast.error("Enter a code");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/api/workspace/join", { publicId, inviteCode: inviteCode.trim() });
      if (response.data.success) {
        toast.success("Welcome aboard! 🎉");
        if (redirectUrl) router.push(redirectUrl);
        else router.refresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
      {showInput && (
        <input
          type="text"
          placeholder="e.g. X9K2LM"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-4 rounded-2xl border border-border/50 bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all text-center tracking-[0.25em] font-mono font-bold uppercase placeholder:tracking-normal placeholder:font-sans"
          maxLength={8}
          required
        />
      )}
      <button
        type="submit"
        disabled={isLoading || (showInput && inviteCode.length < 3)}
        className="w-full mt-4 bg-primary text-primary-foreground hover:brightness-110 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 shadow-[0_4px_14px_rgba(0,122,255,0.3)] dark:shadow-[0_4px_14px_rgba(10,132,255,0.2)]"
      >
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Join Workspace"}
      </button>
    </form>
  );
}