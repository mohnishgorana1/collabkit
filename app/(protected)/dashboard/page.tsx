// app/(protected)/dashboard/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { getMongoUser } from "@/lib/helpers/auth";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";
import { ChevronRight, LayoutDashboard, Building2, Sparkles } from "lucide-react";
import WorkspaceActionModal from "@/components/workspace/WorkspaceActionModal";

export default async function DashboardPage() {
  let mongoUserId;
  try {
    mongoUserId = await getMongoUser();
  } catch (error) {
    redirect("/login");
  }

  const data = await getUserDashboardData(mongoUserId);

  if (!data.success || !data.onboardingCompleted) {
    redirect("/onboarding");
  }

  const workspaces = data.workspaces;

  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto custom-thin-scrollbar bg-background">
      
      {/* 🌟 Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-50 mix-blend-screen pointer-events-none"></div>

      <div className="relative z-10 w-full mx-auto flex flex-col gap-10 px-4 py-8 md:px-10 md:py-12">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card/40 backdrop-blur-xl border border-border/50 p-6 md:p-8 rounded-3xl shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full flex items-center gap-1.5">
                <Sparkles size={12} /> Overview
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Hi, {data.firstName || "User"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl">
              Select a workspace to jump back into your team&apos;s conversations, tasks, and documents.
            </p>
          </div>
          <div className="shrink-0">
            <WorkspaceActionModal />
          </div>
        </div>

        {/* --- WORKSPACES GRID --- */}
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-foreground tracking-tight px-1 flex items-center gap-2">
            <Building2 size={18} className="text-muted-foreground" /> Your Workspaces
          </h2>

          {workspaces && workspaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {workspaces.map((ws: any) => (
                <Link
                  key={ws._id}
                  href={`/workspace/${ws.publicId}/${ws.slug}`}
                  className="group relative flex flex-col justify-between p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl hover:bg-card hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:border-primary/30 transition-all duration-300 h-56 overflow-hidden"
                >
                  {/* Subtle Gradient Reveal on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-foreground truncate mb-1.5 group-hover:text-primary transition-colors duration-300">
                      {ws.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium">
                      {ws.description || "No description provided for this workspace."}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-t border-border/50 pt-4 mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary/70 transition-colors">
                      Enter Workspace
                    </span>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* --- EMPTY STATE --- */
            <div className="flex flex-col items-center justify-center p-12 md:p-20 rounded-3xl border-2 border-dashed border-border/60 bg-card/30 backdrop-blur-sm text-center w-full shadow-sm">
              <div className="w-20 h-20 rounded-[20px] bg-secondary/50 flex items-center justify-center mb-6 shadow-inner">
                <LayoutDashboard className="text-muted-foreground/60" size={32} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">No active workspaces</h3>
              <p className="text-muted-foreground mb-8 max-w-md text-sm md:text-base font-medium">
                You don&apos;t belong to any teams yet. Create a new space from scratch or use an invite code to join an existing one.
              </p>
              <WorkspaceActionModal />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}