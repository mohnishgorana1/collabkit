// lib/actions/message.actions.ts
"use server";

import dbConnect from "@/lib/dbConnect";
import Message from "@/models/message.model";
import { getMongoUser } from "../helpers/auth";
import { pusherServer } from "../pusher";

export async function getChannelMessages(channelId: string) {
  try {
    await dbConnect();

    // 💡 .populate("senderId") se humein user ka naam aur photo bhi mil jayega
    const messages = await Message.find({ channelId })
      .populate("senderId", "firstName lastName avatarUrl")
      .sort({ createdAt: 1 }) // Purane se naye ki taraf
      .lean();

    return { success: true, messages: JSON.parse(JSON.stringify(messages)) };
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return { success: false, error: error.message };
  }
}

export async function createMessage(payload: {
  workspaceId: string;
  channelId: string;
  content: string;
}) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    if (!userId) throw new Error("Unauthorized");

    const newMessage = await Message.create({
      workspaceId: payload.workspaceId,
      channelId: payload.channelId,
      senderId: userId,
      content: payload.content,
    });

    // Hum naye banaye gaye message ko bhi populate karwa lete hain
    // taaki client side par turant UI me add ho sake
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "firstName lastName avatarUrl")
      .lean();

    const finalMessage = JSON.parse(JSON.stringify(populatedMessage));

    await pusherServer.trigger(payload.channelId, "new-message", finalMessage);

    return {
      success: true,
      message: finalMessage,
    };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}
