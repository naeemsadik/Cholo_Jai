"use client";

import * as React from "react";
import { Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { subscribe, trackSubscribe } from "@/lib/api";

export function SubscribeForm({ className }: { className?: string }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const res = await subscribe(email);
    if (res.source === "live" || res.source === "fallback") {
      setStatus("success");
      setEmail("");
      trackSubscribe();
      toast({
        title: "You're on the list",
        description: "We'll send weekend picks to your inbox — no spam.",
        variant: "success",
      });
    } else {
      setStatus("error");
      toast({
        title: "Could not subscribe",
        description: res.error || "Please try again.",
        variant: "destructive",
      });
    }
  }

  if (status === "success") {
    return (
      <div className={className}>
        <div className="flex items-center gap-3 rounded-md border border-accent-100 bg-accent-50 px-4 py-3 text-accent-700">
          <Check className="h-4 w-4" />
          <p className="text-sm">Thanks — see you in your inbox on Friday.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label htmlFor="subscribe-email" className="sr-only">Email address</label>
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            id="subscribe-email"
            type="email"
            required
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 pl-10"
            disabled={status === "loading"}
          />
        </div>
        <Button type="submit" size="lg" disabled={status === "loading"}>
          {status === "loading" ? "Adding…" : "Get weekend picks"}
        </Button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-ember-600">
          Please enter a valid email and try again.
        </p>
      )}
    </form>
  );
}