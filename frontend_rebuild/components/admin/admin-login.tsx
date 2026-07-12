"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { adminLogin } from "@/lib/api";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);
    if (res.data?.token) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cj_admin_token", res.data.token);
      }
      router.push("/admin");
    } else {
      setError(res.error || "Could not sign in.");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-cream-50 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Logo className="justify-center" />
          <span className="eyebrow mt-6 block">Internal · admin only</span>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-balance">Sign in</h1>
          <p className="mt-2 text-sm text-ink-500">Manage events, review submissions, and watch analytics.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 rounded-lg border border-rule bg-paper p-6 shadow-paper">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-2 inline-block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 inline-block">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-xs text-ember-600">{error}</p>
            )}
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            <Lock className="h-4 w-4" />
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-xs text-ink-500 hover:text-ink transition-colors"
          >
            ← Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}
