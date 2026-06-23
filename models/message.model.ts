//els/message.model.ts
import mongoose, { Document, models, Schema } from "mongoose";

export interface IMessage extends Document {
  workspaceId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  fileUrl?: string; // Agar future me PDF/Images bhejne ho
  isDeleted: boolean; // "This message was deleted" feature ke liye
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    fileUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 💡 Performance Hack: Fast fetching messages of a specific channel sorted by time
messageSchema.index({ channelId: 1, createdAt: 1 });

const Message = models?.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;