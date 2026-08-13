# Margin file index

This is the authoritative map of the project.

## Product surfaces

- `app/page.tsx`: public landing page and interactive summary example.
- `app/demo/page.tsx`: database-free dashboard demo.
- `app/dashboard/page.tsx`: authenticated, paginated reader feed.
- `components/ArticleCard.tsx`: one-sentence, three-point, and ten-point disclosure interaction.
- `components/Feed.tsx`: inbox address, timeline, publication actions, and pagination.
- `app/globals.css`: visual system and responsive behavior.

## Ingestion and delivery

- `app/api/inbound/route.ts`: verified Resend inbound-email processing.
- `lib/inbound.ts`: recipient routing and email-body extraction.
- `lib/article-url.ts`: canonical article-link extraction.
- `lib/summarize.ts`: Groq progressive-summary contract and prompt.
- `app/api/cron/digest/route.ts`: weekly-per-user digest dispatch.
- `lib/email.ts`: sign-in and digest email rendering.

## Accounts and data

- `app/api/signup/route.ts`: email sign-in request.
- `app/auth/verify/route.ts`: one-time token consumption and session creation.
- `lib/auth.ts` and `lib/session.ts`: signed cookie session handling.
- `lib/repository.ts`: account-scoped queries, deduplication, feed, and digest state.
- `db/001_initial.sql`: complete Postgres schema.
- `scripts/migrate.mjs`: migration runner.

## Verification and deployment

- `tests/`: pure unit tests for URLs, addresses, sessions, and summary shape.
- `e2e/`: Playwright landing and progressive-disclosure tests.
- `next.config.ts`: production security headers.
- `vercel.json`: daily Vercel Cron schedule.
- `.env.example`: required runtime configuration.
