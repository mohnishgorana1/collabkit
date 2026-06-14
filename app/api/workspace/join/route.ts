// /api/workspace/join/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import Workspace from "@/models/workspace.model";
import WorkspaceMember from "@/models/workspaceMember.model";
import { z } from "zod";
import { getMongoUser } from "@/lib/helpers/auth";


export async function POST(req: Request) {
    getMongoUser()
    return
}
