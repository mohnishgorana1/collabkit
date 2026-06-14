import mongoose, { Document, models, Schema } from "mongoose";

export interface IWorkspaceMember extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "OWNER" | "ADMIN" | "MEMBER" | "GUEST";

  workspaceProfile: {
    displayName?: string; // Global name ko override karne ke liye (e.g., "Frontend Lead")
    designation?: string;
    customStatus?: {
      emoji: string; // e.g., "🌴"
      text: string; // e.g., "On Vacation"
      expiresAt?: Date;
    };
  };

  // --- STATE & ACCESS CONTROL ---
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  // --- ENGAGEMENT TRACKING ---
  lastAccessedAt: Date; // Admins ko inactive users hatane mein help karega

  // --- WORKSPACE PREFERENCES ---
  preferences: {
    muteNotifications: boolean;
  };

  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
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

    workspaceProfile: {
      displayName: { type: String, trim: true },
      designation: { type: String, trim: true },
      customStatus: {
        emoji: { type: String },
        text: { type: String, maxlength: 100 },
        expiresAt: { type: Date },
      },
    },

    // --- STATE & ACCESS CONTROL ---
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    // --- ENGAGEMENT TRACKING ---
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    // --- WORKSPACE PREFERENCES ---
    preferences: {
      muteNotifications: { type: Boolean, default: false },
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate memberships
workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

// Optimize filtering for active members in a specific workspace
workspaceMemberSchema.index({ workspaceId: 1, status: 1 });

const WorkspaceMember =
  models?.WorkspaceMember ||
  mongoose.model<IWorkspaceMember>("WorkspaceMember", workspaceMemberSchema);

export default WorkspaceMember;
