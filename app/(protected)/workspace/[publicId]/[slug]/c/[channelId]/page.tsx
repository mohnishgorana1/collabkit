// app/(protected)/workspace/[publicId]/[slug]/c/[channelId]/page.tsx
import { redirect } from "next/navigation";
import { getMongoUser } from "@/lib/helpers/auth";
import { getChannelById } from "@/lib/actions/channel.actions";
import { Hash, SquareKanban, FileText, } from "lucide-react";
import KanbanBoard from "@/components/workspace/channel/KanbanBoard";
import { getBoardTasks } from "@/lib/actions/task.actions";
import { getWorkspaceMembers } from "@/lib/actions/workspace.actions";
import ChatBox from "@/components/workspace/channel/ChatBox";
import { getChannelMessages } from "@/lib/actions/message.actions";

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
    // 💡 NAYA DATA FETCH KIYA
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
    // 💡 Fetch existing tasks for this board
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
          isCreator={channel.createdBy.toString() === mongoUserId} // Checks if current user made the channel
          members={workspaceMembers} // Tumhe DB se users fetch karke yahan array pass karni hogi
        />
      </div>
    );
  }

  if (channel.type === "DOCS") {
    return (
      <div className="flex-1 flex flex-col h-full bg-background/50">
        <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0 gap-2">
          <FileText size={20} className="text-muted-foreground" />
          <h2 className="font-semibold text-lg text-foreground">{channel.name}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {/* Yahan hamara Notion-style Editor aayega */}
          <p>Canvas Document Editor coming soon...</p>
        </div>
      </div>
    );
  }

  return null;
}