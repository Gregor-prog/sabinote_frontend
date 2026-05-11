"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBack, IconBolt } from "@/components/icons";
import { useGetCurriculumStatesQuery, useGetCurriculumSubjectsQuery, useGetCurriculumWeeksQuery } from "@/lib/services/curriculumApi";
import { useGenerateLessonPlanMutation } from "@/lib/services/generateApi";
import { useGetMeQuery } from "@/lib/services/authApi";
import { useGetWalletQuery } from "@/lib/services/walletApi";
import { CLASS_LEVELS_UI } from "@/lib/constants";

const CLASSES = CLASS_LEVELS_UI;

// API uses "JSS1" format, UI shows "JSS 1"
const toApiClass = (c: string) => c.replace(" ", "");
const DURATIONS = [30, 40, 45, 60, 80];

export default function GeneratePage() {
  const router = useRouter();
  const { data: meData } = useGetMeQuery();
  const { data: walletData } = useGetWalletQuery();

  const [state, setState] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [term, setTerm] = useState(1);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [duration, setDuration] = useState(40);
  const [statusIdx, setStatusIdx] = useState(0);

  const profileState = meData?.data?.state ?? "";
  const resolvedState = state || profileState;

  const { data: statesData } = useGetCurriculumStatesQuery();

  const { data: subjectsData, isFetching: loadingSubjects } = useGetCurriculumSubjectsQuery(
    { state: resolvedState, classLevel: toApiClass(classLevel) },
    { skip: !resolvedState || !classLevel }
  );

  const { data: weeksData } = useGetCurriculumWeeksQuery(
    { state: resolvedState, subject, classLevel: toApiClass(classLevel), term },
    { skip: !resolvedState || !subject || !classLevel }
  );

  const [generateLessonPlan, { isLoading: generating }] = useGenerateLessonPlanMutation();

  const subjects = subjectsData?.data?.subjects ?? [];
  const weeks = weeksData?.data?.weeks ?? [];
  const balance = walletData?.data?.balance ?? "0";
  const planCost = 8;
  const canGenerate = Number(balance) >= planCost;

  const statusMessages = [
    `Connecting to ${resolvedState || "state"} curriculum database...`,
    "Fetching scheme of work...",
    "Structuring your Lesson Plan...",
  ];

  async function handleGenerate() {
    if (!selectedWeekId) return;
    try {
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % statusMessages.length;
        setStatusIdx(idx);
      }, 1400);
      const res = await generateLessonPlan({
        curriculumWeekId: selectedWeekId,
        durationMinutes: duration,
      }).unwrap();
      clearInterval(interval);
      router.push(`/notes/${res.data.noteId}`);
    } catch {
      // error handled by RTK
    }
  }

  if (generating) {
    return (
      <div className="flex flex-col min-h-full px-5 py-6" style={{ background: "#FAFAFA" }}>
        <div className="mb-8">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#EDE9FE" }}>
            <div className="h-full rounded-full animate-pulse" style={{ background: "#641BC4", width: "60%" }} />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl" style={{ background: "#F5F3FF" }}>
            ⚡
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#641BC4" }}>Generating</p>
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-3" style={{ letterSpacing: "-0.02em" }}>
            Building your Lesson Plan...
          </h2>
          <p className="text-gray-500 text-sm mb-8">{statusMessages[statusIdx]}</p>
          <div className="space-y-3">
            <div className="animate-shimmer h-4 w-3/4 rounded-lg" />
            <div className="animate-shimmer h-3 w-full rounded-lg" />
            <div className="animate-shimmer h-3 w-5/6 rounded-lg" />
            <div className="animate-shimmer h-3 w-4/6 rounded-lg" />
            <div className="mt-4 animate-shimmer h-4 w-1/2 rounded-lg" />
            <div className="animate-shimmer h-3 w-full rounded-lg" />
            <div className="animate-shimmer h-3 w-3/4 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAFAFA" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <Link href="/dashboard" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500">
          <IconBack />
        </Link>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">New Lesson</p>
          <h2 className="font-display font-bold text-gray-900 text-xl" style={{ letterSpacing: "-0.02em" }}>Configure your note</h2>
        </div>
      </div>

      <div className="px-5 pb-2">
        <p className="text-sm text-gray-400">Curriculum · {resolvedState || "Select your state below"}</p>
      </div>

      {/* Balance bar */}
      <div className="mx-5 mb-5 px-4 py-3 rounded-xl flex items-center gap-2" style={{ background: "#F5F3FF", border: "1px solid #EDE9FE" }}>
        <span className="text-base">🗂</span>
        <p className="text-sm font-medium" style={{ color: "#641BC4" }}>
          ₽{balance} · this generation costs ₽{planCost} (plan)
        </p>
      </div>

      <div className="px-5 space-y-5 flex-1 pb-36">
        {/* State */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">State Curriculum</p>
          <div className="relative">
            <select
              value={resolvedState}
              onChange={e => { setState(e.target.value); setSubject(""); setSelectedWeekId(null); }}
              className="w-full px-3 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none"
              onFocus={e => (e.target.style.borderColor = "#641BC4")}
              onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
            >
              <option value="">Select state...</option>
              {(statesData?.data?.states ?? []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          {profileState && !state && (
            <p className="text-xs mt-1" style={{ color: "#641BC4" }}>Using {profileState} from your profile</p>
          )}
        </div>

        {/* Class & Subject */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Class &amp; Subject</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
              <div className="relative">
                <select
                  value={classLevel}
                  onChange={e => { setClassLevel(e.target.value); setSubject(""); setSelectedWeekId(null); }}
                  className="w-full px-3 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="">Select...</option>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
              <div className="relative">
                <select
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setSelectedWeekId(null); }}
                  disabled={!classLevel || !resolvedState || loadingSubjects || subjects.length === 0}
                  className="w-full px-3 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none disabled:opacity-50"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="">
                    {loadingSubjects ? "Loading…" : !resolvedState ? "Select state first" : !classLevel ? "Select class first" : subjects.length === 0 ? "No subjects found" : "Select…"}
                  </option>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Term */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Term</p>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
            {[1, 2, 3].map(t => (
              <button
                key={t}
                onClick={() => { setTerm(t); setSelectedWeekId(null); }}
                className="py-2.5 rounded-lg text-sm font-medium transition-all"
                style={
                  term === t
                    ? { background: "white", color: "#641BC4", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                    : { color: "#6B7280" }
                }
              >
                Term {t}
              </button>
            ))}
          </div>
        </div>

        {/* Week & Topic */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Week &amp; Topic</p>
          {!subject || !classLevel ? (
            <div className="rounded-xl p-4 text-sm text-gray-400 text-center" style={{ background: "white", border: "1px solid #E5E7EB" }}>
              Select class and subject to see topics
            </div>
          ) : weeks.length === 0 ? (
            <div className="rounded-xl p-4 text-sm text-gray-400 text-center" style={{ background: "white", border: "1px solid #E5E7EB" }}>
              Loading curriculum...
            </div>
          ) : (
            <div className="space-y-2">
              {weeks.map(w => (
                <button
                  key={w.curriculumWeekId}
                  onClick={() => setSelectedWeekId(w.curriculumWeekId)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                  style={
                    selectedWeekId === w.curriculumWeekId
                      ? { background: "#641BC4", border: "1px solid #641BC4" }
                      : { background: "white", border: "1px solid #E5E7EB" }
                  }
                >
                  <span
                    className="text-xs font-mono font-semibold w-6 shrink-0"
                    style={{ color: selectedWeekId === w.curriculumWeekId ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}
                  >
                    {String(w.week).padStart(2, "0")}
                  </span>
                  <span
                    className="text-sm font-medium flex-1"
                    style={{ color: selectedWeekId === w.curriculumWeekId ? "white" : "#374151" }}
                  >
                    {w.topic}
                  </span>
                  {selectedWeekId === w.curriculumWeekId && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duration</p>
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={
                  duration === d
                    ? { background: "#641BC4", color: "white" }
                    : { background: "white", border: "1px solid #E5E7EB", color: "#374151" }
                }
              >
                {d} min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky generate CTA */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-107.5 px-5 py-4 lg:hidden"
        style={{ background: "white", borderTop: "1px solid #E5E7EB" }}
      >
        <GenerateCTA canGenerate={canGenerate} selectedWeekId={selectedWeekId} onGenerate={handleGenerate} />
      </div>

      {/* Desktop CTA */}
      <div className="hidden lg:block px-5 pb-8">
        <GenerateCTA canGenerate={canGenerate} selectedWeekId={selectedWeekId} onGenerate={handleGenerate} />
      </div>
    </div>
  );
}

function GenerateCTA({
  canGenerate,
  selectedWeekId,
  onGenerate,
}: {
  canGenerate: boolean;
  selectedWeekId: string | null;
  onGenerate: () => void;
}) {
  return (
    <>
      <button
        onClick={onGenerate}
        disabled={!selectedWeekId || !canGenerate}
        className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
        style={{ background: "#641BC4" }}
      >
        <IconBolt className="w-5 h-5" />
        Generate Lesson Plan
        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,255,255,0.2)" }}>
          ₽8
        </span>
      </button>
      {!canGenerate && (
        <p className="text-xs text-center mt-2" style={{ color: "#EF4444" }}>
          ⚠ Insufficient balance.{" "}
          <Link href="/wallet" style={{ color: "#641BC4" }}>Top Up Wallet →</Link>
        </p>
      )}
      {canGenerate && (
        <p className="text-xs text-center mt-2 text-gray-400">
          Plan ₽8 + Note ₽12 = ₽20 total · Plan first, refine, then Note
        </p>
      )}
    </>
  );
}
