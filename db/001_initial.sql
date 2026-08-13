CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  inbox_slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_digest_at timestamptz
);

CREATE TABLE IF NOT EXISTS login_tokens (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  hostname text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY,
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text,
  source_url text,
  dedupe_key text NOT NULL UNIQUE,
  content_hash text NOT NULL,
  one_sentence text NOT NULL,
  three_points jsonb NOT NULL,
  ten_points jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, publication_id)
);

CREATE TABLE IF NOT EXISTS user_articles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  received_at timestamptz NOT NULL DEFAULT now(),
  digest_sent_at timestamptz,
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_articles_feed_idx
  ON user_articles (user_id, received_at DESC);

CREATE INDEX IF NOT EXISTS user_articles_digest_idx
  ON user_articles (user_id, digest_sent_at, received_at DESC);
