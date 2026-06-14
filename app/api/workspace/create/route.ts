import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import Workspace from "@/models/workspace.model";
import WorkspaceMember from "@/models/workspaceMember.model";
import { z } from "zod";
import { getMongoUser } from "@/lib/helpers/auth";

// Zod Schema (Jo pehle banaya tha)
const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(50),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .default(""),
  companyName: z.string().max(100).optional().default(""),
  industry: z.string().optional().default(""),
  companySize: z
    .enum(["", "1-10", "11-50", "51-200", "201-500", "500+"])
    .optional()
    .default(""),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  allowAnyoneToJoin: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  await dbConnect();

  // 1. Start MongoDB Session for Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const mongoUserId = await getMongoUser();
    console.log("mongoUserId", mongoUserId);

    const body = await req.json();
    const validationResult = createWorkspaceSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("zod validation error: ", validationResult.error.message);
      throw new Error(validationResult.error.message);
    }

    const {
      name,
      description,
      companyName,
      industry,
      companySize,
      website,
      allowAnyoneToJoin,
    } = validationResult.data;

    // Slugs
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = baseSlug || "workspace";

    // Generate Public ID (e.g., "v9xk2mpq") for URL
    const publicId = Math.random().toString(36).substring(2, 10).toLowerCase();

    // Generate Invite Code (e.g., "I5T06FL5")
    const inviteCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    // ----------------------------------------------------------------------
    // 🔴 DANGER ZONE: DB WRITES BEGIN HERE (Everything wrapped in Session)
    // ----------------------------------------------------------------------

    // STEP A: Create Workspace
    // Note: Mongoose transactions require passing an array to .create() when using sessions
    const workspaceCreated = await Workspace.create(
      [
        {
          name,
          publicId,
          slug,
          description,
          ownerId: mongoUserId,
          inviteCode,
          companyInfo: {
            companyName: companyName || name,
            industry,
            companySize: companySize || "1-10",
            website,
          },
          settings: {
            allowAnyoneToJoin,
            defaultRole: "MEMBER",
            defaultTimezone: "UTC",
          },
          isOnboardingComplete: true,
        },
      ],
      { session },
    ); // ✅ Session pass kiya

    if (!workspaceCreated || workspaceCreated.length === 0) {
      throw new Error("Failed to create workspace");
    }
    const newWorkspace = workspaceCreated[0]; // Get the created doc

    console.log("new worksapce", newWorkspace);

    // STEP B: Create Member

    const memberCreated = await WorkspaceMember.create(
      [
        {
          workspaceId: newWorkspace._id,
          userId: mongoUserId,
          role: "OWNER",
        },
      ],
      { session },
    );

    if (!memberCreated || memberCreated.length === 0) {
      throw new Error("Failed to add user as workspace owner");
    }
    console.log("workspace member ", memberCreated);

    // STEP C: Update User
    const updatedUser = await User.findByIdAndUpdate(
      mongoUserId,
      {
        onboardingCompleted: true,
        lastActiveWorkspaceId: newWorkspace._id,
        $addToSet: { joinedWorkspaces: newWorkspace._id },
      },
      { new: true, session }, // ✅ Session pass kiya
    );

    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }
    console.log("updatedUser", updatedUser);

    // ----------------------------------------------------------------------
    // ✅ SAFE ZONE: COMMIT EVERYTHING

    await session.commitTransaction(); // Database par permanently save karo

    session.endSession();

    return NextResponse.json(
      {
        success: true,
        workspaceId: newWorkspace._id,
        publicId: newWorkspace.publicId,
        slug: newWorkspace.slug,
      },
      { status: 201 },
    );
  } catch (error: any) {
    // ❌ ERROR ZONE: ROLLBACK EVERYTHING
    await session.abortTransaction(); // Agar kuchh bhi fail hua, toh pehle waale bhi delete kar do
    session.endSession();

    console.error("❌ TRANSACTION ABORTED:", error.message);

    const statusCode = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      {
        error:
          error.message || "Internal Server Error. Operations rolled back.",
      },
      { status: statusCode },
    );
  }
}
