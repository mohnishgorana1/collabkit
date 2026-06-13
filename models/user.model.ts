import mongoose, { Document, models, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;

  // Real-time Chat & Presence
  presenceStatus: "ONLINE" | "OFFLINE" | "DND" | "AWAY";
  lastActiveAt: Date;

  // App Experience & Navigation
  onboardingCompleted: boolean;
  lastActiveWorkspaceId?: mongoose.Types.ObjectId; // User jahan last active tha
  joinedWorkspaces: mongoose.Types.ObjectId[]; // Sidebar mein fast rendering ke liye cached list

  // Global Access Control
  systemRole: "USER" | "SUPERADMIN"; // App-level role (Workspace roles alag collection me honge)

  // Global User Preferences
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };

  // Personal Integrations (Optional)
  integrations: {
    github?: string;
    googleCalendar?: string; // Presence sync karne ke liye
  };

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },

    // --- REAL-TIME PRESENCE ---
    presenceStatus: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "DND", "AWAY"],
      default: "OFFLINE",
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // --- APP STATE ---
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    lastActiveWorkspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
    joinedWorkspaces: [
      {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],

    systemRole: {
      type: String,
      enum: ["USER", "SUPERADMIN"],
      default: "USER",
    },

    // --- PREFERENCES ---
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // --- INTEGRATIONS ---
    integrations: {
      github: { type: String, default: "" },
      googleCalendar: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || mongoose.model<IUser>("User", userSchema);

export default User;