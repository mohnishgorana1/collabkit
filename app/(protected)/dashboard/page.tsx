import { redirect } from "next/navigation";
import Link from "next/link";
import { getMongoUser } from "@/lib/helpers/auth";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";
import { ArrowRight, Plus, LayoutDashboard } from "lucide-react";

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

  // 4. Render UI
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {data.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is an overview of your active workspaces.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus size={18} />
          New Workspace
        </Link>
      </div>

      {/* WORKSPACES GRID */}
      {workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws: any) => (
            <Link
              key={ws._id}
              href={`/workspace/${ws.publicId}/${ws.slug}`}
              className="group flex flex-col justify-between p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all h-48"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase">
                    {ws.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {ws.name}
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {ws.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open Workspace <ArrowRight size={16} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border/60 bg-card/30 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LayoutDashboard className="text-muted-foreground" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You are not part of any workspaces. Create a new one or ask your team
            for an invite link.
          </p>
          <Link
            href="/onboarding"
            className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-6 py-2.5 rounded-full font-medium transition-all"
          >
            Create Workspace
          </Link>
        </div>
      )}
    </div>
  );
}