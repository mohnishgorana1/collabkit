// /workspace/[publicId]/[slug]/page.tsx
import { redirect } from "next/navigation";
import { getMongoUser } from "@/lib/helpers/auth";
import { getWorkspacePageData } from "@/lib/actions/workspace.actions";
import { Hash, Users, Settings, MessageSquare, Lock } from "lucide-react";
import Link from "next/link";
import JoinWorkspace from "@/components/workspace/JoinWorkspace";
import WorkspaceDashboard from "@/components/workspace/WorkspaceDashboard";

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

    // SCENARIO 1: Private hai aur Code nahi hai (Show Input Form)
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
          <div className="w-full max-w-xs">
            <JoinWorkspace publicId={params.publicId} showInput={true} />
          </div>

          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground mt-8 text-sm font-medium transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      );
    }

    // SCENARIO 2: Public hai ya Valid Code URL me hai (Show Just Button)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center rounded-3xl text-4xl font-bold mb-6 uppercase">
          {workspace.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">{workspace.name}</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {workspace.description || "Join this workspace to start collaborating."}
        </p>

        <div className="w-full max-w-xs">
          <JoinWorkspace publicId={params.publicId} initialInviteCode={searchParams.inviteCode} showInput={false} />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AGAR USER MEMBER HAI (WORKSPACE DASHBOARD)
  // ==========================================
  return (
    <WorkspaceDashboard workspace={workspace}/>
  );
}