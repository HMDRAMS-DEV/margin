import { describe, expect, it } from "vitest";

import {
  buildSummaryPrompt,
  summarySchema,
} from "@/lib/summarize";

describe("summary contract", () => {
  it("requires exactly one sentence, three points, and ten details", () => {
    const parsed = summarySchema.parse({
      oneSentence: "Small teams win by shortening the distance between noticing and changing.",
      threePoints: ["Notice sooner.", "Change less.", "Repeat faster."],
      tenPoints: Array.from({ length: 10 }, (_, index) => `Point ${index + 1}.`),
    });

    expect(parsed.threePoints).toHaveLength(3);
    expect(parsed.tenPoints).toHaveLength(10);
  });

  it("asks for direct, plainspoken prose without invented claims", () => {
    const prompt = buildSummaryPrompt("An article body");

    expect(prompt).toContain("plainspoken");
    expect(prompt).toContain("Do not invent");
    expect(prompt).toContain("An article body");
  });
});
