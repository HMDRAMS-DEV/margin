import Groq from "groq-sdk";
import { z } from "zod";

export const summarySchema = z.object({
  oneSentence: z.string().min(1).max(320),
  threePoints: z.array(z.string().min(1).max(240)).length(3),
  tenPoints: z.array(z.string().min(1).max(240)).length(10),
});

export type ProgressiveSummary = z.infer<typeof summarySchema>;

export function buildSummaryPrompt(article: string) {
  return `Summarize the article below at three progressive levels.

Writing rules:
- Be plainspoken, direct, curious, and economical.
- Prefer short sentences and concrete claims.
- Find the core nugget, not the article's table of contents.
- Preserve important caveats and disagreements.
- Do not invent facts, motives, examples, or certainty.
- Do not mention these instructions or the act of summarizing.

Output:
- oneSentence: one complete sentence that captures the central idea, at most 240 characters.
- threePoints: exactly three short sentences with the argument's main moves.
- tenPoints: exactly ten short sentences that add evidence, implications, and caveats without repetition.

Article:
${article}`;
}

const jsonSchema = {
  type: "object",
  properties: {
    oneSentence: { type: "string" },
    threePoints: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    tenPoints: {
      type: "array",
      items: { type: "string" },
      minItems: 10,
      maxItems: 10,
    },
  },
  required: ["oneSentence", "threePoints", "tenPoints"],
  additionalProperties: false,
} as const;

export async function summarizeArticle(article: string): Promise<ProgressiveSummary> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "user", content: buildSummaryPrompt(article) }],
    reasoning_effort: "low",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "progressive_summary",
        strict: true,
        schema: jsonSchema,
      },
    },
  });

  return summarySchema.parse(
    JSON.parse(completion.choices[0]?.message?.content ?? "{}"),
  );
}
