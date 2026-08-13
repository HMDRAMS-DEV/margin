import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Feed } from "@/components/Feed";
import { HidePublicationButton } from "@/components/HidePublicationButton";
import { currentUserId } from "@/lib/auth";
import { getUser, listFeed } from "@/lib/repository";
import { hidePublicationAction } from "./actions";

export const metadata: Metadata = { title: "Your margin" };

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const userId = await currentUserId();
  if (!userId) redirect("/");

  const user = await getUser(userId);
  if (!user) redirect("/");

  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const feed = await listFeed(user.id, Number.isFinite(page) ? page : 1);
  const inboundDomain = process.env.INBOUND_EMAIL_DOMAIN ?? "in.margin.email";

  return (
    <Feed
      feed={feed}
      inboxAddress={`${user.inboxSlug}@${inboundDomain}`}
      articleActions={(publicationId, publicationName) => (
        <HidePublicationButton
          action={hidePublicationAction}
          publicationId={publicationId}
          publicationName={publicationName}
        />
      )}
    />
  );
}
