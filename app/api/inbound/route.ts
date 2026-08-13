import { NextResponse } from "next/server";

import { findInboxSlug, parseNewsletterEmail } from "@/lib/inbound";
import {
  attachArticleToUser,
  claimWebhookEvent,
  contentHash,
  findExistingArticle,
  getUserByInboxSlug,
  releaseWebhookEvent,
  saveArticle,
} from "@/lib/repository";
import { resendClient } from "@/lib/email";
import { summarizeArticle } from "@/lib/summarize";

export const maxDuration = 120;

type ReceivedEvent = {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    received_for?: string[];
    subject: string;
  };
};

export async function POST(request: Request) {
  const resend = resendClient();
  const payload = await request.text();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Webhook is not configured.", { status: 503 });
  }

  let event: ReceivedEvent;
  try {
    event = (await resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    })) as ReceivedEvent;
  } catch {
    return new NextResponse("Invalid webhook.", { status: 400 });
  }

  if (event.type !== "email.received") return NextResponse.json({ ok: true });
  const eventId = request.headers.get("svix-id") ?? event.data.email_id;
  if (!(await claimWebhookEvent(eventId))) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    const inboundDomain = process.env.INBOUND_EMAIL_DOMAIN;
    if (!inboundDomain) throw new Error("INBOUND_EMAIL_DOMAIN is not configured.");
    const recipients = [...(event.data.received_for ?? []), ...event.data.to];
    const inboxSlug = findInboxSlug(recipients, inboundDomain);
    if (!inboxSlug) return NextResponse.json({ ok: true, ignored: true });

    const user = await getUserByInboxSlug(inboxSlug);
    if (!user) return NextResponse.json({ ok: true, ignored: true });

    const result = await resend.emails.receiving.get(event.data.email_id);
    if (result.error || !result.data) {
      throw new Error(result.error?.message ?? "Could not retrieve received email.");
    }

    const newsletter = parseNewsletterEmail({
      html: result.data.html ?? null,
      text: result.data.text ?? null,
      subject: event.data.subject,
      from: event.data.from,
    });
    if (newsletter.content.length < 120) {
      throw new Error("Received email did not contain enough article text.");
    }

    const hash = contentHash(newsletter.content);
    const existing = await findExistingArticle({
      sourceUrl: newsletter.sourceUrl,
      contentHash: hash,
    });
    if (existing) {
      await attachArticleToUser(user.id, existing);
      return NextResponse.json({ ok: true, reused: true });
    }

    const summary = await summarizeArticle(newsletter.content);
    await saveArticle({
      userId: user.id,
      publicationName: newsletter.publicationName,
      publicationHostname: newsletter.publicationHostname,
      title: newsletter.title,
      author: newsletter.author,
      sourceUrl: newsletter.sourceUrl,
      contentHash: hash,
      summary,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await releaseWebhookEvent(eventId);
    console.error("inbound_processing_failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
