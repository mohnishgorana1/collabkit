import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Workspace from "@/models/workspace.model";
import WorkspaceMember from "@/models/workspaceMember.model";
import User from "@/models/user.model";
import { getMongoUser } from "@/lib/helpers/auth";

export async function POST(req: Request) {
  await dbConnect();
  
  // 💡 OPTIMIZATION 1: Start Transaction (Data safety ke liye)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = await getMongoUser();
    const { publicId, inviteCode } = await req.json();

    if (!publicId && !inviteCode) {
      throw new Error("Workspace Public ID or Invite Code is required");
    }

    // 1. Fetch Workspace
    const query = inviteCode && !publicId ? { inviteCode } : { publicId };
    const workspace = await Workspace.findOne(query).session(session);

    if (!workspace) throw new Error("Workspace not found or invalid code");

    // 2. Check Membership
    const isMember = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId,
    }).session(session);

    if (isMember) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Already a member", workspaceId: workspace._id });
    }

    // 3. Security Check
    if (publicId && !workspace.settings.allowAnyoneToJoin && workspace.inviteCode !== inviteCode) {
      throw new Error("Invalid invite code");
    }

    // ---------------------------------------------------------
    // 💡 OPTIMIZATION 2: Parallel Writes (API speed 2x fast)
    // ---------------------------------------------------------
    
    // Arrays me saare operations daal do
    const parallelWrites = [
      // Write A: Create Member
      WorkspaceMember.create(
        [{ workspaceId: workspace._id, userId, role: "MEMBER" }],
        { session }
      ),
      
      // Write B: Update User
      User.findByIdAndUpdate(
        userId,
        { $addToSet: { joinedWorkspaces: workspace._id }, onboardingCompleted: true },
        { session }
      )
    ];

    // Write C: Update Workspace (Condition based)
    if (!workspace.isOnboardingComplete) {
      parallelWrites.push(
        Workspace.findByIdAndUpdate(
          workspace._id,
          { isOnboardingComplete: true },
          { session }
        )
      );
    }

    // Sabko ek sath database me maar do! 🚀
    await Promise.all(parallelWrites);

    // Agar sab pass ho gaya toh Commit kardo
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true, workspaceId: workspace._id });
    
  } catch (error: any) {
    // Agar koi ek bhi promise fail hua toh sab undo (rollback) ho jayega
    await session.abortTransaction();
    session.endSession();
    
    console.error("Join Error:", error);
    const statusCode = error.message.includes("Invalid") ? 403 : 500;
    
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: statusCode }
    );
  }
}