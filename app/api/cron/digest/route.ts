import { NextResponse } from "next/server";

import { sendDigestEmail } from "@/lib/email";
import {
  createLoginToken,
  listUnsentArticles,
  markDigestSent,
  usersDueForDigest,
} from "@/lib/repository";

export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const users = await usersDueForDigest();
  let sent = 0;
  const failures: string[] = [];

  for (const user of users) {
    try {
      const articles = await listUnsentArticles(user.id);
      if (!articles.length) continue;
      const token = await createLoginToken(user.id);
      const result = await sendDigestEmail({ user, token, articles });
      if (result.error) throw new Error(result.error.message);
      await markDigestSent(
        user.id,
        articles.map((article) => article.id),
      );
      sent += 1;
    } catch (error) {
      console.error("digest_send_failed", { userId: user.id, error });
      failures.push(user.id);
    }
  }

  return NextResponse.json({ users: users.length, sent, failed: failures.length });
}
