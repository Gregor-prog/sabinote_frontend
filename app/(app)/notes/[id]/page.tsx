"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IconBack, IconDots, IconBolt, IconDownload } from "@/components/icons";
import { useGetNoteQuery, useUpdateNoteMutation } from "@/lib/services/notesApi";
import { useGenerateLessonNoteMutation, useRegenerateMutation } from "@/lib/services/generateApi";
import { useGetWalletQuery } from "@/lib/services/walletApi";
import type { LessonPlan, LessonNote } from "@/lib/types";

// ── Floating Format Toolbar ──────────────────────────────────────────

function FormatToolbar() {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function update() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setPos(null);
        return;
      }
      let node: Node | null = sel.anchorNode;
      while (node) {
        if (node instanceof HTMLElement && node.contentEditable === "true") {
          const r = sel.getRangeAt(0).getBoundingClientRect();
          setPos({ top: r.top - 46, left: r.left + r.width / 2 });
          return;
        }
        node = node.parentNode;
      }
      setPos(null);
    }
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  if (!pos) return null;

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
  }

  const Btn = ({ label, cmd, val, title, style }: {
    label: React.ReactNode; cmd: string; val?: string; title: string; style?: string;
  }) => (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      className={`w-7 h-7 rounded flex items-center justify-center text-white hover:bg-white/20 transition-colors text-sm ${style ?? ""}`}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
      className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg shadow-2xl animate-scale-in"
    >
      <Btn label={<b>B</b>} cmd="bold" title="Bold (Ctrl+B)" />
      <Btn label={<em>I</em>} cmd="italic" title="Italic (Ctrl+I)" />
      <Btn label={<u>U</u>} cmd="underline" title="Underline (Ctrl+U)" />
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <Btn label="•≡" cmd="insertUnorderedList" title="Bullet list" />
      <Btn label="1." cmd="insertOrderedList" title="Numbered list" />
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <Btn
        label={<span className="text-[10px] font-mono">H</span>}
        cmd="formatBlock"
        val="h3"
        title="Heading"
      />
      <Btn
        label={<span className="text-[10px] font-mono">¶</span>}
        cmd="formatBlock"
        val="p"
        title="Paragraph"
      />
    </div>
  );
}

// ── Rich Text Editor ─────────────────────────────────────────────────

function Rich({
  value,
  onChange,
  placeholder = "Click to edit…",
  className = "",
  inline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string>("");
  const isFirst = useRef(true);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const html = value.includes("<") || value.includes("&amp;")
      ? value
      : value.replace(/\n/g, "<br>");

    if (isFirst.current) {
      isFirst.current = false;
      ref.current.innerHTML = html;
      lastHtml.current = ref.current.innerHTML;
      return;
    }
    if (value !== lastHtml.current) {
      lastHtml.current = html;
      ref.current.innerHTML = html;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onKeyDown={inline ? e => { if (e.key === "Enter") e.preventDefault(); } : undefined}
      onPaste={e => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      onInput={() => {
        if (!ref.current) return;
        const html = ref.current.innerHTML;
        lastHtml.current = html;
        onChange(html);
      }}
      className={`outline-none leading-relaxed text-gray-800 ${className}`}
    />
  );
}

// ── Editable List ────────────────────────────────────────────────────

function EditableList({
  items,
  onChange,
  numbered = false,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  numbered?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <span className="text-xs font-mono text-gray-300 mt-[3px] w-5 shrink-0 select-none">
            {numbered ? `${i + 1}.` : "•"}
          </span>
          <div className="flex-1">
            <Rich
              value={item}
              onChange={v => {
                const next = [...items];
                next[i] = v;
                onChange(next);
              }}
              inline
              placeholder="Add item…"
              className="text-sm text-gray-700 w-full min-h-[1.4rem] border-b border-transparent focus-within:border-purple-200 pb-0.5 transition-colors"
            />
          </div>
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-gray-200 hover:text-red-400 text-xs mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="text-xs font-medium mt-1 flex items-center gap-1"
        style={{ color: "#641BC4" }}
      >
        <span className="text-base leading-none">+</span> Add item
      </button>
    </div>
  );
}

// ── Document Section ─────────────────────────────────────────────────

function DocSection({
  num,
  title,
  children,
  accent,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-0">
      <div
        className="flex items-center gap-2 py-3 cursor-default select-none"
        style={{ borderTop: "1px solid #F3F4F6" }}
      >
        <span className="text-[10px] font-mono font-bold tracking-widest text-gray-300">{num}</span>
        <h3
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: accent ?? "#9CA3AF" }}
        >
          {title}
        </h3>
      </div>
      <div className="pb-5 pl-1">{children}</div>
    </div>
  );
}

