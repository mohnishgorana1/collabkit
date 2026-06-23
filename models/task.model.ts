// models/task.model.ts
import mongoose, { Document, models, Schema } from "mongoose";

export interface ITask extends Document {
  workspaceId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId; // Kis Board ka task hai
  creatorId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId; // Kisko assign kiya hai
  
  ticketId: string; // e.g., "DES-1", "DEV-42"
  title: string;
  description?: string;
  
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  
  dueDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    
    ticketId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
      default: "TODO",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Optimize queries for a specific board
taskSchema.index({ channelId: 1, status: 1 });

const Task = models?.Task || mongoose.model<ITask>("Task", taskSchema);

export default Task;