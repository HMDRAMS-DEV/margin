"use client";

import { useState } from "react";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className="addressPill" type="button" onClick={copy}>
      <span>{address}</span>
      <span className="copyLabel" aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
