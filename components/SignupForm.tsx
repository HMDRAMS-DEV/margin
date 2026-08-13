"use client";

import { FormEvent, useState } from "react";

export function SignupForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(body.message ?? "Could not create your address.");
      setStatus("sent");
      setMessage("Check your inbox.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not create your address.",
      );
    }
  }

  return (
    <form className="signupForm" onSubmit={submit}>
      <div className="signupControl">
        <label className="srOnly" htmlFor="signup-email">
          Your email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? "Creating…" : "Get my address"}
        </button>
      </div>
      <p
        className={`formStatus ${status === "error" ? "formError" : ""}`}
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
