import Sidebar from "@/components/Sidebar";
import { getMongoUser } from "@/lib/helpers/auth";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getMongoUser();
  const data = await getUserDashboardData(userId);

  if (!data.success) redirect("/login");

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* sidebar har jagah ek jaisa  */}
      <Sidebar workspaces={data.workspaces} />
      <main className="p-4 flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}