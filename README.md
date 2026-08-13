# Margin

Margin gives every reader a private newsletter address and turns each issue into three progressive summaries: one sentence, three points, and ten details.

**[Try the demo](https://margin.ramihmd.com/demo)**

## How it works

1. A reader signs in through a one-time email link and gets a unique inbound address.
2. They use that address when subscribing to newsletters such as Substack.
3. Resend sends received-email webhooks to Margin. Margin verifies the signature and retrieves the email body.
4. The article is deduplicated by canonical URL or content hash, then summarized once with Groq's `openai/gpt-oss-120b` model.
5. A daily Vercel cron sends each active reader one digest when seven days have elapsed.

The dashboard reveals each article progressively. Hiding a publication only removes it from Margin; it does not unsubscribe the inbound address at the publisher.

## Privacy and security

- Margin holds newsletter bodies in memory only long enough to summarize and does not persist them. The configured email provider may retain received mail under its own storage policy.
- Summaries are shared by canonical article URL so the same issue is not processed repeatedly.
- Sessions are signed, HTTP-only, secure cookies.
- Login links expire after 30 minutes and can be used once.
- Inbound webhooks are signature-verified and idempotent.
- Every feed and hide query is scoped to the authenticated user.
- Security headers deny framing, browser sensors, and cross-origin scripts.

Margin does not bypass publisher access controls. It summarizes newsletter content delivered to an address the reader controls.

## Stack

Next.js 16, React 19, Postgres, Resend, Groq, Zod, Vitest, Playwright, and Vercel Cron.

## Run locally

Requires Node.js 24.

```sh
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Create a Postgres database and configure a Resend receiving domain. Point an `email.received` webhook at `/api/inbound` and copy its signing secret into `RESEND_WEBHOOK_SECRET`.

## Verify

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm audit --audit-level=high
```

## Deploy

Deploy the repository to Vercel, add the environment variables from `.env.example`, run `npm run db:migrate` against production Postgres, then configure the Resend webhook. `vercel.json` registers the daily digest cron.

## License

[MIT](LICENSE)
