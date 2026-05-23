"use client";

import { useState } from "react";
import Link from "next/link";
import { IconSearch, IconPlus, IconList, IconFolder, IconBolt } from "@/components/icons";
import { useGetNotesQuery, useSearchNotesQuery } from "@/lib/services/notesApi";
import type { Note } from "@/lib/types";

const SUBJECT_BG: Record<string, string> = {
  Mathematics: "oklch(95% 0.03 290)",
  English:     "oklch(96% 0.04 50)",
  Chemistry:   "oklch(96% 0.04 175)",
  Physics:     "oklch(96% 0.04 240)",
  Biology:     "oklch(96% 0.04 145)",
  Civic:       "oklch(96% 0.04 15)",
};
const SUBJECT_TEXT: Record<string, string> = {
  Mathematics: "oklch(40% 0.22 290)",
  English:     "oklch(42% 0.2 50)",
  Chemistry:   "oklch(38% 0.18 175)",
  Physics:     "oklch(40% 0.2 240)",
  Biology:     "oklch(38% 0.18 145)",
  Civic:       "oklch(42% 0.2 15)",
};

function subjectBg(name: string) {
  const key = Object.keys(SUBJECT_BG).find(k => name.startsWith(k));
  return key ? SUBJECT_BG[key] : "var(--color-primary-dim)";
}
function subjectText(name: string) {
  const key = Object.keys(SUBJECT_TEXT).find(k => name.startsWith(k));
  return key ? SUBJECT_TEXT[key] : "oklch(40% 0.22 290)";
}

function StatusPill({ phase }: { phase: string }) {
  const complete = phase === "complete";
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={complete
        ? { background: "#ECFDF5", color: "#059669" }
        : { background: "#FFFBEB", color: "#B45309" }
      }
    >
      {complete ? "Complete" : "Draft"}
    </span>
  );
}

