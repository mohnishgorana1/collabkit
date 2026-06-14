import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";

export async function getMongoUser() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let mongoUserId = sessionClaims?.userMongoId as string;

  // Fallback: Agar session token abhi tak refresh nahi hua hai, tabhi DB query karo
  if (!mongoUserId) {
    console.log("⚠️ Fallback: Fetching Mongo ID from DB");
    await dbConnect(); // Ensure DB connection before querying
    const mongoUser = await User.findOne({ clerkId: userId });
    
    if (!mongoUser) {
      throw new Error("User not found in DB");
    }
    
    mongoUserId = mongoUser._id.toString();
  }

  return mongoUserId;
}