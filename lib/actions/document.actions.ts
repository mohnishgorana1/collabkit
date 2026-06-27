// lib/actions/document.actions.ts
"use server";

import dbConnect from "@/lib/dbConnect";
import ChannelDoc from "@/models/document.model";
import { getMongoUser } from "../helpers/auth";
import Channel from "@/models/channel.model";
import Workspace from "@/models/workspace.model";

export async function getOrCreateDocument(
  channelId: string,
  workspaceId: string,
) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    if (!userId) throw new Error("Unauthorized");

    // 💡 THE FIX 1: Workspace se 'ownerId' select karo
    const channel = await Channel.findById(channelId).select("createdBy");
    const workspace = await Workspace.findById(workspaceId).select("ownerId");

    let doc = await ChannelDoc.findOne({ channelId })
      // 💡 THE FIX 2: User schema ke exact fields populate karo
      .populate("allowedEditors", "firstName lastName email avatarUrl")
      .lean();

    if (!doc) {
      const editorsSet = new Set([
        workspace.ownerId.toString(), // 💡 THE FIX 3: workspace.ownerId use kiya hai
        channel.createdBy.toString(),
      ]);

      const newDoc = await ChannelDoc.create({
        workspaceId,
        channelId,
        content: "",
        lastEditedBy: userId,
        allowedEditors: Array.from(editorsSet),
      });

      doc = await ChannelDoc.findById(newDoc._id)
        .populate("allowedEditors", "firstName lastName email avatarUrl")
        .lean();
    }

    return { success: true, document: JSON.parse(JSON.stringify(doc)) };
  } catch (error: any) {
    // console.error("Error fetching document:", error);
    return { success: false, error: error.message };
  }
}
// 2. Auto-Save Update Document
export async function updateDocumentContent(docId: string, content: string) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    if (!userId) throw new Error("Unauthorized");

    const updatedDoc = await ChannelDoc.findByIdAndUpdate(
      docId,
      {
        content,
        lastEditedBy: userId,
      },
      { new: true },
    ).lean();

    if (!updatedDoc) throw new Error("Document not found");

    return { success: true };
  } catch (error: any) {
    // console.error("Error updating document:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDocumentEditors(
  documentId: string,
  newEditorIds: string[],
) {
  try {
    // 1. DB Connect aur User Auth Check
    await dbConnect();
    const userId = await getMongoUser();

    if (!userId) {
      return { success: false, error: "Unauthorized access! Please log in." };
    }

    // 2. Document ko database se fetch karo
    const document = await ChannelDoc.findById(documentId);
    if (!document) {
      return { success: false, error: "Document not found!" };
    }

    let hasFullAdminAccess = false;

    // ==========================================
    // 🛡️ STRICT BACKEND SECURITY CHECK START
    // ==========================================

    // Check 1: Kya user is Channel ka Creator hai?
    const channel = await Channel.findById(document.channelId);

    if (channel && channel.createdBy?.toString() === userId.toString()) {
      hasFullAdminAccess = true;
    }

    // Check 2: Agar channel creator nahi hai, toh kya Workspace ka Owner hai?
    if (!hasFullAdminAccess) {
      const workspace = await Workspace.findById(document.workspaceId);
      if (workspace && workspace.ownerId?.toString() === userId.toString()) {
        hasFullAdminAccess = true;
      }
    }

    // Agar dono me se kuch bhi nahi hai, toh ACCESS DENIED 🚨
    if (!hasFullAdminAccess) {
      console.warn(
        `Security Alert: User ${userId} tried to modify editors for doc ${documentId} without permission.`,
      );
      return {
        success: false,
        error:
          "Access Denied: Only Channel Creators or Workspace Owners can manage editors.",
      };
    }
    // ==========================================
    // 🛡️ STRICT BACKEND SECURITY CHECK END
    // ==========================================

    // 3. Sab theek hai toh Document update karo
    const updatedDoc = await ChannelDoc.findByIdAndUpdate(
      documentId,
      { allowedEditors: newEditorIds },
      { new: true },
    ).populate("allowedEditors", "firstName lastName name email avatarUrl");

    // 4. Return Data
    return {
      success: true,
      editors: JSON.parse(JSON.stringify(updatedDoc.allowedEditors)),
    };
  } catch (error: any) {
    console.error("Error updating document editors:", error);
    return {
      success: false,
      error: error.message || "Failed to update editors",
    };
  }
}
