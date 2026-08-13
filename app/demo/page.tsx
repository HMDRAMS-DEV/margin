import type { Metadata } from "next";

import { Feed } from "@/components/Feed";
import { demoArticles } from "@/lib/demo";

export const metadata: Metadata = { title: "Demo" };

export default function DemoPage() {
  return (
    <Feed
      demo
      inboxAddress="m-demo@in.margin.email"
      feed={{
        articles: demoArticles,
        page: 1,
        pageCount: 1,
        total: demoArticles.length,
      }}
    />
  );
}
