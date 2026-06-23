// lib/actions/task.actions.ts
"use server";
import { revalidatePath } from "next/cache";

import dbConnect from "@/lib/dbConnect";
import Task from "@/models/task.model";
import Channel from "@/models/channel.model";
import { getMongoUser } from "../helpers/auth";

// 1. Create a New Task (With Auto-Incrementing Ticket ID)
export async function createTask(payload: {
  workspaceId: string;
  channelId: string;
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    if (!userId) throw new Error("Unauthorized");

    // 1. Get the Channel to find its taskPrefix (e.g., "DES")
    const channel = await Channel.findById(payload.channelId).select(
      "taskPrefix",
    );
    if (!channel || !channel.taskPrefix) {
      throw new Error("Invalid channel or missing task prefix");
    }

    // 2. Find the last created task in this channel to calculate the next ID
    const lastTask = await Task.findOne({ channelId: payload.channelId })
      .sort({ createdAt: -1 }) // Sabse latest pehle
      .select("ticketId");

    let nextNumber = 1;
    if (lastTask && lastTask.ticketId) {
      // Extract number from "DES-42" -> 42 -> Add 1 -> 43
      const parts = lastTask.ticketId.split("-");
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const newTicketId = `${channel.taskPrefix}-${nextNumber}`;

    // 3. Create the Task
    const newTask = await Task.create({
      workspaceId: payload.workspaceId,
      channelId: payload.channelId,
      creatorId: userId,
      title: payload.title,
      description: payload.description || "",
      status: payload.status || "TODO",
      priority: payload.priority || "MEDIUM",
      ticketId: newTicketId,
    });
    revalidatePath(
      `/workspace/[publicId]/[slug]/c/${payload.channelId}`,
      "page",
    );

    return { success: true, task: JSON.parse(JSON.stringify(newTask)) };
  } catch (error: any) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message };
  }
}

// 2. Fetch All Tasks for a Board
export async function getBoardTasks(channelId: string) {
  try {
    await dbConnect();

    const tasks = await Task.find({ channelId })
      .populate("assigneeId", "firstName lastName avatarUrl") // Assignee ki detail bhi laayenge
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, tasks: JSON.parse(JSON.stringify(tasks)) };
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: error.message };
  }
}

// 3. Update Task Status (For Drag and Drop)
export async function updateTaskStatus(taskId: string, newStatus: string) {
  try {
    await dbConnect();
    const userId = await getMongoUser();
    if (!userId) throw new Error("Unauthorized");

    // 💡 1. Pehle task fetch karo (taaki permission check kar sakein)
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    // 💡 2. SERVER VALIDATION: Sirf Assignee hi status update kar sakta hai
    // Agar assigneeId set nahi hai, ya current user assignee nahi hai, toh block kardo
    if (!task.assigneeId || task.assigneeId.toString() !== userId.toString()) {
      throw new Error("Only the assigned user can move this task.");
    }

    // 💡 3. Validation pass ho gayi, ab update karo
    task.status = newStatus;
    await task.save();

    return { success: true, task: JSON.parse(JSON.stringify(task)) };
  } catch (error: any) {
    console.error("Error updating task status:", error);
    return { success: false, error: error.message };
  }
}

// --- UPDATE TASK DETAILS (Title, Description, Priority) ---
export async function updateTaskDetails(
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
  },
) {
  try {
    await dbConnect();

    // 💡 MAGIC FIX: Handle "Unassigned" edge case
    // Agar frontend se empty string "" aati hai, toh usko null kar do taaki Mongoose crash na ho
    const updateData: any = { ...payload };
    if (updateData.assigneeId === "") {
      updateData.assigneeId = null;
    }

    // .lean() for faster conversion
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true },
    ).lean();

    if (!updatedTask) throw new Error("Task not found");

    return { success: true, task: JSON.parse(JSON.stringify(updatedTask)) };
  } catch (error: any) {
    console.error("Error updating task details:", error);
    return { success: false, error: error.message };
  }
}
// --- DELETE TASK ---
export async function deleteTask(taskId: string) {
  try {
    await dbConnect();
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) throw new Error("Task not found");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message };
  }
}
