"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Link as LinkIcon, AlertCircle, Loader2 } from "lucide-react";
import axios from 'axios'
import toast from "react-hot-toast";
export default function WorkspaceActions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);



    // Form se saara data nikal rahe hain
    const payload = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      companyName: formData.get("companyName") as string,
      industry: formData.get("industry") as string,
      companySize: formData.get("companySize") as string,
      website: formData.get("website") as string,
      allowAnyoneToJoin: formData.get("allowAnyoneToJoin") === "on", // Checkbox logic
    };

    console.log("formdata", payload)


    try {
      const res = await axios.post("/api/workspace/create", payload);
      if (res.data.success) {
        toast.success("Workspace created successfully! 🚀");
        router.push("/dashboard"); // Redirect to dashboard
      }
      console.log("res", res)
    } catch (err: any) {
      // ✅ Axios specific error handling
      const errorMessage = err.response?.data?.error || err.message || "Failed to create workspace";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const inviteCode = formData.get("inviteCode") as string;

    try {
      const res = await axios.post("/api/workspace/join", { inviteCode });

      if (res.data.success) {
        toast.success("Joined workspace successfully! 🎉");
        router.push("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to join workspace";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* SEGMENTED TAB SWITCHER */}
      <div className="flex p-1 mb-8 bg-muted rounded-xl border border-border/50">
        <button
          onClick={() => { setActiveTab("create"); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === "create"
            ? "bg-background text-foreground shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
        >
          <Building2 size={16} />
          Create New
        </button>
        <button
          onClick={() => { setActiveTab("join"); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === "join"
            ? "bg-background text-foreground shadow-sm ring-1 ring-border"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
        >
          <LinkIcon size={16} />
          Join Existing
        </button>
      </div>

      {/* CREATE WORKSPACE FORM */}
      {activeTab === "create" && (
        <form onSubmit={handleCreate} className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500 text-left">

          {/* Row 1: Workspace Name & Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Workspace Name <span className="text-red-500 dark:text-red-600/50">*</span>
              </label>
              <input type="text" id="name" name="name" required placeholder="e.g. Design Team" className="w-full px-4 py-2.5 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="companyName" className="text-sm font-semibold text-foreground">
                Company Name <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
              </label>
              <input type="text" id="companyName" name="companyName" placeholder="e.g. Acme Corp" className="w-full px-4 py-2.5 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-foreground">
              Description <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </label>
            <textarea id="description" name="description" rows={2} placeholder="What is this workspace for?" className="w-full px-4 py-2.5 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all resize-none" />
          </div>

          {/* Row 3: Industry & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="industry" className="text-sm font-semibold text-foreground">
                Industry <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
              </label>
              <select id="industry" name="industry" defaultValue="" className="w-full px-4 py-2.5 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all appearance-none">
                <option value="">Select Industry</option>
                <option value="Software">Software & IT</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Marketing">Marketing & Agency</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-y-1.5">
              <label htmlFor="companySize" className="text-sm font-semibold text-foreground">
                Company Size <span className="text-red-500 dark:text-red-600/50">*</span>
              </label>
              <select id="companySize" name="companySize" required className="w-full px-4 py-2.5 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all appearance-none">
                <option value="" disabled>Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          {/* Row 4: Website & Settings */}
          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="website" className="text-sm font-semibold text-foreground">
              Website URL <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </label>
            <input type="url" id="website" name="website" placeholder="https://example.com" className="w-full px-4 py-2.5 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all" />
          </div>

          {/* SETTINGS CHECKBOX */}
          <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-muted/20">
            <input type="checkbox" id="allowAnyoneToJoin" name="allowAnyoneToJoin" className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer" />
            <label htmlFor="allowAnyoneToJoin" className="text-sm font-medium text-foreground cursor-pointer select-none">
              Allow anyone with the link to join automatically
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" disabled={loading} className="w-full mt-2 bg-foreground text-background py-3.5 rounded-xl font-medium hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Workspace"}
          </button>
        </form>
      )}

      {/* JOIN WORKSPACE FORM */}
      {activeTab === "join" && (
        <form onSubmit={handleJoin} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="space-y-2">
            <label htmlFor="inviteCode" className="text-sm font-semibold text-foreground">
              Invite Code
            </label>
            <input type="text" id="inviteCode" name="inviteCode" required placeholder="Paste your 8-character code here" className="w-full px-4 py-3 rounded-xl border border-border bg-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-mono" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Join Workspace"}
          </button>
        </form>
      )}

    </div>
  );
}