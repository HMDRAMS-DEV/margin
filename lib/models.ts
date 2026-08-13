export type User = {
  id: string;
  email: string;
  inboxSlug: string;
};

export type FeedArticle = {
  id: string;
  title: string;
  author: string | null;
  publicationId: string;
  publicationName: string;
  sourceUrl: string | null;
  receivedAt: Date;
  oneSentence: string;
  threePoints: string[];
  tenPoints: string[];
};

export type FeedPage = {
  articles: FeedArticle[];
  page: number;
  pageCount: number;
  total: number;
};
