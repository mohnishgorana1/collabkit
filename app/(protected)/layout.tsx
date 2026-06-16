// app/(protected)/layout.tsx
import Sidebar from "@/components/Sidebar";
import { getUserDashboardData } from "@/lib/actions/workspace.actions";
import { getMongoUser } from "@/lib/helpers/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  

  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:flex h-full border-r border-border">
        <Sidebar/>
      </div>

      <main className="px-2 md:px-4 lg:px-4 py-8 md:py-10  flex flex-col flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}