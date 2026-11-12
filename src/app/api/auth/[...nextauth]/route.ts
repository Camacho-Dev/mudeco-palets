import { handlers } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (req.nextUrl.pathname.endsWith("/error")) {
    const error = req.nextUrl.searchParams.get("error") || "AuthError";
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl);
  }
  return handlers.GET(req);
}

export const POST = handlers.POST;
