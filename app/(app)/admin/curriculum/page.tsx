'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useSeedCurriculumMutation, type CurriculumWeekInput } from '@/lib/services/adminApi'
import { IconBack, IconPlus, IconDownload, IconUpload } from '@/components/icons'
import { NIGERIAN_SUBJECTS, NIGERIAN_STATES, CLASS_LEVELS } from '@/lib/constants'

const SUBJECTS = NIGERIAN_SUBJECTS
const CLASSES = CLASS_LEVELS

const CSV_HEADERS = [
  'state', 'subject', 'classLevel', 'term', 'week', 'topic',
  'subTopics', 'objectives', 'teachingActivities', 'teachingAids', 'evaluation', 'referenceText',
]

const CSV_EXAMPLE_ROWS = [
  [
    'Lagos', 'Mathematics', 'JSS1', '1', '1', 'Whole Numbers — Place Value',
    'Units tens and hundreds|Expanded notation|Number line',
    'Identify place values up to millions|Read and write large numbers',
    'Use place value charts to demonstrate values',
    'Place value chart, counters',
    'Write 3045267 in words and expanded form',
    'New General Mathematics JSS1 p.1',
  ],
  [
    'Lagos', 'Mathematics', 'JSS1', '1', '2', 'Whole Numbers — Addition and Subtraction',
    'Addition of 5-digit numbers|Subtraction with borrowing|Word problems',
    'Add numbers up to 5 digits|Solve real-life word problems',
    'Demonstrate column addition on the board',
    'Whiteboard, exercise books',
    'Add 34567 and 48923 showing all steps',
    'New General Mathematics JSS1 p.12',
  ],
]

function parseCsv(text: string): CurriculumWeekInput[] {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const idx = (name: string) => headers.indexOf(name)

  return lines.slice(1).map((line) => {
    // Handle quoted fields (fields can contain commas if quoted)
    const cols: string[] = []
    let inQuote = false
    let cur = ''
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    cols.push(cur.trim())

    const get = (name: string) => cols[idx(name)]?.trim() ?? ''
    const getArr = (name: string) =>
      get(name).split('|').map((s) => s.trim()).filter(Boolean)

    return {
      state: get('state'),
      subject: get('subject'),
      classLevel: get('classlevel'),
      term: Number(get('term')) || 1,
      week: Number(get('week')) || 1,
      topic: get('topic'),
      subTopics: getArr('subtopics'),
      objectives: getArr('objectives'),
      teachingActivities: get('teachingactivities') || undefined,
      teachingAids: get('teachingaids') || undefined,
      evaluation: get('evaluation') || undefined,
      referenceText: get('referencetext') || undefined,
    } satisfies CurriculumWeekInput
  })
}

