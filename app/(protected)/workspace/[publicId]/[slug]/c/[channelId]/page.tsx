// app/(protected)/workspace/[publicId]/[slug]/c/[channelId]/page.tsx
import { redirect } from "next/navigation";
import { getMongoUser } from "@/lib/helpers/auth";
import { getChannelById } from "@/lib/actions/channel.actions";
import { Hash, SquareKanban, FileText } from "lucide-react";

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
    return (
      <div className="flex-1 flex flex-col h-full bg-background/50">
        <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0 gap-2">
          <Hash size={20} className="text-muted-foreground" />
          <h2 className="font-semibold text-lg text-foreground">{channel.name}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {/* Yahan hamara real-time ChatBox component aayega */}
          <p>Real-time chat interface coming soon...</p>
        </div>
      </div>
    );
  }

  if (channel.type === "TASKS") {
    return (
      <div className="flex-1 flex flex-col h-full bg-background/50">
        <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0 gap-2">
          <SquareKanban size={20} className="text-muted-foreground" />
          <h2 className="font-semibold text-lg text-foreground">{channel.name}</h2>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
            {channel.taskPrefix}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {/* Yahan hamara Kanban Board component aayega */}
          <p>Kanban Task Board coming soon...</p>
        </div>
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