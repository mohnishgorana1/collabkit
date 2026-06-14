"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusSquare, Settings, Hash, Users } from "lucide-react";

export default function Sidebar({ workspaces }: { workspaces: any[] }) {
  const pathname = usePathname();

  // URL check
  const isWorkspaceRoute = pathname.includes("/workspace/");
  
  // Current workspace ID URL se nikalo (agar workspace me hai toh)
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces.find((w) => w._id === currentWorkspaceId);

  return (
    <aside className="w-64 border-border/50 bg-muted/20 hidden md:flex flex-col justify-between h-full pb-4">
      
      {/* 1. SCROLLABLE CONTENT AREA */}
      <div className="overflow-y-auto py-6 flex flex-col gap-6">
        
        {/* --- GLOBAL SECTION (Hamesha dikhega) --- */}
        <div className="px-4 flex flex-col gap-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Overview
          </p>
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              pathname === "/dashboard" 
                ? "bg-secondary/80 text-secondary-foreground" 
                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            }`}
          >
            <LayoutDashboard size={18} /> 
            Dashboard
          </Link>
          <Link 
            href="/onboarding" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/40 hover:text-foreground font-medium transition-colors"
          >
            <PlusSquare size={18} /> 
            Create Workspace
          </Link>
        </div>

        {/* --- WORKSPACE SECTION (Sirf Workspace route pe dikhega) --- */}
        {isWorkspaceRoute && currentWorkspace && (
          <>
            {/* Divider */}
            <div className="px-4">
              <div className="h-px bg-border/60 w-full"></div>
            </div>

            <div className="px-4 flex flex-col gap-1">
              {/* Workspace Indicator */}
              <div className="flex items-center gap-2 px-2 mb-4">
                <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                  {currentWorkspace.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-foreground truncate">
                  {currentWorkspace.name}
                </h3>
              </div>

              {/* Channels */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                Channels
              </p>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 text-secondary-foreground font-medium w-full text-left transition-colors">
                <Hash size={18} className="text-muted-foreground" /> 
                general
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/40 text-muted-foreground font-medium w-full text-left transition-colors">
                <Hash size={18} /> 
                random
              </button>

              {/* Team & Settings */}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-4">
                Team
              </p>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/40 text-muted-foreground font-medium w-full text-left transition-colors">
                <Users size={18} /> 
                Members
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/40 text-muted-foreground font-medium w-full text-left transition-colors mt-2">
                <Settings size={18} /> 
                Workspace Settings
              </button>
            </div>
          </>
        )}
      </div>

      {/* 2. BOTTOM GLOBAL SETTINGS */}
      <div className="p-4">
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 font-medium transition-colors">
          <Settings size={18} /> 
          Account Settings
        </Link>
      </div>
    </aside>
  );
}