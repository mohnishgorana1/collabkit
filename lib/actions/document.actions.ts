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



export async function updateDocumentEditors(documentId: string, newEditorIds: string[]) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    if (!userId) throw new Error("Unauthorized");

    // Document update karo
    const updatedDoc = await ChannelDoc.findByIdAndUpdate(
      documentId,
      { allowedEditors: newEditorIds },
      { new: true }
    ).populate("allowedEditors", "firstName lastName email avatarUrl");

    return { success: true, editors: JSON.parse(JSON.stringify(updatedDoc.allowedEditors)) };
  } catch (error: any) {
    // console.error("Error updating editors:", error);
    return { success: false, error: error.message };
  }
}