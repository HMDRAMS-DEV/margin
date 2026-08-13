import Link from "next/link";

import { ArticleCard } from "@/components/ArticleCard";
import { CopyAddress } from "@/components/CopyAddress";
import { Logo } from "@/components/Logo";
import type { FeedPage } from "@/lib/models";

export function Feed({
  feed,
  inboxAddress,
  articleActions,
  demo = false,
}: {
  feed: FeedPage;
  inboxAddress: string;
  articleActions?: (publicationId: string, publicationName: string) => React.ReactNode;
  demo?: boolean;
}) {
  const today = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="feedPage">
      <header className="feedNav">
        <Logo />
        {demo ? (
          <Link className="navLink" href="/">
            Get your address
          </Link>
        ) : (
          <a
            className="navLink"
            href="https://github.com/HMDRAMS-DEV/margin"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
        )}
      </header>

      <section className="feedIntro">
        <p className="eyebrow">{today}</p>
        <h1>Your margin</h1>
        <p className="feedCount">
          {feed.total === 0
            ? "No issues yet."
            : `${feed.total} ${feed.total === 1 ? "issue" : "issues"}, ready when you are.`}
        </p>
        <div className="inboxBlock">
          <p>Use this address for newsletter subscriptions.</p>
          <CopyAddress address={inboxAddress} />
        </div>
      </section>

      <section className="timeline" aria-label="Newsletter summaries">
        {feed.articles.length ? (
          feed.articles.map((article) => (
            <ArticleCard
              article={article}
              key={article.id}
              actions={articleActions?.(
                article.publicationId,
                article.publicationName,
              )}
            />
          ))
        ) : (
          <div className="emptyState">
            <span className="emptyRule" aria-hidden="true" />
            <h2>Your next issue will appear here.</h2>
            <p>Subscribe with the address above. Margin handles the rest.</p>
          </div>
        )}
      </section>

      {feed.pageCount > 1 ? (
        <nav className="pagination" aria-label="Article pages">
          {feed.page > 1 ? <Link href={`?page=${feed.page - 1}`}>Newer</Link> : <span />}
          <span>
            {feed.page} / {feed.pageCount}
          </span>
          {feed.page < feed.pageCount ? (
            <Link href={`?page=${feed.page + 1}`}>Older</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}
