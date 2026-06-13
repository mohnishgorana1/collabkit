import mongoose, { Document, models, Schema } from "mongoose";

export interface IWorkspaceMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
  
  // Custom Display Name (Sirf is workspace ke liye)
  // e.g., User ka global naam "Mohnish" hai, par yahan wo "Scrum Master" hai
  designation?: string; 
  
  // Notification settings specific to THIS workspace
  muteNotifications: boolean;
  
  joinedAt: Date;
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER", "GUEST"],
      default: "MEMBER",
    },
    designation: {
      type: String,
    },
    muteNotifications: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ek user ek workspace mein sirf ek hi baar member ho sakta hai
workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

const WorkspaceMember = models?.WorkspaceMember || mongoose.model<IWorkspaceMember>("WorkspaceMember", workspaceMemberSchema);

export default WorkspaceMember;