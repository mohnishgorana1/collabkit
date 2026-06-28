// lib/actions/channel.actions.ts
"use server";

import dbConnect from "@/lib/dbConnect";
import Channel from "@/models/channel.model";
import mongoose from "mongoose";
import { getMongoUser } from "../helpers/auth";
import WorkspaceMember from "@/models/workspaceMember.model";
import { z } from "zod";
import Workspace from "@/models/workspace.model";
import ChannelDoc from "@/models/document.model";
import Message from "@/models/message.model";
import Task from "@/models/task.model";
import { revalidatePath } from "next/cache";

// Zod Schema for createChannelSchema Validation
const createChannelSchema = z
  .object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    name: z
      .string()
      .min(2, "Channel name must be at least 2 characters")
      .max(50, "Channel name is too long")
      .trim()
      .toLowerCase(),
    type: z.enum(["CHAT", "TASKS", "DOCS"]),
    description: z
      .string()
      .max(250, "Description is too long")
      .optional()
      .default(""),
    isPrivate: z.boolean().optional().default(false),
    taskPrefix: z
      .string()
      .max(5, "Task prefix cannot exceed 5 characters")
      .toUpperCase()
      .trim()
      .optional(),
  })
  .refine(
    (data) => {
      // Agar type TASKS hai, toh taskPrefix compulsory hai
      if (
        data.type === "TASKS" &&
        (!data.taskPrefix || data.taskPrefix.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Task prefix is required for Task Boards.",
      path: ["taskPrefix"], // Yeh error exactly taskPrefix field par point karega
    },
  );

export async function getWorkspaceChannels(workspaceId: string) {
  try {
    await dbConnect();

    // Workspace ID ke basis par channels fetch karenge

    const channels = await Channel.find({ workspaceId })
      .sort({ type: 1, order: 1 }) // Pehle Type ke hisaab se group karo, phir unke Order ke hisaab se sort karo
      .lean(); // .lean() use kiya taaki MongoDB object plain JSON mein convert ho jaye (Next.js client components ke liye zaroori hai)

    if (!channels) {
      return { success: false, error: "No channels found" };
    }

    return {
      success: true,
      channels: JSON.parse(JSON.stringify(channels)),
    };
  } catch (error: any) {
    console.error("Error fetching workspace channels:", error);
    return { success: false, error: error.message };
  }
}

export async function createChannel(payload: {
  workspaceId: string;
  name: string;
  type: "CHAT" | "TASKS" | "DOCS";
  description?: string;
  isPrivate?: boolean;
  taskPrefix?: string;
}) {
  try {
    await dbConnect();
    const userId = await getMongoUser();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validationResult = createChannelSchema.safeParse(payload);
    if (!validationResult.success) {
      // Return the first validation error message
      return {
        success: false,
        error: validationResult.error.message,
      };
    }

    const validData = validationResult.data;

    // SECURITY CHECK: Kya user is workspace ka member hai?
    const isMember = await WorkspaceMember.findOne({
      workspaceId: payload.workspaceId,
      userId: userId,
    });
    if (!isMember) {
      return {
        success: false,
        error:
          "You don't have permission to create channels in this workspace.",
      };
    }

    // 1. Check if channel name already exists in this workspace
    const existingChannel = await Channel.findOne({
      workspaceId: payload.workspaceId,
      name: payload.name.toLowerCase(),
    });

    if (existingChannel) {
      return {
        success: false,
        error: "A channel with this name already exists in this workspace.",
      };
    }

    // 2. Create the new channel
    const newChannel = await Channel.create({
      workspaceId: payload.workspaceId,
      name: payload.name,
      type: payload.type,
      description: payload.description || "",
      isPrivate: payload.isPrivate || false,
      taskPrefix: payload.type === "TASKS" ? payload.taskPrefix : undefined,
      createdBy: userId,
      // Default order can be 0, we can add drag-drop reordering later
      order: 0,
    });
    if (!newChannel) {
      return {
        success: false,
        error: "Failed to create channel. Please try again.",
      };
    }

    await Workspace.findByIdAndUpdate(payload.workspaceId, {
      $inc: { "stats.totalChannels": 1 },
    });

    // SUCCESS
    return {
      success: true,
      channel: JSON.parse(JSON.stringify(newChannel)),
    };
  } catch (error: any) {
    console.error("Error creating channel:", error);
    return { success: false, error: error.message };
  }
}

export async function getChannelById(channelId: string) {
  try {
    await dbConnect();

    const channel = await Channel.findById(channelId).lean();

    if (!channel) {
      return { success: false, error: "Channel not found" };
    }

    return {
      success: true,
      channel: JSON.parse(JSON.stringify(channel)),
    };
  } catch (error: any) {
    console.error("Error fetching channel:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGenericChannel(
  channelId: string,
  workspaceId: string,
  currentUserId: string,
) {
  // MongoDB Session start karenge transaction ke liye
  const session = await mongoose.startSession();
  try {
    await dbConnect();

    session.startTransaction();

    // 1. Channel aur Workspace ko ek sath fetch karein
    const channel = await Channel.findById(channelId);
    if (!channel) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Channel not found!" };
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, error: "Workspace not found!" };
    }

    // 2. Roles aur Ownership check karein
    const isCreator = channel.createdBy.toString() === currentUserId;
    const isWorkspaceOwner = workspace.ownerId.toString() === currentUserId;

    // 3. Robust Access Control Matrix
    let isAuthorized = false;

    switch (channel.type) {
      case "DOCS":
        // Creator OR Workspace Owner (Orphaned document trap se bachne ke liye)
        isAuthorized = isCreator || isWorkspaceOwner;
        break;
      case "TASKS":
        // Creator OR Workspace Owner (Team leads/PMs ko flexibility dene ke liye)
        isAuthorized = isCreator || isWorkspaceOwner;
        break;
      case "CHAT":
        // Creator OR Workspace Owner
        isAuthorized = isCreator || isWorkspaceOwner;
        break;
      default:
        isAuthorized = false;
    }

    if (!isAuthorized) {
      return {
        success: false,
        error:
          "You don't have permission to delete this channel only Channel Creator and Workspace owner have the permission",
      };
    }

    // 4. Channel ko delete krna with session
    await Channel.findByIdAndDelete(channelId, { session });

    // 5. Cascade Delete: Linked data cleanup with session
    if (channel.type === "DOCS") {
      await ChannelDoc.findOneAndDelete(
        { channelId: channel._id },
        { session },
      );
    }

    if (channel.type === "CHAT") {
      await Message.deleteMany({ channelId }, { session });
    }
    if (channel.type === "TASKS") {
      await Task.deleteMany({ channelId }, { session });
    }

    // 💡 THE FIX: Decrease totalChannels count in Workspace (-1)
    await Workspace.findByIdAndUpdate(
      workspaceId,
      { $inc: { "stats.totalChannels": -1 } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    revalidatePath(`/workspace/${workspaceId}`);

    return { success: true };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error("Delete channel error:", error.message);
    return { success: false, error: "Channel delete karne me error aayi." };
  }
}