export default function NotesLibraryPage() {
  const [activeSubject, setActiveSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [listView, setListView] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [page] = useState(1);

  const { data: notesData } = useGetNotesQuery({
    page,
    limit: 50,
    subject: activeSubject !== "All" ? activeSubject : undefined,
  });
  const { data: searchData } = useSearchNotesQuery(
    { q: search },
    { skip: search.length < 2 }
  );

  const allNotes = notesData?.data?.notes ?? [];
  const displayNotes: Note[] = search.length >= 2 ? (searchData?.data?.notes ?? []) : allNotes;
  const subjects = ["All", ...Array.from(new Set(allNotes.map(n => n.subjectName)))];

  const folderCounts = allNotes.reduce<Record<string, number>>((acc, n) => {
    acc[n.subjectName] = (acc[n.subjectName] ?? 0) + 1;
    return acc;
  }, {});
  const folderList = Object.entries(folderCounts).map(([name, count]) => ({ name, count }));

  const complete = allNotes.filter(n => n.phase === "complete").length;
  const drafts   = allNotes.filter(n => n.phase !== "complete").length;

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--color-surface)" }}>

      {/* ── Header ── */}
      <div className="px-5 pt-7 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--color-text-muted)" }}>
          Library
        </p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-gray-900 leading-none" style={{ fontSize: "2rem", letterSpacing: "-0.03em" }}>
              My notes
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
              {complete > 0 || drafts > 0
                ? `${complete} complete · ${drafts} draft${drafts !== 1 ? "s" : ""}`
                : "No notes yet"}
            </p>
          </div>
          <Link
            href="/generate"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white text-xs font-semibold shrink-0"
            style={{ background: "oklch(40% 0.22 290)" }}
          >
            <IconPlus className="w-3.5 h-3.5" />
            New
          </Link>
        </div>
      </div>

      {/* ── Search + view toggles ── */}
      <div className="px-5 mb-3 flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }}>
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search topics, subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-900 border outline-none bg-white transition-shadow"
            style={{ borderColor: "var(--color-border)" }}
            onFocus={e => { e.target.style.borderColor = "oklch(40% 0.22 290)"; e.target.style.boxShadow = "0 0 0 3px oklch(40% 0.22 290 / 0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <button
          onClick={() => setListView(!listView)}
          aria-label={listView ? "Switch to grid view" : "Switch to list view"}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={listView
            ? { background: "var(--color-primary-dim)", color: "oklch(40% 0.22 290)", border: "1px solid var(--color-border)" }
            : { background: "white", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }
          }
        >
          <IconList className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowFolders(!showFolders)}
          aria-label="Toggle folders panel"
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={showFolders
            ? { background: "var(--color-primary-dim)", color: "oklch(40% 0.22 290)", border: "1px solid var(--color-border)" }
            : { background: "white", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }
          }
        >
          <IconFolder className="w-4 h-4" />
        </button>
      </div>

      {/* ── Folders panel ── */}
      {showFolders && folderList.length > 0 && (
        <div className="mx-5 mb-3 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <div className="bg-white px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <span className="text-sm font-semibold text-gray-900">Folders</span>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{folderList.length} subjects</span>
          </div>
          <div className="bg-white divide-y" style={{ "--tw-divide-opacity": 1, borderColor: "var(--color-border)" } as React.CSSProperties}>
            {folderList.map(f => (
              <button
                key={f.name}
                onClick={() => { setActiveSubject(f.name); setShowFolders(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-dim)" }}>
                    <IconFolder className="w-3.5 h-3.5" style={{ color: "oklch(40% 0.22 290)" }} />
                  </div>
                  <span className="text-sm text-gray-700">{f.name}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--color-text-muted)" }}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="px-5 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2 w-max">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={
                activeSubject === s
                  ? { background: "oklch(40% 0.22 290)", color: "white" }
                  : { background: "white", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {displayNotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-16">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--color-primary-dim)" }}
          >
            <IconBolt className="w-6 h-6" style={{ color: "oklch(40% 0.22 290)" }} />
          </div>
          <h3 className="font-display font-bold text-gray-900 mb-1.5" style={{ fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            {search ? "No results" : "No notes yet"}
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            {search
              ? `Nothing matched "${search}"`
              : "Generate your first curriculum-aligned lesson note"}
          </p>
          {!search && (
            <Link
              href="/generate"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl text-white"
              style={{ background: "oklch(40% 0.22 290)" }}
            >
              <IconBolt className="w-3.5 h-3.5" />
              Generate now
            </Link>
          )}
        </div>
      ) : listView ? (

        /* ── List view ── */
        <div className="px-5 pb-6 space-y-2">
          <div className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid var(--color-border)" }}>
            {displayNotes.map((note, i) => (
              <Link
                key={note.noteId}
                href={`/notes/${note.noteId}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                style={{ borderBottom: i < displayNotes.length - 1 ? "1px solid var(--color-border)" : undefined }}
              >
                <div
                  className="w-1.5 h-8 rounded-full shrink-0"
                  style={{ background: subjectText(note.subjectName) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate leading-snug">{note.topic}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {note.subjectName} · {note.classLevel} · {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>T{note.term} W{note.week}</span>
                  <StatusPill phase={note.phase} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (

        /* ── Grid view ── */
        <div className="px-5 pb-6 grid grid-cols-2 gap-3">
          {displayNotes.map(note => (
            <Link
              key={note.noteId}
              href={`/notes/${note.noteId}`}
              className="bg-white rounded-2xl overflow-hidden block"
              style={{ border: "1px solid var(--color-border)" }}
            >
              {/* Subject color header */}
              <div className="px-3 pt-3 pb-3.5" style={{ background: subjectBg(note.subjectName) }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold" style={{ color: subjectText(note.subjectName) }}>
                    WK {String(note.week).padStart(2, "0")}
                  </span>
                  <StatusPill phase={note.phase} />
                </div>
                <span
                  className="text-sm font-display font-bold leading-snug block"
                  style={{ color: subjectText(note.subjectName) }}
                >
                  {note.subjectName}
                </span>
              </div>
              {/* Card body */}
              <div className="px-3 py-3">
                <p className="font-semibold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{note.topic}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  {note.classLevel} · {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
