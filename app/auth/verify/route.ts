import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth";
import { consumeLoginToken } from "@/lib/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/?login=invalid", url));

  const user = await consumeLoginToken(token);
  if (!user) return NextResponse.redirect(new URL("/?login=expired", url));

  await setSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", url));
}
