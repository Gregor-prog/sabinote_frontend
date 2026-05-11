"use client";

import { useState } from "react";
import Link from "next/link";
import { IconSearch, IconPlus, IconList, IconFolder } from "@/components/icons";
import { useGetNotesQuery, useSearchNotesQuery } from "@/lib/services/notesApi";
import type { Note } from "@/lib/types";

const subjectBgMap: Record<string, string> = {
  Mathematics: "#F3F0FF",
  English: "#FFF7ED",
  Chemistry: "#F0FDFA",
  Physics: "#EFF6FF",
  Biology: "#F0FDF4",
  Civic: "#FFF1F2",
};
const subjectTextMap: Record<string, string> = {
  Mathematics: "#641BC4",
  English: "#EA580C",
  Chemistry: "#0D9488",
  Physics: "#2563EB",
  Biology: "#16A34A",
  Civic: "#E11D48",
};

function subjectBg(name: string) {
  const key = Object.keys(subjectBgMap).find(k => name.startsWith(k));
  return key ? subjectBgMap[key] : "#F3F4F6";
}
function subjectText(name: string) {
  const key = Object.keys(subjectTextMap).find(k => name.startsWith(k));
  return key ? subjectTextMap[key] : "#374151";
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
  const drafts = allNotes.filter(n => n.phase !== "complete").length;

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAFAFA" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Library</p>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-gray-900" style={{ fontSize: "1.6rem", letterSpacing: "-0.02em" }}>My notes</h2>
            <p className="text-sm text-gray-400">{complete} generated · {drafts} drafts</p>
          </div>
          <Link
            href="/generate"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "#641BC4" }}
          >
            <IconPlus /> New
          </Link>
        </div>
      </div>

      {/* Search + views */}
      <div className="px-5 mb-3 flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Search topics, subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-900 border border-gray-200 bg-white outline-none"
            onFocus={e => (e.target.style.borderColor = "#641BC4")}
            onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>
        <button
          onClick={() => setListView(!listView)}
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
        >
          <IconList />
        </button>
        <button
          onClick={() => setShowFolders(!showFolders)}
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-400 hover:text-gray-600"
        >
          <IconFolder />
        </button>
      </div>

      {/* Folders panel */}
      {showFolders && folderList.length > 0 && (
        <div className="mx-5 mb-3 rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-900 text-sm">Folders</span>
          </div>
          <div className="bg-white divide-y divide-gray-50">
            {folderList.map(f => (
              <button
                key={f.name}
                onClick={() => { setActiveSubject(f.name); setShowFolders(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F5F3FF" }}>
                    <span style={{ color: "#641BC4" }}><IconFolder className="w-3.5 h-3.5" /></span>
                  </div>
                  <span className="text-sm text-gray-700">{f.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="px-5 mb-4 overflow-x-auto scrollbar-hidden">
        <div className="flex gap-2 w-max">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={
                activeSubject === s
                  ? { background: "#641BC4", color: "white" }
                  : { background: "white", border: "1px solid #E5E7EB", color: "#374151" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid / list */}
      {displayNotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="font-display font-bold text-gray-900 text-lg mb-2">No notes found</h3>
          <p className="text-gray-500 text-sm mb-6">
            {search ? `No results for "${search}"` : "No notes in this folder yet"}
          </p>
          <Link href="/generate" className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#641BC4" }}>
            Generate Now →
          </Link>
        </div>
      ) : (
        <div className={`px-5 pb-4 ${listView ? "space-y-2" : "grid grid-cols-2 gap-3"}`}>
          {displayNotes.map(note =>
            listView ? (
              <Link key={note.noteId} href={`/notes/${note.noteId}`} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3" style={{ border: "1px solid #E5E7EB" }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: note.phase === "complete" ? "#10B981" : "#F59E0B" }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{note.topic}</p>
                  <p className="text-xs text-gray-400">{note.subjectName} · {note.classLevel} · {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">T{note.term} W{note.week}</span>
              </Link>
            ) : (
              <Link key={note.noteId} href={`/notes/${note.noteId}`} className="bg-white rounded-2xl overflow-hidden block" style={{ border: "1px solid #E5E7EB" }}>
                <div className="px-3 pt-3 pb-4" style={{ background: subjectBg(note.subjectName) }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold" style={{ color: subjectText(note.subjectName) }}>
                      WK {String(note.week).padStart(2, "0")}
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ background: note.phase === "complete" ? "#10B981" : "#F59E0B" }} />
                  </div>
                  <span className="text-base font-display font-bold" style={{ color: subjectText(note.subjectName) }}>
                    {note.subjectName}
                  </span>
                </div>
                <div className="px-3 py-3">
                  <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">{note.topic}</p>
                  <p className="text-xs text-gray-400">{note.classLevel} · {new Date(note.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
