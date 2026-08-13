"use client";

import { useState } from "react";

import type { FeedArticle } from "@/lib/models";

function Chevron({ direction = "down" }: { direction?: "down" | "up" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "up" ? "chevron up" : "chevron"}
      viewBox="0 0 16 16"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

export function ArticleCard({
  article,
  actions,
  featured = false,
}: {
  article: FeedArticle;
  actions?: React.ReactNode;
  featured?: boolean;
}) {
  const [depth, setDepth] = useState<1 | 2 | 3>(1);
  const date = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(article.receivedAt);

  return (
    <article className={`articleCard depth${depth} ${featured ? "featured" : ""}`}>
      <div className="depthRail" aria-hidden="true">
        <span className="railLine" />
        <span className="railDot active" />
        <span className={depth >= 2 ? "railDot active" : "railDot"} />
        <span className={depth >= 3 ? "railDot active" : "railDot"} />
      </div>
      <div className="articleBody">
        <div className="articleMeta">
          <span>{article.publicationName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.receivedAt.toISOString()}>{date}</time>
          {actions ? <div className="articleActions">{actions}</div> : null}
        </div>
        <h2>{article.title}</h2>
        <p className="oneSentence" data-testid="one-sentence">
          {article.oneSentence}
        </p>

        <div
          className="summaryLevel"
          data-testid="three-points"
          hidden={depth < 2}
        >
          <ol className="summaryList threeList">
            {article.threePoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        </div>

        <div
          className="summaryLevel"
          data-testid="ten-points"
          hidden={depth < 3}
        >
          <ol className="summaryList tenList">
            {article.tenPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        </div>

        <div className="articleFooter">
          {depth === 1 ? (
            <button
              className="deepenButton"
              type="button"
              onClick={() => setDepth(2)}
              aria-label="Show three key points"
            >
              Three points <Chevron />
            </button>
          ) : null}
          {depth === 2 ? (
            <button
              className="deepenButton"
              type="button"
              onClick={() => setDepth(3)}
              aria-label="Show ten details"
            >
              Ten details <Chevron />
            </button>
          ) : null}
          {depth === 3 ? (
            <>
              {article.sourceUrl ? (
                <a
                  className="readLink"
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read full article <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <button
                className="collapseButton"
                type="button"
                onClick={() => setDepth(1)}
                aria-label="Collapse summary"
              >
                <Chevron direction="up" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
