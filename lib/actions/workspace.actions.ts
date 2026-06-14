"use server"
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

    console.log("public id", publicId)

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