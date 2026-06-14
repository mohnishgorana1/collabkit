import { redirect } from "next/navigation";
import { getMongoUser } from "@/lib/helpers/auth";
import { getWorkspacePageData } from "@/lib/actions/workspace.actions";
import { Hash, Users, Settings, MessageSquare, Lock } from "lucide-react";
import Link from "next/link";
import JoinWorkspaceButton from "@/components/workspace/JoinWorkspaceButton";
import PrivateJoinForm from "@/components/workspace/PrivateJoinForm";

export default async function WorkspacePage(props: {
  params: Promise<{ publicId: string; slug: string }>; 
  searchParams: Promise<{ inviteCode?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  let mongoUserId;
  try {
    mongoUserId = await getMongoUser();
  } catch (error) {
    redirect("/login");
  }

  // 1. Backend action call with publicId (params.publicId)
  const data = await getWorkspacePageData(params.publicId, mongoUserId);

  if (!data.success || !data.workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-lg">Workspace not found.</p>
      </div>
    );
  }

  const { workspace, isMember } = data;

  // ==========================================
  // VIEW 1: AGAR USER MEMBER NAHI HAI (JOIN PAGE)
  // ==========================================
  if (!isMember) {
    const isPublic = workspace.settings?.allowAnyoneToJoin;
    const hasValidInvite = searchParams.inviteCode === workspace.inviteCode;

    // Agar private hai aur code nahi hai/galat hai -> SHOW MANUAL ENTRY FORM
    if (!isPublic && !hasValidInvite) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Private Workspace</h1>
          <p className="text-muted-foreground mb-8">
            This workspace is invite-only. If you have an invite code, please enter it below to gain access.
          </p>

          {/* 💡 UPDATE: slug ki jagah publicId (params.publicId) pass karo */}
          <PrivateJoinForm publicId={params.publicId} />

          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground mt-8 text-sm font-medium transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      );
    }

    // Join View
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center rounded-3xl text-4xl font-bold mb-6 uppercase">
          {workspace.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">{workspace.name}</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {workspace.description || "Join this workspace to start collaborating."}
        </p>

        {/* 💡 UPDATE: slug ki jagah publicId pass karo */}
        <JoinWorkspaceButton publicId={params.publicId} inviteCode={searchParams.inviteCode} />
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AGAR USER MEMBER HAI (WORKSPACE DASHBOARD)
  // ==========================================
  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full">
      {/* Top Header of the Channel */}
      <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0">
        <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <Hash size={22} className="text-muted-foreground" />
          general
        </div>
      </div>

      {/* Chat Messages Space */}
      <div className="flex-1 p-6 flex items-center justify-center text-muted-foreground flex-col overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <MessageSquare size={32} className="text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">
          Welcome to #general
        </h3>
        <p className="text-sm max-w-md text-center">
          This is the start of the <strong>#general</strong> channel. This is where your team can chat and collaborate.
        </p>
      </div>

      {/* Message Input Box Mockup */}
      <div className="p-4 bg-background shrink-0">
        <div className="h-14 border border-border/80 rounded-xl bg-card flex items-center px-4 text-muted-foreground text-sm shadow-sm">
          Message #general...
        </div>
      </div>
    </div>
  );
}