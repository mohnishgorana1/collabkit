// app/(protected)/layout.tsx
import Sidebar from "@/components/Sidebar";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";
import { getMongoUser } from "@/lib/helpers/auth";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const userId = await getMongoUser();
  const data = await getUserDashboardData(userId);
  if (!data.success) redirect("/login");

  return (
    <div className={cn("w-full flex bg-background", "h-screen overflow-hidden pt-16")}>
      <div className="hidden md:flex h-full border-r border-border z-10">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {children}
      </main>

    </div>
  );
}