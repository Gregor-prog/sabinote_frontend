/**
 * Eligibility/competitiveness scoring for a single page.
 *
 * This does not predict rank — no model does. It scores the factors a site
 * owner actually controls: whether a crawler or answer-engine retriever can
 * reach, parse, and cite the page at all. G_gate is a hard pass/fail; if it
 * fails the page score collapses to zero regardless of F_i.
 */

export type FactorId =
  | "render"
  | "schema"
  | "semantic"
  | "answer"
  | "entity"
  | "freshness"
  | "aicrawl";

export type FactorScores = Partial<Record<FactorId, number>>;

export interface GateResult {
  passed: boolean;
  failures: string[];
}

export interface PageAudit {
  url: string;
  gate: GateResult;
  factors: FactorScores;
  score: number;
  auditedAt: string;
}

/** Default weights. F_authority is intentionally absent — it's not computable
 * from the page itself (backlinks/citations require an external index), so it
 * must not silently default to 0 inside a 0-1 weighted sum. Track it separately. */
export const DEFAULT_WEIGHTS: Record<FactorId, number> = {
  render: 0.2,
  answer: 0.25,
  schema: 0.2,
  semantic: 0.1,
  entity: 0.1,
  freshness: 0.05,
  aicrawl: 0.1,
};

export function scorePage(
  gate: GateResult,
  factors: FactorScores,
  weights: Record<FactorId, number> = DEFAULT_WEIGHTS
): number {
  if (!gate.passed) return 0;

  const total = (Object.keys(weights) as FactorId[]).reduce((sum, id) => {
    const f = factors[id] ?? 0;
    return sum + f * weights[id];
  }, 0);

  return Math.round(total * 1000) / 1000;
}

export function evaluateGate(input: {
  status: number;
  robotsBlocked: boolean;
  hasNoindex: boolean;
  canonicalSelf: boolean | null; // null = no canonical found
}): GateResult {
  const failures: string[] = [];

  if (input.status !== 200) failures.push(`non-200 status: ${input.status}`);
  if (input.robotsBlocked) failures.push("blocked by robots.txt");
  if (input.hasNoindex) failures.push("noindex present");
  if (input.canonicalSelf === false) failures.push("canonical points to a different URL");
  if (input.canonicalSelf === null) failures.push("no canonical tag found");

  return { passed: failures.length === 0, failures };
}
