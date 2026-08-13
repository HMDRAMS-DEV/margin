import { Resend } from "resend";

import type { FeedArticle, User } from "@/lib/models";

export function resendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function fromAddress() {
  return process.env.MARGIN_FROM_EMAIL ?? "Margin <onboarding@resend.dev>";
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(content: string) {
  return `<div style="background:#f7f7f5;padding:32px 16px;color:#171716;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e1e1de;border-radius:16px;padding:32px"><div style="font-size:18px;font-weight:700;margin-bottom:32px">Margin<span style="color:#e13c31">.</span></div>${content}<p style="color:#777772;font-size:12px;margin:32px 0 0">One sentence. Three points. Ten details.</p></div></div>`;
}

export async function sendLoginEmail(input: {
  user: User;
  token: string;
}) {
  const verifyUrl = `${appUrl()}/auth/verify?token=${encodeURIComponent(input.token)}`;
  return resendClient().emails.send({
    from: fromAddress(),
    to: input.user.email,
    subject: "Your Margin address is ready",
    html: emailShell(`
      <h1 style="font-size:28px;line-height:1.15;letter-spacing:-0.03em;margin:0 0 12px">Your reading margin is ready.</h1>
      <p style="font-size:16px;line-height:1.55;color:#555550;margin:0 0 24px">Open Margin to copy your private newsletter address and start subscribing.</p>
      <a href="${verifyUrl}" style="display:inline-block;background:#171716;color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:600">Open Margin</a>
    `),
  });
}

export async function sendDigestEmail(input: {
  user: User;
  token: string;
  articles: FeedArticle[];
}) {
  const verifyUrl = `${appUrl()}/auth/verify?token=${encodeURIComponent(input.token)}`;
  const items = input.articles
    .map(
      (article) => `<div style="border-top:1px solid #e5e5e2;padding:20px 0">
        <div style="color:#777772;font-size:12px;margin-bottom:6px">${escapeHtml(article.publicationName)}</div>
        <div style="font-size:16px;line-height:1.5">${escapeHtml(article.oneSentence)}</div>
      </div>`,
    )
    .join("");

  return resendClient().emails.send({
    from: fromAddress(),
    to: input.user.email,
    subject: `${input.articles.length} things worth knowing this week`,
    html: emailShell(`
      <h1 style="font-size:28px;line-height:1.15;letter-spacing:-0.03em;margin:0 0 24px">This week, in one sentence each.</h1>
      ${items}
      <a href="${verifyUrl}" style="display:inline-block;background:#171716;color:#fff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:600;margin-top:8px">Explore the details</a>
    `),
  });
}
