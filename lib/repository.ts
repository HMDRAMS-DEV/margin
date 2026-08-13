import { createHash, randomBytes, randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import type { FeedArticle, FeedPage, User } from "@/lib/models";
import type { ProgressiveSummary } from "@/lib/summarize";

type UserRow = {
  id: string;
  email: string;
  inbox_slug: string;
};

type FeedRow = {
  id: string;
  title: string;
  author: string | null;
  publication_id: string;
  publication_name: string;
  source_url: string | null;
  received_at: Date;
  one_sentence: string;
  three_points: string[];
  ten_points: string[];
};

function mapUser(row: UserRow): User {
  return { id: row.id, email: row.email, inboxSlug: row.inbox_slug };
}

function mapFeedArticle(row: FeedRow): FeedArticle {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    publicationId: row.publication_id,
    publicationName: row.publication_name,
    sourceUrl: row.source_url,
    receivedAt: new Date(row.received_at),
    oneSentence: row.one_sentence,
    threePoints: row.three_points,
    tenPoints: row.ten_points,
  };
}

export function contentHash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export async function upsertUser(email: string): Promise<User> {
  const sql = db();
  const normalizedEmail = email.trim().toLowerCase();
  const inboxSlug = `m-${randomBytes(6).toString("base64url").toLowerCase()}`;
  const [row] = await sql<UserRow[]>`
    INSERT INTO users (id, email, inbox_slug)
    VALUES (${randomUUID()}, ${normalizedEmail}, ${inboxSlug})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, email, inbox_slug
  `;
  return mapUser(row);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createLoginToken(userId: string) {
  const sql = db();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await sql`
    INSERT INTO login_tokens (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expiresAt})
  `;
  return token;
}

export async function consumeLoginToken(token: string): Promise<User | null> {
  const sql = db();
  const [row] = await sql<UserRow[]>`
    WITH consumed AS (
      UPDATE login_tokens
      SET used_at = now()
      WHERE token_hash = ${hashToken(token)}
        AND used_at IS NULL
        AND expires_at > now()
      RETURNING user_id
    )
    SELECT users.id, users.email, users.inbox_slug
    FROM users
    JOIN consumed ON consumed.user_id = users.id
  `;
  return row ? mapUser(row) : null;
}

export async function getUser(userId: string): Promise<User | null> {
  const [row] = await db()<UserRow[]>`
    SELECT id, email, inbox_slug FROM users WHERE id = ${userId}
  `;
  return row ? mapUser(row) : null;
}

export async function getUserByInboxSlug(slug: string): Promise<User | null> {
  const [row] = await db()<UserRow[]>`
    SELECT id, email, inbox_slug FROM users WHERE inbox_slug = ${slug}
  `;
  return row ? mapUser(row) : null;
}

export async function claimWebhookEvent(eventId: string) {
  const rows = await db()`
    INSERT INTO webhook_events (id)
    VALUES (${eventId})
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  return rows.length === 1;
}

export async function releaseWebhookEvent(eventId: string) {
  await db()`DELETE FROM webhook_events WHERE id = ${eventId}`;
}

export async function findExistingArticle(input: {
  sourceUrl: string | null;
  contentHash: string;
}) {
  const dedupeKey = input.sourceUrl
    ? `url:${input.sourceUrl}`
    : `content:${input.contentHash}`;
  const [row] = await db()<Array<{ id: string; publication_id: string }>>`
    SELECT id, publication_id FROM articles WHERE dedupe_key = ${dedupeKey}
  `;
  return row ?? null;
}

export async function attachArticleToUser(
  userId: string,
  article: { id: string; publication_id: string },
) {
  const sql = db();
  await Promise.all([
    sql`
      INSERT INTO subscriptions (user_id, publication_id, hidden)
      VALUES (${userId}, ${article.publication_id}, false)
      ON CONFLICT (user_id, publication_id) DO NOTHING
    `,
    sql`
      INSERT INTO user_articles (user_id, article_id)
      VALUES (${userId}, ${article.id})
      ON CONFLICT (user_id, article_id) DO NOTHING
    `,
  ]);
}

export async function saveArticle(input: {
  userId: string;
  publicationName: string;
  publicationHostname: string;
  title: string;
  author: string | null;
  sourceUrl: string | null;
  contentHash: string;
  summary: ProgressiveSummary;
}) {
  const sql = db();
  const [publication] = await sql<Array<{ id: string }>>`
    INSERT INTO publications (id, name, hostname)
    VALUES (${randomUUID()}, ${input.publicationName}, ${input.publicationHostname})
    ON CONFLICT (hostname) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  const dedupeKey = input.sourceUrl
    ? `url:${input.sourceUrl}`
    : `content:${input.contentHash}`;

  await sql`
    INSERT INTO articles (
      id, publication_id, title, author, source_url, dedupe_key,
      content_hash, one_sentence, three_points, ten_points
    )
    VALUES (
      ${randomUUID()}, ${publication.id}, ${input.title}, ${input.author},
      ${input.sourceUrl}, ${dedupeKey}, ${input.contentHash},
      ${input.summary.oneSentence}, ${sql.json(input.summary.threePoints)},
      ${sql.json(input.summary.tenPoints)}
    )
    ON CONFLICT (dedupe_key) DO NOTHING
  `;

  const [article] = await sql<Array<{ id: string; publication_id: string }>>`
    SELECT id, publication_id FROM articles WHERE dedupe_key = ${dedupeKey}
  `;
  await attachArticleToUser(input.userId, article);
  return article.id;
}

export async function listFeed(
  userId: string,
  requestedPage = 1,
  pageSize = 12,
): Promise<FeedPage> {
  const sql = db();
  const [{ count }] = await sql<Array<{ count: number }>>`
    SELECT count(*)::int AS count
    FROM user_articles ua
    JOIN articles a ON a.id = ua.article_id
    JOIN subscriptions s
      ON s.user_id = ua.user_id AND s.publication_id = a.publication_id
    WHERE ua.user_id = ${userId} AND s.hidden = false
  `;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const rows = await sql<FeedRow[]>`
    SELECT
      a.id, a.title, a.author, a.publication_id,
      p.name AS publication_name, a.source_url, ua.received_at,
      a.one_sentence, a.three_points, a.ten_points
    FROM user_articles ua
    JOIN articles a ON a.id = ua.article_id
    JOIN publications p ON p.id = a.publication_id
    JOIN subscriptions s
      ON s.user_id = ua.user_id AND s.publication_id = a.publication_id
    WHERE ua.user_id = ${userId} AND s.hidden = false
    ORDER BY ua.received_at DESC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;

  return { articles: rows.map(mapFeedArticle), page, pageCount, total: count };
}

export async function hidePublication(userId: string, publicationId: string) {
  await db()`
    UPDATE subscriptions
    SET hidden = true
    WHERE user_id = ${userId} AND publication_id = ${publicationId}
  `;
}

export async function usersDueForDigest() {
  const rows = await db()<UserRow[]>`
    SELECT DISTINCT u.id, u.email, u.inbox_slug
    FROM users u
    JOIN user_articles ua ON ua.user_id = u.id
    JOIN articles a ON a.id = ua.article_id
    JOIN subscriptions s
      ON s.user_id = u.id AND s.publication_id = a.publication_id
    WHERE ua.digest_sent_at IS NULL
      AND s.hidden = false
      AND (u.last_digest_at IS NULL OR u.last_digest_at < now() - interval '6 days')
  `;
  return rows.map(mapUser);
}

export async function listUnsentArticles(userId: string, limit = 25) {
  const rows = await db()<FeedRow[]>`
    SELECT
      a.id, a.title, a.author, a.publication_id,
      p.name AS publication_name, a.source_url, ua.received_at,
      a.one_sentence, a.three_points, a.ten_points
    FROM user_articles ua
    JOIN articles a ON a.id = ua.article_id
    JOIN publications p ON p.id = a.publication_id
    JOIN subscriptions s
      ON s.user_id = ua.user_id AND s.publication_id = a.publication_id
    WHERE ua.user_id = ${userId}
      AND ua.digest_sent_at IS NULL
      AND s.hidden = false
    ORDER BY ua.received_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapFeedArticle);
}

export async function markDigestSent(userId: string, articleIds: string[]) {
  const sql = db();
  if (!articleIds.length) return;
  await sql.begin(async (transaction) => {
    await transaction`
      UPDATE user_articles
      SET digest_sent_at = now()
      WHERE user_id = ${userId} AND article_id IN ${transaction(articleIds)}
    `;
    await transaction`
      UPDATE users SET last_digest_at = now() WHERE id = ${userId}
    `;
  });
}
