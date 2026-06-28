// /app/api/liveblocks-auth/route.ts
import { Liveblocks } from "@liveblocks/node";
import { getFullMongoUser } from "@/lib/helpers/auth"; // 💡 Naya function import kiya

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    // 💡 Ab hume user ki saari details milengi (ID, name, avatar)
    const user = await getFullMongoUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { room } = await request.json();
  
    // Prepare the Liveblocks session
    const session = liveblocks.prepareSession(String(user._id), {
      userInfo: {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Workspace Member",
        avatar: user.avatarUrl || "", 
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      },
    });

    session.allow(room, ["room:write"]);

    const { status, body } = await session.authorize();
    return new Response(body, { status });
    
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}