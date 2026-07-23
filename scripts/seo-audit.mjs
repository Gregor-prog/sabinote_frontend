#!/usr/bin/env node
/**
 * G_gate + F_schema CI gate.
 *
 * Runs against an already-running server (`next start` / `next dev`).
 * Fetches each public route with a plain fetch — no JS execution — the same
 * vantage point a crawler with JS disabled gets. Any G_gate failure exits
 * non-zero and should fail the build.
 *
 * Usage: BASE_URL=http://localhost:3000 node scripts/seo-audit.mjs
 */

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PUBLIC_ROUTES = ["/"];
const PRIVATE_PATHS = [
  "/dashboard",
  "/generate",
  "/notes",
  "/resources",
  "/wallet",
  "/settings",
  "/admin",
  "/onboarding",
];

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : null;
}

function parseRobotsDisallow(robotsTxt) {
  return robotsTxt
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.toLowerCase().startsWith("disallow:"))
    .map((l) => l.split(":").slice(1).join(":").trim());
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: "manual" });
  const text = await res.text();
  return { status: res.status, text };
}

async function auditRoute(path, disallowRules) {
  const url = `${BASE_URL}${path}`;
  const failures = [];
  const warnings = [];

  const { status, text: html } = await fetchText(url);

  const robotsBlocked = disallowRules.some(
    (rule) => rule && (path === rule || path.startsWith(rule))
  );

  const robotsMeta = extractTag(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const hasNoindex = !!robotsMeta && /noindex/i.test(robotsMeta);

  const canonicalHref = extractTag(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  let canonicalSelf = null;
  if (canonicalHref) {
    canonicalSelf = new URL(canonicalHref, BASE_URL).pathname === path;
  }

  if (status !== 200) failures.push(`non-200 status: ${status}`);
  if (robotsBlocked) failures.push("blocked by robots.txt disallow rule");
  if (hasNoindex) failures.push("noindex meta present on a public route");
  if (canonicalHref === null) failures.push("no canonical tag found");
  else if (canonicalSelf === false)
    failures.push(`canonical points elsewhere: ${canonicalHref}`);

  // F_schema: JSON-LD must be present and parse as valid JSON.
  const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ldMatches.length === 0) {
    failures.push("no JSON-LD structured data found");
  } else {
    for (const m of ldMatches) {
      try {
        JSON.parse(m[1]);
      } catch {
        failures.push("JSON-LD present but failed to parse");
      }
    }
  }

  // F_render (warn only): rough proxy for "content in raw HTML vs JS-only".
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const visibleText = (bodyMatch?.[1] ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (visibleText.length < 200) {
    warnings.push(`low raw-HTML text content (${visibleText.length} chars) — check client-only rendering`);
  }

  return { path, status, failures, warnings };
}

async function main() {
  console.log(`SEO gate audit against ${BASE_URL}\n`);

  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  if (!robotsRes.ok) {
    console.error(`FAIL: /robots.txt returned ${robotsRes.status}`);
    process.exit(1);
  }
  const robotsTxt = await robotsRes.text();
  const disallowRules = parseRobotsDisallow(robotsTxt);

  for (const p of PRIVATE_PATHS) {
    const covered = disallowRules.some((rule) => rule.startsWith(p));
    if (!covered) {
      console.error(`FAIL: private path ${p} is not covered by a robots.txt disallow rule`);
      process.exitCode = 1;
    }
  }

  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!sitemapRes.ok) {
    console.error(`FAIL: /sitemap.xml returned ${sitemapRes.status}`);
    process.exitCode = 1;
  }

  let anyGateFailure = false;

  for (const path of PUBLIC_ROUTES) {
    const result = await auditRoute(path, disallowRules);
    const gatePassed = result.failures.length === 0;
    if (!gatePassed) anyGateFailure = true;

    console.log(`${gatePassed ? "PASS" : "FAIL"} ${path} (status ${result.status})`);
    for (const f of result.failures) console.log(`   ✗ ${f}`);
    for (const w of result.warnings) console.log(`   ! ${w}`);
  }

  if (anyGateFailure) {
    console.error("\nG_gate or F_schema failed on one or more public routes — failing build.");
    process.exit(1);
  }

  console.log("\nAll public routes passed the gate.");
}

main().catch((err) => {
  console.error("seo-audit crashed:", err);
  process.exit(1);
});
