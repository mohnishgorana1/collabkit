"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function JoinWorkspaceButton({
  publicId,
  inviteCode,
}: {
  publicId: string;
  inviteCode?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/workspace/join", {
        publicId, 
        inviteCode,
      });

      if (response.data.success) {
        toast.success("Welcome to the team! 🎉");
        router.refresh();
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to join workspace";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleJoin}
      disabled={isLoading}
      className="bg-foreground text-background px-8 py-3.5 rounded-full font-medium hover:bg-foreground/90 w-full transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? "Joining..." : "Join Workspace"}
    </button>
  );
}