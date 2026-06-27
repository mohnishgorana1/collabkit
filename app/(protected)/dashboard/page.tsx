// app/(protected)/dashboard/page.tsx


import { redirect } from "next/navigation";
import Link from "next/link";
import { getMongoUser } from "@/lib/helpers/auth";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";
import { ChevronRight, LayoutDashboard } from "lucide-react";
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
    <div className="w-full mx-auto flex flex-col gap-10 px-2 py-4 md:p-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Hi, {data.firstName || "User"}
          </h1>
          <p className="text-muted-foreground text-[15px]">
            Ready to build something great today?
          </p>
        </div>
        <WorkspaceActionModal />
      </div>

      {/* Workspaces Grid */}
      {workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws: any) => (
            <Link
              key={ws._id}
              href={`/workspace/${ws.publicId}/${ws.slug}`}
              className="group flex flex-col justify-between p-6 rounded-4xl border border-border bg-card hover:bg-secondary/30 transition-all duration-300 h-52 active:scale-[0.97] shadow-sm hover:shadow-md"
            >
              <div>
                <div className="w-12 h-12 rounded-[14px] bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4 shadow-[0_4px_12px_rgba(0,122,255,0.3)] dark:shadow-[0_4px_12px_rgba(10,132,255,0.3)]">
                  {ws.name.charAt(0)}
                </div>
                <h2 className="text-lg font-bold text-foreground truncate mb-1">
                  {ws.name}
                </h2>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                  {ws.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors">
                Open <ChevronRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-16 rounded-4xl border border-border bg-card text-center w-full shadow-sm">
          <div className="w-20 h-20 rounded-[20px] bg-secondary flex items-center justify-center mb-6">
            <LayoutDashboard className="text-muted-foreground" size={32} />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">No active workspaces</h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            You don&apos;t belong to any teams yet. Create a new space or use an invite code to join one.
          </p>
          <WorkspaceActionModal />
        </div>
      )}
    </div>
  );
}