// ── Metadata Strip ───────────────────────────────────────────────────

function MetaRow({ plan }: { plan: { metadata: LessonPlan["metadata"] } | null }) {
  if (!plan) return null;
  const m = plan.metadata;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-6 pb-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
      <span><strong className="text-gray-600">Subject</strong> {m.subject}</span>
      <span><strong className="text-gray-600">Class</strong> {m.classLevel}</span>
      <span><strong className="text-gray-600">Term</strong> {m.term}</span>
      <span><strong className="text-gray-600">Week</strong> {m.week}</span>
      <span><strong className="text-gray-600">Duration</strong> {m.duration} min</span>
      <span><strong className="text-gray-600">Session</strong> {m.session}</span>
    </div>
  );
}

// ── Plan Canvas ────────────────────────────────────────────────────────

function PlanCanvas({ plan, onChange }: { plan: LessonPlan; onChange: (p: LessonPlan) => void }) {
  const set = <K extends keyof LessonPlan>(key: K, val: LessonPlan[K]) =>
    onChange({ ...plan, [key]: val });

  return (
    <div className="text-[15px]">
      <MetaRow plan={plan} />

      <DocSection num="01" title="Behavioural Objectives">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Cognitive</p>
            <EditableList items={plan.objectives?.cognitive || []} onChange={v => set("objectives", { ...plan.objectives, cognitive: v })} numbered />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Affective</p>
            <EditableList items={plan.objectives?.affective || []} onChange={v => set("objectives", { ...plan.objectives, affective: v })} numbered />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Psychomotor</p>
            <EditableList items={plan.objectives?.psychomotor || []} onChange={v => set("objectives", { ...plan.objectives, psychomotor: v })} numbered />
          </div>
        </div>
      </DocSection>

      <DocSection num="02" title="Previous Knowledge">
        <Rich
          value={plan.previousKnowledge || ""}
          onChange={v => set("previousKnowledge", v)}
          placeholder="What have students already learned that connects to this topic?"
          className="text-sm min-h-[3rem] w-full"
        />
      </DocSection>

      <DocSection num="03" title="Entry Behaviour">
        <Rich
          value={plan.entryBehaviour || ""}
          onChange={v => set("entryBehaviour", v)}
          placeholder="Describe prior knowledge students should have…"
          className="text-sm min-h-[3rem] w-full"
        />
      </DocSection>

      <DocSection num="04" title="Instructional Materials">
        <EditableList items={plan.instructionalMaterials || []} onChange={v => set("instructionalMaterials", v)} />
      </DocSection>

      <DocSection num="05" title="Reference Books">
        <EditableList items={plan.referenceBooks || []} onChange={v => set("referenceBooks", v)} />
      </DocSection>

      <DocSection num="06" title="Presentation">
        <div className="space-y-4">
          {(plan.presentation || []).map((step, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#641BC4" }}>
                  Step {step.step}: {step.title}
                </span>
                <Rich
                  value={step.duration || ""}
                  onChange={v => {
                    const next = plan.presentation.map((s, j) =>
                      j === i ? { ...s, duration: v } : s
                    );
                    set("presentation", next);
                  }}
                  inline
                  className="text-xs text-gray-400 text-right"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Teacher Activity</p>
                  <Rich
                    value={step.teacherActivity || ""}
                    onChange={v => {
                      const next = plan.presentation.map((s, j) =>
                        j === i ? { ...s, teacherActivity: v } : s
                      );
                      set("presentation", next);
                    }}
                    className="text-sm min-h-[2rem] w-full"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Student Activity</p>
                  <Rich
                    value={step.studentActivity || ""}
                    onChange={v => {
                      const next = plan.presentation.map((s, j) =>
                        j === i ? { ...s, studentActivity: v } : s
                      );
                      set("presentation", next);
                    }}
                    className="text-sm min-h-[2rem] w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection num="07" title="Evaluation Questions">
        <EditableList items={plan.evaluation || []} onChange={v => set("evaluation", v)} numbered />
      </DocSection>

      <DocSection num="08" title="Summary">
        <Rich
          value={plan.summary || ""}
          onChange={v => set("summary", v)}
          placeholder="How will you wrap up the lesson?"
          className="text-sm min-h-[3rem] w-full"
        />
      </DocSection>

      <DocSection num="09" title="Assignment">
        <Rich
          value={plan.assignment || ""}
          onChange={v => set("assignment", v)}
          placeholder="What will students work on independently?"
          className="text-sm min-h-[3rem] w-full"
        />
      </DocSection>
    </div>
  );
}

// ── Note Canvas ────────────────────────────────────────────────────────

function NoteMetaRow({ note }: { note: LessonNote }) {
  const m = note.header;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-6 pb-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
      <span><strong className="text-gray-600">Subject</strong> {m?.subject}</span>
      <span><strong className="text-gray-600">Class</strong> {m?.classLevel}</span>
      <span><strong className="text-gray-600">Term</strong> {m?.term}</span>
      <span><strong className="text-gray-600">Week</strong> {m?.week}</span>
      <span><strong className="text-gray-600">Duration</strong> {m?.duration}</span>
    </div>
  );
}

function NoteCanvas({ note, onChange }: { note: LessonNote; onChange: (n: LessonNote) => void }) {
  const set = <K extends keyof LessonNote>(key: K, val: LessonNote[K]) =>
    onChange({ ...note, [key]: val });

  return (
    <div className="text-[15px]">
      <NoteMetaRow note={note} />

      <DocSection num="01" title="Presentation">
        <div className="space-y-5">
          {(note.presentation || []).map((step, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#641BC4" }}>
                  Step {step.step}: {step.title}
                </span>
                <Rich
                  value={step.duration || ""}
                  onChange={v => {
                    const next = note.presentation.map((s, j) => j === i ? { ...s, duration: v } : s);
                    set("presentation", next);
                  }}
                  inline
                  className="text-xs text-gray-400 text-right"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Teacher Narrative & Content</p>
                  <Rich
                    value={step.content || ""}
                    onChange={v => {
                      const next = note.presentation.map((s, j) => j === i ? { ...s, content: v } : s);
                      set("presentation", next);
                    }}
                    placeholder="What to say and explain in this step…"
                    className="text-sm min-h-[3rem] w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection num="02" title="Subject Content">
        <div className="space-y-5">
          {(note.subjectContent || []).map((section, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#641BC4" }}>
                {section.subTopic}
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Explanation</p>
                  <Rich
                    value={section.explanation || ""}
                    onChange={v => {
                      const next = note.subjectContent.map((s, j) => j === i ? { ...s, explanation: v } : s);
                      set("subjectContent", next);
                    }}
                    placeholder="Explain this sub-topic…"
                    className="text-sm min-h-[3rem] w-full"
                  />
                </div>

                {(section.workedExamples || []).length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Worked Examples</p>
                    <div className="space-y-2">
                      {section.workedExamples.map((ex, k) => (
                        <div key={k} className="rounded-lg p-3" style={{ background: "#F0F9FF", border: "1px solid #E0F2FE" }}>
                          <p className="text-xs font-semibold text-blue-800 mb-1">{ex.problem}</p>
                          <p className="text-xs text-blue-700 font-mono whitespace-pre-line leading-relaxed">{ex.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(section.keyPoints || []).length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Key Points</p>
                    <div className="rounded-lg px-3 py-2 space-y-1" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                      {section.keyPoints.map((line, k) => (
                        <p key={k} className="text-xs text-gray-700 flex items-start gap-2">
                          <span style={{ color: "#641BC4" }} className="font-bold shrink-0">→</span>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection num="03" title="Board Summary">
        <div className="rounded-lg px-4 py-3 space-y-2" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          {(note.boardSummary || []).map((line, i) => (
            <div key={i} className="text-sm text-gray-800 flex items-start gap-2">
               <span className="mt-[2px]" style={{ color: "#641BC4" }}>•</span>
               <Rich
                 value={line}
                 onChange={v => {
                   const next = [...note.boardSummary];
                   next[i] = v;
                   set("boardSummary", next);
                 }}
                 inline
                 className="w-full"
               />
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection num="04" title="Evaluation">
        <div className="space-y-3">
          {(note.evaluation || []).map((qa, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Q{i + 1}</p>
              <Rich
                value={qa.question || ""}
                onChange={v => {
                  const next = note.evaluation.map((x, j) => j === i ? { ...x, question: v } : x);
                  set("evaluation", next);
                }}
                className="text-sm text-gray-800 mb-3 w-full font-medium"
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Expected Answer</p>
              <Rich
                value={qa.expectedAnswer || ""}
                onChange={v => {
                  const next = note.evaluation.map((x, j) => j === i ? { ...x, expectedAnswer: v } : x);
                  set("evaluation", next);
                }}
                className="text-sm text-gray-600 w-full"
              />
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection num="05" title="Summary">
        <Rich
          value={note.summary || ""}
          onChange={v => set("summary", v)}
          placeholder="How does the lesson close?"
          className="text-sm min-h-[3rem] w-full"
        />
      </DocSection>

      <DocSection num="06" title="Assignment">
        <EditableList items={note.assignment || []} onChange={v => set("assignment", v)} numbered />
      </DocSection>
    </div>
  );
}

// ── Main Canvas Page ───────────────────────────────────────────────────

export default function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const { data: walletData } = useGetWalletQuery();

  const { data: noteData, isLoading } = useGetNoteQuery(id, { skip: !id });
  const [updateNote] = useUpdateNoteMutation();
  const [generateNote, { isLoading: generatingNote }] = useGenerateLessonNoteMutation();
  const [regenerate, { isLoading: regenerating }] = useRegenerateMutation();

  const note = noteData?.data;

  const [phase, setPhase] = useState<"plan" | "note">("plan");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [lessonNote, setLessonNote] = useState<LessonNote | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showMenu, setShowMenu] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState("");
  const [showExport, setShowExport] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (note && !initialized.current) {
      if (note.lessonPlanContent) setPlan(note.lessonPlanContent);
      if (note.lessonNoteContent) {
        setLessonNote(note.lessonNoteContent);
        if (note.phase === "complete") setPhase("note");
      }
      initialized.current = true;
    }
  }, [note]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(
    (field: "lessonPlanContent" | "lessonNoteContent", value: LessonPlan | LessonNote) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("saving");
      saveTimer.current = setTimeout(async () => {
        try {
          await updateNote({ noteId: id, [field]: value }).unwrap();
          setSaveStatus("saved");
        } catch {
          setSaveStatus("idle");
        }
      }, 1500);
    },
    [id, updateNote]
  );

  function handlePlanChange(updated: LessonPlan) {
    setPlan(updated);
    scheduleSave("lessonPlanContent", updated);
  }

  function handleNoteChange(updated: LessonNote) {
    setLessonNote(updated);
    scheduleSave("lessonNoteContent", updated);
  }

  async function handleGenerateNote() {
    if (!plan) return;
    try {
      const res = await generateNote({ noteId: id, editedLessonPlan: plan }).unwrap();
      setLessonNote(res.data.lessonNote);
      setPhase("note");
    } catch {/* noop */}
  }

  async function handleRegenerate() {
    try {
      const res = await regenerate({
        noteId: id,
        phase,
        additionalInstructions: regenInstructions || undefined,
      }).unwrap();
      if (phase === "plan") {
        setPlan(res.data.content as LessonPlan);
      } else {
        setLessonNote(res.data.content as LessonNote);
      }
      setShowRegenerate(false);
      setShowMenu(false);
      setRegenInstructions("");
    } catch {/* noop */}
  }

  async function handleExport(format: "pdf" | "docx") {
    try {
      const token = localStorage.getItem("sabi_access");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/export/${id}/${format}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note?.topic ?? "lesson"}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {/* noop */}
    setShowExport(false);
  }

  if (isLoading || !note) {
    return (
      <div className="flex flex-col min-h-full bg-white px-5 py-8 space-y-4">
        <div className="animate-shimmer h-5 w-1/3 rounded-lg" />
        <div className="animate-shimmer h-3 w-full rounded-lg" />
        <div className="animate-shimmer h-3 w-5/6 rounded-lg" />
        <div className="animate-shimmer h-3 w-4/6 rounded-lg" />
        <div className="mt-6 animate-shimmer h-3 w-full rounded-lg" />
        <div className="animate-shimmer h-3 w-5/6 rounded-lg" />
      </div>
    );
  }

  const balance = Number(walletData?.data?.balance ?? 0);
  const canGenerateNote = balance >= 12;
  const hasNote = !!lessonNote;

  return (
    <div className="flex flex-col min-h-full bg-white">
      <FormatToolbar />

      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0 sticky top-0 z-10 bg-white"
        style={{ borderBottom: "1px solid #F3F4F6" }}
      >
        <Link href="/notes" className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-lg hover:bg-gray-100 shrink-0">
          <IconBack />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{note.topic}</p>
          <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
            {saveStatus === "saving" && (
              <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" /> Saving…</>
            )}
            {saveStatus === "saved" && (
              <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Saved</>
            )}
            {saveStatus === "idle" && (
              <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Auto-save on</>
            )}
          </p>
        </div>

        {/* Phase toggle pills */}
        <div className="flex items-center p-0.5 rounded-lg shrink-0" style={{ background: "#F3F4F6" }}>
          {(["plan", "note"] as const).map(p => (
            <button
              key={p}
              onClick={() => { if (p === "note" && !hasNote) return; setPhase(p); }}
              disabled={p === "note" && !hasNote}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all disabled:opacity-30 capitalize"
              style={
                phase === p
                  ? { background: "white", color: "#641BC4", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { color: "#6B7280" }
              }
            >
              {p === "plan" ? "Plan" : "Note"}
            </button>
          ))}
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowExport(false); }}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <IconDots />
          </button>
          {showMenu && (
            <div
              className="absolute top-full right-0 mt-1 w-52 rounded-xl shadow-xl overflow-hidden"
              style={{ background: "white", border: "1px solid #E5E7EB", zIndex: 50 }}
            >
              <button
                onClick={() => { setShowRegenerate(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <span>✨</span> Regenerate {phase === "plan" ? "Plan" : "Note"} · ₽5
              </button>
              {hasNote && (
                <button
                  onClick={() => { setShowExport(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  style={{ borderTop: "1px solid #F3F4F6" }}
                >
                  <span>⬇️</span> Export Material
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta tags */}
      <div
        className="px-5 py-2 flex items-center gap-2 flex-wrap shrink-0 scrollbar-hidden overflow-x-auto"
        style={{ borderBottom: "1px solid #F9FAFB" }}
      >
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: "#F5F3FF", color: "#641BC4" }}>
          {note.subjectName}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{note.classLevel}</span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">Term {note.term} · Week {note.week}</span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{note.state}</span>
      </div>

      {/* Regenerate panel */}
      {showRegenerate && (
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
          <p className="text-xs font-semibold text-gray-700 mb-2">
            ✨ Regenerate {phase === "plan" ? "Lesson Plan" : "Lesson Note"} <span className="text-gray-400 font-normal">· costs ₽5</span>
          </p>
          <textarea
            value={regenInstructions}
            onChange={e => setRegenInstructions(e.target.value)}
            placeholder={'Optional: add instructions for the AI (e.g. "make it simpler", "add more examples")…'}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 outline-none resize-none bg-white leading-relaxed"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 transition"
              style={{ background: "#641BC4" }}
            >
              {regenerating ? "Regenerating…" : "Regenerate ₽5"}
            </button>
            <button
              onClick={() => { setShowRegenerate(false); setRegenInstructions(""); }}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Canvas scrollable area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 lg:px-10 lg:max-w-3xl lg:mx-auto lg:w-full">

        {/* Plan view */}
        {phase === "plan" && plan && (
          <PlanCanvas plan={plan} onChange={handlePlanChange} />
        )}
        {phase === "plan" && !plan && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <p className="text-gray-400 text-sm">No lesson plan content yet.</p>
          </div>
        )}

        {/* Note view */}
        {phase === "note" && !generatingNote && lessonNote && (
          <NoteCanvas note={lessonNote} onChange={handleNoteChange} />
        )}

        {phase === "note" && generatingNote && (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Generating Lesson Note…</p>
            </div>
            {[85, 100, 70, 95, 60, 100, 75, 88, 65, 90].map((w, i) => (
              <div key={i} className="animate-shimmer h-3 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {phase === "note" && !generatingNote && !lessonNote && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm mb-3">Generate the Lesson Note from the Plan.</p>
            <button onClick={() => setPhase("plan")} className="text-sm font-medium" style={{ color: "#641BC4" }}>
              ← Back to Plan
            </button>
          </div>
        )}

        {/* Bottom spacer for sticky bar */}
        <div className="h-24" />
      </div>

      {/* Export modal overlay */}
      {showExport && (
        <div
          className="fixed inset-0 bg-black/20 z-40 flex items-end justify-center"
          onClick={() => setShowExport(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl overflow-hidden shadow-2xl mb-0"
            style={{ background: "white" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F3F4F6" }}>
              <p className="font-semibold text-gray-900">Export Material</p>
              <p className="text-xs text-gray-400 mt-0.5">Download your lesson material</p>
            </div>
            {[
              { icon: "📄", label: "Download as PDF", sub: "Best for printing", fmt: "pdf" as const },
              { icon: "📝", label: "Download as DOCX", sub: "Editable Word document", fmt: "docx" as const },
            ].map((opt, i) => (
              <button
                key={i}
                onClick={() => handleExport(opt.fmt)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : undefined }}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.sub}</p>
                </div>
              </button>
            ))}
            <div className="h-safe-area-bottom" />
          </div>
        </div>
      )}

      {/* Sticky bottom action bar */}
      <div
        className="shrink-0 px-5 py-3 bg-white"
        style={{ borderTop: "1px solid #F3F4F6" }}
      >
        {phase === "plan" && !hasNote && !generatingNote && (
          canGenerateNote ? (
            <button
              onClick={handleGenerateNote}
              disabled={!plan}
              className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition"
              style={{ background: "linear-gradient(135deg,#7C3AED,#641BC4)" }}
            >
              <IconBolt className="w-5 h-5" />
              Generate Full Lesson Note
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(255,255,255,0.2)" }}>
                ₽12
              </span>
            </button>
          ) : (
            <div className="text-center py-1">
              <p className="text-sm text-red-500 mb-1.5">⚠ Insufficient balance to generate Note.</p>
              <Link href="/wallet" className="text-sm font-semibold" style={{ color: "#641BC4" }}>
                Top Up Wallet →
              </Link>
            </div>
          )
        )}

        {phase === "plan" && hasNote && !generatingNote && (
          <button
            onClick={() => setPhase("note")}
            className="w-full py-4 rounded-2xl font-semibold text-white transition"
            style={{ background: "linear-gradient(135deg,#7C3AED,#641BC4)" }}
          >
            View Lesson Note →
          </button>
        )}

        {generatingNote && (
          <button disabled className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 opacity-70" style={{ background: "#641BC4" }}>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" opacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
            Generating Lesson Note…
          </button>
        )}

        {phase === "note" && hasNote && !generatingNote && (
          <button
            onClick={() => setShowExport(true)}
            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition"
            style={{ background: "linear-gradient(135deg,#7C3AED,#641BC4)" }}
          >
            <IconDownload className="w-5 h-5" />
            Export Material
          </button>
        )}
      </div>
    </div>
  );
}
