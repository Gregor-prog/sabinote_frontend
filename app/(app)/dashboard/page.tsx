"use client";

import Link from "next/link";
import { IconBolt, IconDownload, IconLibrary } from "@/components/icons";
import { useGetMeQuery } from "@/lib/services/authApi";
import { useGetNotesQuery } from "@/lib/services/notesApi";
import { useGetWalletQuery } from "@/lib/services/walletApi";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "subject-math",
  English: "subject-english",
  Chemistry: "subject-chemistry",
  Biology: "subject-bio",
  Physics: "subject-physics",
};

export default function DashboardPage() {
  const { data: meData } = useGetMeQuery();
  const { data: notesData } = useGetNotesQuery({ limit: 3 });
  const { data: walletData } = useGetWalletQuery();

  const user = meData?.data;
  const recentNotes = notesData?.data?.notes ?? [];
  const total = notesData?.data?.pagination?.total ?? 0;
  const balance = walletData?.data?.balance ?? "0";

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--color-surface)" }}>

      {/* ── Header ── */}
      <div className="px-5 pt-7 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--color-text-muted)" }}>
          {greeting()}
        </p>
        <h1
          className="font-display font-bold text-gray-900 leading-none"
          style={{ fontSize: "2rem", letterSpacing: "-0.03em" }}
        >
          {user?.firstName ?? "Teacher"}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          {total > 0
            ? `${total} note${total !== 1 ? "s" : ""} generated · ₽${balance} balance`
            : "Ready to generate your first lesson note"}
        </p>
      </div>

      {/* ── Primary CTA ── */}
      <div className="px-5 mb-6">
        <Link
          href="/generate"
          className="group flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all"
          style={{
            background: "oklch(40% 0.22 290)",
            boxShadow: "0 4px 24px oklch(40% 0.22 290 / 0.28)",
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <IconBolt className="text-white w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-snug">Generate lesson note</p>
              <p className="text-white/60 text-xs mt-0.5">₽8 plan · ₽12 note</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeOpacity="0.7"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>
      </div>

      {/* ── Stats strip ── */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Notes", value: String(total) },
            { label: "Balance", value: `₽${balance}`, href: "/wallet" },
            {
              label: "Time saved",
              value: total > 0 ? `~${Math.round(total * 0.5)}h` : "—",
            },
          ].map((s, i) => (
            <div key={i} className="rounded-xl px-3 py-3" style={{ background: "white", border: "1px solid var(--color-border)" }}>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
              {s.href ? (
                <Link href={s.href} className="font-display font-bold text-lg leading-none" style={{ color: "oklch(40% 0.22 290)" }}>
                  {s.value}
                </Link>
              ) : (
                <p className="font-display font-bold text-lg leading-none text-gray-900">{s.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent notes ── */}
      <div className="px-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-gray-900 text-sm">Recent notes</h2>
          <Link href="/notes" className="text-xs font-medium flex items-center gap-1" style={{ color: "oklch(40% 0.22 290)" }}>
            <IconLibrary className="w-3.5 h-3.5" />
            Library
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="rounded-2xl py-10 px-6 text-center" style={{ border: "1px solid var(--color-border)", background: "white" }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--color-primary-dim)" }}
            >
              <IconBolt className="w-5 h-5" style={{ color: "oklch(40% 0.22 290)" }} />
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">No notes yet</p>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>Generate your first curriculum-aligned lesson note</p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl text-white"
              style={{ background: "oklch(40% 0.22 290)" }}
            >
              <IconBolt className="w-3.5 h-3.5" />
              Generate now
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 pb-6">
            {recentNotes.map((note) => (
              <div key={note.noteId} className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                {/* Subject color band */}
                <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${SUBJECT_COLORS[note.subjectName] ?? "subject-default"}`}>
                    {note.subjectName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={
                        note.phase === "complete"
                          ? { background: "#ECFDF5", color: "#059669" }
                          : { background: "#FFFBEB", color: "#B45309" }
                      }
                    >
                      {note.phase === "complete" ? "Complete" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-3.5">
                  <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">{note.topic}</p>
                  <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                    {note.classLevel} · Term {note.term} · Week {note.week} · {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/notes/${note.noteId}`}
                      className="flex-1 text-center text-xs font-semibold py-2 rounded-lg transition-colors"
                      style={{ background: "var(--color-primary-dim)", color: "oklch(40% 0.22 290)" }}
                    >
                      Open canvas
                    </Link>
                    <button
                      aria-label="Download note"
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-gray-100"
                      style={{ background: "var(--color-border)", color: "var(--color-text-muted)" }}
                    >
                      <IconDownload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
