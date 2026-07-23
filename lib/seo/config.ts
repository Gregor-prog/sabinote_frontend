export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://sabinote.app";

export const SITE_NAME = "SabiNote";

export const SITE_DESCRIPTION =
  "Generate NERDC-compliant, curriculum-aligned lesson notes in seconds. Built for Nigerian teachers.";

/** Route segments that require auth and must never be indexed. */
export const PRIVATE_PATHS = [
  "/dashboard",
  "/generate",
  "/notes",
  "/resources",
  "/wallet",
  "/settings",
  "/admin",
  "/onboarding",
] as const;

/**
 * Publicly indexable, content-bearing routes — sitemap entries and the CI
 * gate audit both walk this list. Auth pages (/auth/login, /auth/register)
 * are deliberately excluded: they're crawlable utility pages, not content
 * worth competing to rank, so they carry no canonical/schema investment.
 */
export const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [{ path: "/", changeFrequency: "weekly", priority: 1 }];

/** Bots explicitly allowed for AI answer-engine retrieval (GEO). */
export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "ChatGPT-User",
  "CCBot",
] as const;
