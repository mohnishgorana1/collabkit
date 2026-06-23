// lib/pusher.ts
import PusherServer from "pusher";
import PusherClient from "pusher-js";

// --- BACKEND KE LIYE (Trigger karne ke liye) ---
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// --- FRONTEND KE LIYE (Listen karne ke liye) ---
// Hum isko directly component me bhi initialize kar sakte hain, 
// par yahan export karna clean rehta hai.
export const getPusherClient = () => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });
};