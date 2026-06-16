"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function CreateWorkspaceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      companyName: formData.get("companyName") as string,
      industry: formData.get("industry") as string,
      companySize: formData.get("companySize") as string,
      website: formData.get("website") as string,
      allowAnyoneToJoin: formData.get("allowAnyoneToJoin") === "on",
    };

    try {
      const res = await axios.post("/api/workspace/create", payload);
      if (res.data.success) {
        toast.success("Workspace ready!");
        router.push(`/workspace/${res.data.publicId}/${res.data.slug}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      toast.error(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const inputStyles = "w-full px-4 py-3.5 rounded-xl border border-border bg-black/5 dark:bg-white/5 focus:bg-background focus:ring-[3px] focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 text-[15px] font-medium";

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-5 text-left">
        {/* Row 1: Workspace Name & Company Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-foreground/80 px-1">Workspace Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" required placeholder="e.g. Design Team" className={inputStyles} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="companyName" className="text-xs font-semibold text-foreground/80 px-1">Company Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <input type="text" id="companyName" name="companyName" placeholder="e.g. Acme Corp" className={inputStyles} />
          </div>
        </div>

        {/* Row 2: Industry & Team Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="industry" className="text-xs font-semibold text-foreground/80 px-1">Industry <span className="text-muted-foreground font-normal">(Optional)</span></label>
            <input type="text" id="industry" name="industry" placeholder="e.g. Software, Healthcare" className={inputStyles} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="companySize" className="text-xs font-semibold text-foreground/80 px-1">Team Size <span className="text-red-500">*</span></label>
            <select id="companySize" name="companySize" required defaultValue="" className={`${inputStyles} appearance-none`}>
              <option value="" disabled>Select Size</option>
              <option value="1-10">1-10 people</option>
              <option value="11-50">11-50 people</option>
              <option value="51-200">51-200 people</option>
              <option value="201+">201+ people</option>
            </select>
          </div>
        </div>

        {/* Row 3: Website */}
        <div className="space-y-1.5">
          <label htmlFor="website" className="text-xs font-semibold text-foreground/80 px-1">Website URL <span className="text-muted-foreground font-normal">(Optional)</span></label>
          <input type="url" id="website" name="website" placeholder="https://example.com" className={inputStyles} />
        </div>

        {/* Row 4: Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-semibold text-foreground/80 px-1">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
          <textarea id="description" name="description" rows={2} placeholder="What is this workspace for?" className={`${inputStyles} resize-none`} />
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3 p-4 border border-border/50 rounded-2xl bg-muted/20">
          <input type="checkbox" id="allowAnyoneToJoin" name="allowAnyoneToJoin" className="w-5 h-5 rounded-[6px] border-border text-foreground focus:ring-foreground focus:ring-offset-background cursor-pointer accent-foreground" />
          <label htmlFor="allowAnyoneToJoin" className="text-sm font-medium text-foreground cursor-pointer select-none">
            Allow open joining with link or invite code
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="btn w-full mt-4 bg-primary text-primary-foreground hover:brightness-110 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 shadow-[0_4px_14px_rgba(0,122,255,0.3)] dark:shadow-[0_4px_14px_rgba(10,132,255,0.2)]">
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Workspace"}
        </button>
      </form>
    </div>
  );
}