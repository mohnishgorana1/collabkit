// models/document.model.ts
import mongoose, { Document, models, Schema } from "mongoose";

export interface IChannelDoc extends Document {
  workspaceId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  content: string; // Hum BlockNote ka JSON data as a String save karenge
  lastEditedBy: mongoose.Types.ObjectId;
  allowedEditors: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IChannelDoc>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      unique: true, // Ek channel ka ek hi doc
    },
    content: {
      type: String,
      default: "",
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allowedEditors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const ChannelDoc =
  models?.ChannelDoc ||
  mongoose.model<IChannelDoc>("ChannelDoc", documentSchema);

export default ChannelDoc;
