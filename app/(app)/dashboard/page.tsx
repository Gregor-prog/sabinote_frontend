"use client";

import Link from "next/link";
import { IconBolt, IconDownload } from "@/components/icons";
import { useGetMeQuery } from "@/lib/services/authApi";
import { useGetNotesQuery } from "@/lib/services/notesApi";
import { useGetWalletQuery } from "@/lib/services/walletApi";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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

  const stats = [
    { label: "Wallet Balance", value: `₽${balance}`, sub: "Top up →", subHref: "/wallet", dark: true },
    { label: "Notes Generated", value: String(total), sub: "All time" },
    { label: "Subjects Covered", value: String(new Set(recentNotes.map(n => n.subjectName)).size || "—"), sub: "in recent notes" },
    { label: "Time Saved", value: total > 0 ? `~${Math.round(total * 0.5)}h` : "0h", sub: "Estimated" },
  ];

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAFAFA" }}>
      {/* Top greeting */}
      <div className="px-5 pt-6 pb-4">
        <h2
          className="font-display font-bold text-gray-900"
          style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}
        >
          {greeting()}, {user?.firstName ?? "Teacher"} 🌅
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">Ready to generate today's lesson notes?</p>
      </div>

      {/* Stats row */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={
              s.dark
                ? { background: "#641BC4" }
                : { background: "white", border: "1px solid #E5E7EB" }
            }
          >
            <p className={`text-xs font-medium mb-1 ${s.dark ? "text-white/60" : "text-gray-400"}`}>{s.label}</p>
            <p className={`font-display font-bold text-xl ${s.dark ? "text-white" : "text-gray-900"}`}>{s.value}</p>
            {s.subHref ? (
              <Link href={s.subHref} className={`text-xs font-medium ${s.dark ? "text-white/70" : "text-gray-400"}`}>{s.sub}</Link>
            ) : (
              <p className={`text-xs ${s.dark ? "text-white/60" : "text-gray-400"}`}>{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick generate band */}
      <div className="mx-5 mb-5 rounded-2xl p-4" style={{ background: "#F5F3FF", border: "1px solid #EDE9FE" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#641BC4" }}
            >
              <IconBolt className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Start a New Lesson Note</p>
              <p className="text-gray-500 text-xs">Select subject &amp; class to begin</p>
            </div>
          </div>
          <Link
            href="/generate"
            className="shrink-0 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "#641BC4" }}
          >
            Generate →
          </Link>
        </div>
      </div>

      {/* Recent notes */}
      <div className="px-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-gray-900 text-base">Recent Notes</h3>
          <Link href="/notes" className="text-xs font-medium" style={{ color: "#641BC4" }}>View All →</Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center" style={{ border: "1px solid #E5E7EB" }}>
            <p className="text-gray-400 text-sm">No notes yet. Generate your first one!</p>
            <Link href="/generate" className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: "#641BC4" }}>
              Generate Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {recentNotes.map((note) => (
              <div key={note.noteId} className="bg-white rounded-2xl p-4" style={{ border: "1px solid #E5E7EB" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${SUBJECT_COLORS[note.subjectName] ?? "subject-default"}`}>
                      {note.subjectName}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">· {note.classLevel}</span>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={
                      note.phase === "complete"
                        ? { background: "#ECFDF5", color: "#10B981" }
                        : { background: "#FFFBEB", color: "#F59E0B" }
                    }
                  >
                    {note.phase === "complete" ? "● Complete" : "● Draft"}
                  </span>
                </div>

                <p className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{note.topic}</p>
                <p className="text-xs text-gray-400 mb-3">
                  Term {note.term} · Wk {note.week} · {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/notes/${note.noteId}`}
                    className="flex-1 text-center text-xs font-semibold py-2 rounded-lg transition-colors"
                    style={{ background: "#F5F3FF", color: "#641BC4" }}
                  >
                    Open Canvas
                  </Link>
                  <button
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "#F3F4F6", color: "#6B7280" }}
                  >
                    <IconDownload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
