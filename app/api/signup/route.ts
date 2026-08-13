import { NextResponse } from "next/server";
import { z } from "zod";

import { sendLoginEmail } from "@/lib/email";
import { createLoginToken, upsertUser } from "@/lib/repository";

const requestSchema = z.object({ email: z.email() });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const user = await upsertUser(parsed.data.email);
    const token = await createLoginToken(user.id);
    const result = await sendLoginEmail({ user, token });
    if (result.error) throw new Error(result.error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("signup_failed", error);
    return NextResponse.json(
      { message: "Margin is not ready to create addresses yet." },
      { status: 503 },
    );
  }
}
