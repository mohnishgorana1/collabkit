import mongoose, { Document, models, Schema } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  slug: string; // URL ke liye, e.g., collabkit.com/w/dev-team
  logoUrl?: string;
  ownerId: mongoose.Types.ObjectId; // Jisne workspace banaya
  inviteCode: string; // Invite link generate karne ke liye
  settings: {
    allowAnyoneToJoin: boolean; // Agar true hai toh domain-based auto-join
    allowedEmailDomains?: string[]; // e.g., ["company.com"]
  };
  storageUsed: number; // Yahan bytes mein storage track hogi
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoUrl: {
      type: String,
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    settings: {
      allowAnyoneToJoin: {
        type: Boolean,
        default: false,
      },
      allowedEmailDomains: [
        {
          type: String,
        },
      ],
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = models?.Workspace || mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;