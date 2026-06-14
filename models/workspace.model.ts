import mongoose, { Document, models, Schema } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  publicId: string;
  slug: string; // URL ke liye e.g., collabkit.com/w/publicid/acme-corp
  logoUrl?: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  inviteCode: string;

  companyInfo: {
    industry?: string; // e.g., "Software", "Education", "Healthcare"
    companyName?: string;
    companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
    website?: string;
  };

  storageUsed: number; // Current used bytes

  settings: {
    allowAnyoneToJoin: boolean;
    allowedEmailDomains?: string[]; // e.g., ["company.com"]
    defaultRole: "ADMIN" | "MEMBER" | "GUEST";
    defaultTimezone: string;
  };

  branding: {
    primaryColor: string;
    themePreference: "LIGHT" | "DARK" | "SYSTEM";
  };

  stats: {
    totalMembers: number;
    totalChannels: number;
    lastActiveAt: Date; // Workspace zinda hai ya dead, track karne ke liye
  };

  isActive: boolean; // Soft delete
  isOnboardingComplete: boolean; // Workspace ka setup complete hua ya nahi

  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    publicId: {
      type: String,
      required: true,
      unique: true, // 💡 Yeh hamesha unique rahega
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: false,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoUrl: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 500 },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inviteCode: { type: String, required: true, unique: true, index: true },

    companyInfo: {
      industry: { type: String, default: "" },
      companyName: { type: String, default: "" },
      companySize: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      },
      website: { type: String, default: "" },
    },

    settings: {
      allowAnyoneToJoin: { type: Boolean, default: false },
      allowedEmailDomains: [{ type: String }],
      defaultRole: {
        type: String,
        enum: ["ADMIN", "MEMBER", "GUEST"],
        default: "MEMBER",
      },
      defaultTimezone: { type: String, default: "UTC" },
    },

    branding: {
      primaryColor: { type: String, default: "#09090b" },
      themePreference: {
        type: String,
        enum: ["LIGHT", "DARK", "SYSTEM"],
        default: "SYSTEM",
      },
    },

    stats: {
      totalMembers: { type: Number, default: 1 }, // Owner pehle se hai
      totalChannels: { type: Number, default: 0 },
      lastActiveAt: { type: Date, default: Date.now },
    },

    isActive: { type: Boolean, default: true },
    isOnboardingComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster querying
workspaceSchema.index({ "settings.allowedEmailDomains": 1 });

const Workspace =
  models?.Workspace || mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;
