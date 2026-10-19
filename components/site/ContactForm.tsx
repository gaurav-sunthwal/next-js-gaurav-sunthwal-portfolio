"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setState("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setState("error");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Name</span>
          <input required value={form.name} onChange={update("name")} placeholder="Your name" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</span>
          <input required type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Subject</span>
        <input required value={form.subject} onChange={update("subject")} placeholder="What's this about?" className={field} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Message</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update("message")}
          placeholder="Tell me about your idea, timeline and budget."
          className={`${field} resize-y`}
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {state === "sent" && "Thanks! I'll get back to you soon."}
          {state === "error" && <span className="text-destructive">Couldn&apos;t send. Please email me directly.</span>}
        </p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
        >
          {state === "sending" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : state === "sent" ? (
            <Check className="size-4" />
          ) : (
            <Send className="size-4" />
          )}
          {state === "sending" ? "Sending…" : state === "sent" ? "Sent" : "Send message"}
        </button>
      </div>
    </form>
  );
}
