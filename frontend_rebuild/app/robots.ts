import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// AI search engines + traditional crawlers we explicitly allow.
// Per GEO best practices, being cited by ChatGPT/Perplexity/Gemini/Claude
// is the new "ranking #1" — we don't block these bots.
const AI_BOTS = [
  "GPTBot",            // OpenAI crawler
  "ChatGPT-User",      // ChatGPT browsing
  "ClaudeBot",         // Anthropic Claude
  "anthropic-ai",      // Anthropic alternate
  "PerplexityBot",     // Perplexity
  "Google-Extended",   // Gemini + Vertex AI training
  "Applebot-Extended", // Apple Intelligence
  "cohere-ai",         // Cohere
  "CCBot",             // Common Crawl (feeds most LLMs)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule — everyone can crawl public pages, admin is private.
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Explicitly enumerate AI bots (defensive — many already match "*",
      // but listing them improves signal for AI platforms that prefer it).
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/" as const,
        disallow: ["/admin", "/api/"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}