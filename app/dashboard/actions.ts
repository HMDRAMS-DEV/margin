"use server";

import { revalidatePath } from "next/cache";

import { currentUserId } from "@/lib/auth";
import { hidePublication } from "@/lib/repository";

export async function hidePublicationAction(formData: FormData) {
  const userId = await currentUserId();
  const publicationId = formData.get("publicationId");
  if (!userId || typeof publicationId !== "string") return;

  await hidePublication(userId, publicationId);
  revalidatePath("/dashboard");
}