function downloadTemplate() {
  const rows = [
    CSV_HEADERS.join(','),
    ...CSV_EXAMPLE_ROWS.map((r) =>
      r.map((cell) => (cell.includes(',') ? `"${cell}"` : cell)).join(',')
    ),
  ]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'sabinote_curriculum_template.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── Tag input ────────────────────────────────────────────────────────────────
function TagInput({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string
}) {
  const [input, setInput] = useState('')
  function add() {
    const val = input.trim()
    if (val && !values.includes(val)) onChange([...values, val])
    setInput('')
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-[#641BC4]/10 text-[#641BC4] rounded-lg text-xs font-medium">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-[#641BC4]/60 hover:text-[#641BC4] leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#641BC4] transition" />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-[#641BC4]/10 text-[#641BC4] text-sm font-medium hover:bg-[#641BC4]/20 transition">
          <IconPlus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const INPUT_CLS = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#641BC4] transition bg-white'

function field(label: string, el: React.ReactNode) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {el}
    </div>
  )
}

// ── CSV Upload Mode ──────────────────────────────────────────────────────────
function CsvUploadMode() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<CurriculumWeekInput[]>([])
  const [parseError, setParseError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')
  const [seedCurriculum, { isLoading }] = useSeedCurriculumMutation()

  function handleFile(file: File) {
    setParseError('')
    setParsed([])
    setSuccessMsg('')
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const weeks = parseCsv(text)
        if (weeks.length === 0) { setParseError('No data rows found. Check your file format.'); return }
        const invalid = weeks.filter((w) => !w.state || !w.subject || !w.classLevel || !w.topic)
        if (invalid.length > 0) {
          setParseError(`${invalid.length} row(s) are missing required fields (state, subject, classLevel, topic). Check rows and try again.`)
          return
        }
        setParsed(weeks)
      } catch {
        setParseError('Could not parse the file. Make sure it is a valid CSV.')
      }
    }
    reader.readAsText(file)
  }

  async function handleSeed() {
    setError('')
    setSuccessMsg('')
    try {
      const res = await seedCurriculum({ weeks: parsed }).unwrap()
      setSuccessMsg(`Done — ${res.data.upserted} of ${res.data.total} weeks upserted.`)
      setParsed([])
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      setError('Seed failed. Please try again.')
    }
  }

  // Group parsed weeks by state for preview
  const byState: Record<string, CurriculumWeekInput[]> = {}
  for (const w of parsed) {
    if (!byState[w.state]) byState[w.state] = []
    byState[w.state].push(w)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Upload Curriculum CSV</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill the template spreadsheet and upload. Use <code className="bg-gray-100 px-1 rounded">|</code> to separate multiple sub-topics or objectives.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#641BC4] text-[#641BC4] text-xs font-semibold hover:bg-[#641BC4]/5 transition shrink-0"
        >
          <IconDownload className="w-3.5 h-3.5" />
          Template
        </button>
      </div>

      {/* Columns reference */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">CSV Columns</p>
        <div className="flex flex-wrap gap-1.5">
          {CSV_HEADERS.map((h) => (
            <span key={h} className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              ['state','subject','classlevel','term','week','topic','subtopics','objectives'].includes(h.toLowerCase())
                ? 'bg-[#641BC4]/10 text-[#641BC4]'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {h}
              {['state','subject','classLevel','term','week','topic','subTopics','objectives'].includes(h) && ' *'}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Purple = required. Separate multiple values with <code className="bg-white px-1 rounded border border-gray-200">|</code> e.g. <code className="bg-white px-1 rounded border border-gray-200">Place value|Rounding</code></p>
      </div>

      {/* File picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#641BC4]/40 hover:bg-gray-50 transition"
      >
        <IconUpload className="mx-auto w-7 h-7 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">Click to choose CSV file</p>
        <p className="text-xs text-gray-400 mt-0.5">Exported from Excel or Google Sheets</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      {parseError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">{parseError}</p>}

      {/* Preview */}
      {parsed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{parsed.length} weeks parsed</p>
            <button onClick={() => { setParsed([]); if (fileRef.current) fileRef.current.value = '' }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          </div>

          {/* State breakdown */}
          <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-gray-100">
            {Object.entries(byState).map(([state, weeks]) => {
              const subjects = [...new Set(weeks.map((w) => w.subject))]
              return (
                <div key={state} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-900">{state}</p>
                    <span className="text-xs text-gray-500">{weeks.length} week{weeks.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {subjects.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">{error}</p>}
          {successMsg && <p className="text-xs text-green-700 bg-green-50 px-3 py-2.5 rounded-lg">{successMsg}</p>}

          <button
            onClick={handleSeed}
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition"
            style={{ background: 'var(--color-primary)' }}
          >
            {isLoading ? 'Uploading…' : `Upload ${parsed.length} weeks`}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Single week form ─────────────────────────────────────────────────────────
function SingleWeekForm() {
  const [state, setState] = useState('')
  const [subject, setSubject] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [term, setTerm] = useState(1)
  const [week, setWeek] = useState(1)
  const [topic, setTopic] = useState('')
  const [subTopics, setSubTopics] = useState<string[]>([])
  const [objectives, setObjectives] = useState<string[]>([])
  const [teachingActivities, setTeachingActivities] = useState('')
  const [teachingAids, setTeachingAids] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [referenceText, setReferenceText] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [seedCurriculum, { isLoading }] = useSeedCurriculumMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!state || !subject || !classLevel || !topic) { setError('State, subject, class level, and topic are required.'); return }
    if (subTopics.length === 0) { setError('Add at least one sub-topic.'); return }
    if (objectives.length === 0) { setError('Add at least one objective.'); return }

    const entry: CurriculumWeekInput = {
      state, subject, classLevel, term, week, topic, subTopics, objectives,
      teachingActivities: teachingActivities || undefined,
      teachingAids: teachingAids || undefined,
      evaluation: evaluation || undefined,
      referenceText: referenceText || undefined,
    }

    try {
      const res = await seedCurriculum({ weeks: [entry] }).unwrap()
      setSuccessMsg(`Week ${week} saved. (${res.data.upserted} upserted)`)
      setTopic(''); setSubTopics([]); setObjectives([])
      setTeachingActivities(''); setTeachingAids(''); setEvaluation(''); setReferenceText('')
      setWeek((w) => w + 1)
    } catch {
      setError('Failed to save. Please check your inputs and try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
      <h2 className="font-semibold text-gray-900">Add Single Week</h2>
      <div className="grid grid-cols-2 gap-3">
        {field('State *', <select value={state} onChange={(e) => setState(e.target.value)} className={INPUT_CLS}><option value="">Select state</option>{NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>)}
        {field('Subject *', <select value={subject} onChange={(e) => setSubject(e.target.value)} className={INPUT_CLS}><option value="">Select subject</option>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>)}
        {field('Class Level *', <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className={INPUT_CLS}><option value="">Select class</option>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select>)}
        {field('Term *', <select value={term} onChange={(e) => setTerm(Number(e.target.value))} className={INPUT_CLS}><option value={1}>Term 1</option><option value={2}>Term 2</option><option value={3}>Term 3</option></select>)}
      </div>
      {field('Week Number *', <input type="number" min={1} max={14} value={week} onChange={(e) => setWeek(Number(e.target.value))} className={INPUT_CLS} />)}
      {field('Topic *', <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Whole Numbers — Place Value" className={INPUT_CLS} />)}
      <TagInput label="Sub-Topics *" values={subTopics} onChange={setSubTopics} placeholder="Type and press Enter" />
      <TagInput label="Objectives *" values={objectives} onChange={setObjectives} placeholder="Type and press Enter" />
      {field('Teaching Activities', <textarea rows={2} value={teachingActivities} onChange={(e) => setTeachingActivities(e.target.value)} placeholder="Describe teacher-led activities…" className={INPUT_CLS + ' resize-none'} />)}
      {field('Teaching Aids', <input type="text" value={teachingAids} onChange={(e) => setTeachingAids(e.target.value)} placeholder="e.g. Place value chart, counters" className={INPUT_CLS} />)}
      {field('Evaluation', <textarea rows={2} value={evaluation} onChange={(e) => setEvaluation(e.target.value)} placeholder="e.g. Write 3,045,267 in words" className={INPUT_CLS + ' resize-none'} />)}
      {field('Reference Text', <input type="text" value={referenceText} onChange={(e) => setReferenceText(e.target.value)} placeholder="e.g. New General Mathematics JSS1 p.1" className={INPUT_CLS} />)}
      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {successMsg && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{successMsg}</p>}
      <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition" style={{ background: 'var(--color-primary)' }}>
        {isLoading ? 'Saving…' : 'Save Week'}
      </button>
    </form>
  )
}

// ── Bulk JSON mode ───────────────────────────────────────────────────────────
function BulkJsonMode() {
  const [bulkJson, setBulkJson] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [seedCurriculum, { isLoading }] = useSeedCurriculumMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    let parsed: CurriculumWeekInput[]
    try {
      const raw = JSON.parse(bulkJson)
      parsed = Array.isArray(raw) ? raw : raw.weeks
      if (!Array.isArray(parsed)) throw new Error()
    } catch {
      setError('Invalid JSON. Paste an array of week objects or { "weeks": [...] }.')
      return
    }
    try {
      const res = await seedCurriculum({ weeks: parsed }).unwrap()
      setSuccessMsg(`Done — ${res.data.upserted} of ${res.data.total} weeks upserted.`)
      setBulkJson('')
    } catch {
      setError('Bulk seed failed. Check your data and try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
      <h2 className="font-semibold text-gray-900">Bulk Seed via JSON</h2>
      <p className="text-xs text-gray-500">Paste an array of week objects or <code className="bg-gray-100 px-1 rounded">{'{"weeks": [...]}'}</code>. Idempotent — safe to re-run.</p>
      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-500 font-mono leading-relaxed border border-gray-100 overflow-x-auto">
        {`[{"state":"Lagos","subject":"Mathematics","classLevel":"JSS1","term":1,"week":1,"topic":"Whole Numbers","subTopics":["Place value"],"objectives":["Identify place values"]}]`}
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">JSON Payload</label>
        <textarea rows={10} value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} placeholder="Paste your JSON here…" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#641BC4] transition resize-y" />
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {successMsg && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{successMsg}</p>}
      <button type="submit" disabled={isLoading || !bulkJson.trim()} className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition" style={{ background: 'var(--color-primary)' }}>
        {isLoading ? 'Seeding…' : 'Seed Curriculum'}
      </button>
    </form>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCurriculumPage() {
  const [mode, setMode] = useState<'csv' | 'single' | 'json'>('csv')

  const MODES = [
    { key: 'csv', label: '📂 CSV Upload' },
    { key: 'single', label: '✏️ Single Week' },
    { key: 'json', label: '{ } JSON' },
  ] as const

  return (
    <div className="min-h-full" style={{ background: '#FAFAFA' }}>
      <div className="px-5 pt-12 pb-4 lg:pt-0">
        <div className="flex items-center gap-3 mb-1 lg:hidden">
          <Link href="/admin" className="w-8 h-8 flex items-center justify-center">
            <IconBack className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 font-display">Curriculum</h1>
        </div>
        <h1 className="hidden lg:block text-2xl font-bold text-gray-900 font-display mb-1">Curriculum</h1>
        <p className="text-sm text-gray-500 lg:ml-0 ml-11">Upload curriculum data by state, subject, and class level</p>
      </div>

      <div className="px-5 pb-8 space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-1 p-1 bg-gray-200 rounded-xl">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={mode === m.key ? { background: 'var(--color-primary)', color: 'white' } : { color: 'var(--color-text-muted)' }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'csv' && <CsvUploadMode />}
        {mode === 'single' && <SingleWeekForm />}
        {mode === 'json' && <BulkJsonMode />}
      </div>
    </div>
  )
}
