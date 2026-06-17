import mongoose, { Document, models, Schema } from "mongoose";

export interface IChannel extends Document {
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  type: "CHAT" | "TASKS" | "DOCS";
  description?: string;

  // Access Control
  isPrivate: boolean;
  memberIds: mongoose.Types.ObjectId[]; // Agar private hai, toh sirf in members ko dikhega

  // Customization
  taskPrefix?: string; // 💡 TASK boards ke liye (e.g., "DES" for DES-1, DES-2)
  order: number; // Sidebar mein upar-neeche drag-drop karne ke liye

  createdBy: mongoose.Types.ObjectId; // Kisne banaya

  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // "General" aur "general" same rahein
    },
    type: {
      type: String,
      enum: ["CHAT", "TASKS", "DOCS"],
      default: "CHAT",
    },
    description: {
      type: String,
      maxlength: 250,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "WorkspaceMember",
      },
    ],
    taskPrefix: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: 5, // e.g., "FRONT", "DES"
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 💡 Indexes for super-fast sidebar rendering
// Hum ek workspace ke saare channels unke type ke hisaab se fetch karenge
channelSchema.index({ workspaceId: 1, type: 1, order: 1 });

// Ek workspace mein same naam ke do channels nahi ho sakte (jaise Slack me hota hai)
channelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

const Channel =
  models?.Channel || mongoose.model<IChannel>("Channel", channelSchema);

export default Channel;
