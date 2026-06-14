import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Workspace from "@/models/workspace.model";
import WorkspaceMember from "@/models/workspaceMember.model";
import User from "@/models/user.model";
import { getMongoUser } from "@/lib/helpers/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    const { publicId, inviteCode } = await req.json();

    if (!publicId) return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });

    // 💡 UPDATE: Fetch via publicId, not slug or MongoDB _id
    const workspace = await Workspace.findOne({ publicId });
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    // 2. Check agar pehle se member hai
    const isMember = await WorkspaceMember.findOne({ workspaceId: workspace._id, userId });
    if (isMember) return NextResponse.json({ message: "Already a member", workspaceId: workspace._id });

    // 3. Logic: Public vs Private
    if (!workspace.settings.allowAnyoneToJoin) {
      if (workspace.inviteCode !== inviteCode) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
      }
    }

    // 4. Join process
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: userId,
      role: "MEMBER",
    });

    // 5. User model update
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedWorkspaces: workspace._id },
    });

    return NextResponse.json({ success: true, workspaceId: workspace._id });

  } catch (error: any) {
    console.error("Join Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}