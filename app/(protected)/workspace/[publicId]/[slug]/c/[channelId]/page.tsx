// app/(protected)/workspace/[publicId]/[slug]/c/[channelId]/page.tsx
import { redirect } from "next/navigation";
import { getMongoUser } from "@/lib/helpers/auth";
import { Hash, SquareKanban, FileText, Loader2 } from "lucide-react";

import KanbanBoard from "@/components/workspace/channel/KanbanBoard";
import ChatBox from "@/components/workspace/channel/ChatBox";
import DocsEditor from "@/components/workspace/channel/DocsEditor";

import { getChannelById } from "@/lib/actions/channel.actions";
import { getBoardTasks } from "@/lib/actions/task.actions";
import { getWorkspaceMembers } from "@/lib/actions/workspace.actions";
import { getChannelMessages } from "@/lib/actions/message.actions";
import { getOrCreateDocument } from "@/lib/actions/document.actions";
import dynamic from "next/dynamic";
import Workspace from "@/models/workspace.model";



export default async function ChannelPage(props: {
  params: Promise<{ publicId: string; slug: string; channelId: string }>;
}) {
  const params = await props.params;

  let mongoUserId;
  try {
    mongoUserId = await getMongoUser();
  } catch (error) {
    redirect("/login");
  }

  // Fetch current channel data
  const channelData = await getChannelById(params.channelId);

  if (!channelData.success || !channelData.channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Channel not found or deleted.</p>
      </div>
    );
  }

  const { channel } = channelData;

  // ---------------------------------------------------------
  // 🔀 THE SWITCH: Render components based on channel type
  // ---------------------------------------------------------

  if (channel.type === "CHAT") {
    // 💡 Fetching Messages
    const messagesData = await getChannelMessages(channel._id);
    const initialMessages = messagesData.success ? messagesData.messages : [];

    return (
      <div className="flex-1 flex flex-col h-full bg-background/50">
        <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0 gap-2 shadow-sm z-10">
          <Hash size={20} className="text-muted-foreground" />
          <h2 className="font-semibold text-lg text-foreground">{channel.name}</h2>
        </div>

        <ChatBox
          initialMessages={initialMessages}
          workspaceId={channel.workspaceId}
          channelId={channel._id}
          currentUserId={mongoUserId}
        />
      </div>
    );
  }

  if (channel.type === "TASKS") {
    // 💡 Fetching Tasks and Members
    const tasksData = await getBoardTasks(channel._id);
    const initialTasks = tasksData.success ? tasksData.tasks : [];

    const membersData = await getWorkspaceMembers(channel.workspaceId);
    const workspaceMembers = membersData.success ? membersData.members : [];

    return (
      <div className="flex-1 flex flex-col h-full bg-background/50 overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0 gap-3">
          <SquareKanban size={20} className="text-muted-foreground" />
          <h2 className="font-semibold text-lg text-foreground">{channel.name}</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase border border-primary/20">
            {channel.taskPrefix}
          </span>
        </div>

        <KanbanBoard
          initialTasks={initialTasks}
          workspaceId={channel.workspaceId}
          channelId={channel._id}
          currentUserId={mongoUserId}
          isCreator={channel.createdBy.toString() === mongoUserId}
          members={workspaceMembers}
        />
      </div>
    );
  }

  if (channel.type === "DOCS") {
    // either get or create document
    const docData = await getOrCreateDocument(channel._id, channel.workspaceId);
    if (!docData.success) {
      return <div className="p-10 text-red-500">Error loading document.</div>;
    }


    const membersData = await getWorkspaceMembers(channel.workspaceId);
    const workspaceMembers = membersData.success ? membersData.members : [];

    const workspace = await Workspace.findById(channel.workspaceId);

    const document = docData.document;

    // PERMISSION LOGIC
    // 1. Agar user ne yeh channel khud banaya hai (Admin/Creator)
    const isChannelCreator = channel.createdBy.toString() === mongoUserId;

    // 2. Ya phir user ka ID document ke allowedEditors array mein hai
    const isAllowedEditor = document.allowedEditors.some(
      (editor: any) => editor._id.toString() === mongoUserId
    );
    // Final Flag
    const isEditable = isChannelCreator || isAllowedEditor;


    // console.log("doc data", docData);
    // console.log("ic hcnalle creator", isChannelCreator);
    // console.log("is allower editor",isAllowedEditor);


    return (
      <div className="flex-1 flex flex-col h-full bg-background/50">
        <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0 gap-2 shadow-sm z-10">
          <FileText size={20} className="text-muted-foreground" />
          <h2 className="font-semibold text-lg text-foreground">{channel.name}</h2>

          {/* Ek chota sa badge jo batayega ki user View Only mein hai ya Edit mode mein */}
          {!isEditable && (
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground uppercase border border-border">
              View Only
            </span>
          )}
        </div>

        {/* 💡 PASSING PROP TO EDITOR */}
        <DocsEditor
          initialDocument={document}
          isEditable={isEditable}
          workspaceMembers={workspaceMembers}
          currentUserId={mongoUserId}
          channelCreatorId={channel.createdBy.toString()}
          workspaceId={channel.workspaceId.toString()}
          workspaceOwnerId={workspace?.ownerId.toString()}
        />
      </div>
    );
  }
  return null;
}