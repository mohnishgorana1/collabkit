"use server";
import Workspace from "@/models/workspace.model";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import WorkspaceMember from "@/models/workspaceMember.model";

export async function getUserDashboardData(mongoUserId: string) {
  try {
    await dbConnect();
    const user = await User.findById(mongoUserId).populate({
      path: "joinedWorkspaces",
      model: Workspace,
    });

    if (!user) return { success: false, error: "User not found" };

    return {
      success: true,
      onboardingCompleted: user.onboardingCompleted,
      firstName: user.firstName,
      workspaces: JSON.parse(JSON.stringify(user.joinedWorkspaces || [])),
    };
  } catch (error: any) {
    console.error("Error fetching user workspaces:", error);
    return { success: false, error: error.message };
  }
}

export async function getWorkspacePageData(publicId: string, userId: string) {
  try {
    await dbConnect();

    console.log("public id", publicId);

    // 1. Fetch workspace using the publicId (not MongoDB _id)
    const workspace = await Workspace.findOne({ publicId: publicId });

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    // 2. Check membership status using the internal MongoDB _id
    const member = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: userId,
    });

    return {
      success: true,
      workspace: JSON.parse(JSON.stringify(workspace)),
      isMember: !!member,
    };
  } catch (error: any) {
    console.error("Error fetching workspace page data:", error);
    return { success: false, error: error.message };
  }
}

export async function getWorkspaceMembers(workspaceId: string) {
  try {
    await dbConnect();

    // Workspace ke saare members find karo aur unki User details (naam, avatar) populate karo
    const members = await WorkspaceMember.find({ workspaceId })
      .populate("userId", "firstName lastName avatarUrl")
      .lean();

    if (!members) return { success: false, members: [] };

    // Dropdown ke liye data format kar rahe hain [{ _id, name }]
    const formattedMembers = members.map((m: any) => ({
      _id: m.userId._id.toString(), // Task me assigneeId user ka jayega
      name: `${m.userId.firstName} ${m.userId.lastName}`,
      avatarUrl: m.userId.avatarUrl,
    }));

    return { success: true, members: formattedMembers };
  } catch (error: any) {
    console.error("Error fetching workspace members:", error);
    return { success: false, members: [] };
  }
}
