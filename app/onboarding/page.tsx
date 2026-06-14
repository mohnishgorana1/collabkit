// /app/onboarding
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Command } from "lucide-react";
import WorkspaceActions from "@/components/onboarding/WorkSpaceActions";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">

      {/* --- CLEAN CARD CONTAINER --- */}
      <div className="w-full max-w-xl bg-background border border-border rounded-2xl shadow-xl overflow-hidden">

        {/* TOP HEADER SECTION */}
        <div className="p-8 border-b border-border/50 bg-muted/10">

          {/* heading & Profile Row */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-foreground/60 tracking-tight">
              Onboarding
            </h1>

            {/* Minimalist Profile Pill */}
            <div className="flex items-center gap-2.5 bg-background border border-border rounded-full py-1.5 pl-1.5 pr-4 shadow-sm">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                  {user.firstName?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[120px]">
                {primaryEmail}
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Set up your workspace
          </h1>
          <p className="text-muted-foreground">
            A workspace is where your team&apos;s chats, tasks, and documents live.
            Create a new one or join an existing team.
          </p>
        </div>

        {/* BOTTOM ACTION SECTION */}
        <div className="p-8 bg-background">
          <WorkspaceActions />
        </div>

      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Need help? <a href="#" className="underline hover:text-foreground">Contact Support</a>
      </p>
    </div>
  );
}