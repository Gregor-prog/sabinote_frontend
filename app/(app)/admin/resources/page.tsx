'use client'

import { useState, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import { useAdminUploadResourceMutation } from '@/lib/services/adminApi'
import { useGetResourcesQuery, useDeleteResourceMutation } from '@/lib/services/resourcesApi'
import type { Resource } from '@/lib/types'
import { IconBack, IconUpload, IconFolder } from '@/components/icons'
import { NIGERIAN_STATES, CLASS_LEVELS } from '@/lib/constants'

const CLASSES = CLASS_LEVELS

const RESOURCE_TYPE_LABELS: Record<Resource['resourceType'], string> = {
  textbook: 'Textbook',
  scheme_supplement: 'Scheme Supplement',
  past_question: 'Past Question',
  other: 'Other',
}

const RESOURCE_TYPE_COLORS: Record<Resource['resourceType'], string> = {
  textbook: 'bg-blue-50 text-blue-700',
  scheme_supplement: 'bg-purple-50 text-purple-700',
  past_question: 'bg-amber-50 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
}


export default function AdminResourcesPage() {
  const fileId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [resourceName, setResourceName] = useState('')
  const [resourceType, setResourceType] = useState<Resource['resourceType']>('textbook')
  const [subject, setSubject] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [adminUpload, { isLoading: uploading }] = useAdminUploadResourceMutation()
  const { data: resourcesData, isLoading: loadingResources } = useGetResourcesQuery()
  const [deleteResource, { isLoading: deleting }] = useDeleteResourceMutation()

  const publicResources = (resourcesData?.data ?? []).filter((r) => r.isPublic)

  const handleFile = useCallback((f: File) => {
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    setFile(f)
    if (!resourceName) setResourceName(f.name.replace(/\.[^.]+$/, ''))
    setError('')
  }, [resourceName])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (!file) { setError('Please select a file.'); return }
    if (!resourceName.trim()) { setError('Resource name is required.'); return }

    const fd = new FormData()
    fd.append('file', file)
    fd.append('resourceName', resourceName.trim())
    fd.append('resourceType', resourceType)
    if (subject.trim()) fd.append('subject', subject.trim())
    if (classLevel) fd.append('classLevel', classLevel)
    if (state) fd.append('state', state)

    try {
      await adminUpload(fd).unwrap()
      setSuccessMsg(`"${resourceName}" uploaded and is now public.`)
      setFile(null)
      setResourceName('')
      setResourceType('textbook')
      setSubject('')
      setClassLevel('')
      setState('')
    } catch {
      setError('Upload failed. Please try again.')
    }
  }

  async function handleDelete(resourceId: string) {
    try { await deleteResource(resourceId).unwrap() } catch { /* no-op */ }
  }

  return (
    <div className="min-h-full" style={{ background: '#FAFAFA' }}>
      <div className="px-5 pt-12 pb-4 lg:pt-0">
        <div className="flex items-center gap-3 mb-1 lg:hidden">
          <Link href="/admin" className="w-8 h-8 flex items-center justify-center">
            <IconBack className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 font-display">Public Resources</h1>
        </div>
        <h1 className="hidden lg:block text-2xl font-bold text-gray-900 font-display mb-1">Public Resources</h1>
        <p className="text-sm text-gray-500 lg:ml-0 ml-11">Upload NERDC textbooks accessible to all teachers</p>
      </div>

      <div className="px-5 pb-8 space-y-6">
        {/* Upload form */}
        <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Upload Public Resource</h2>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragging ? 'border-[#641BC4] bg-[#641BC4]/5'
              : file ? 'border-green-400 bg-green-50'
              : 'border-gray-200 hover:border-[#641BC4]/40 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              id={fileId}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <IconUpload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
            {file ? (
              <>
                <p className="font-semibold text-sm text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <p className="font-medium text-sm text-gray-700">Drop file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 10 MB</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Resource Name *</label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="e.g. New General Mathematics JSS 1 (NERDC)"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#641BC4] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Resource Type *</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as Resource['resourceType'])}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#641BC4] transition"
            >
              <option value="textbook">Textbook</option>
              <option value="scheme_supplement">Scheme Supplement</option>
              <option value="past_question">Past Question</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#641BC4] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class Level</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#641BC4] transition"
              >
                <option value="">Any</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#641BC4] transition"
            >
              <option value="">All states</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {successMsg && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{successMsg}</p>}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#641BC4)' }}
          >
            {uploading ? 'Uploading…' : 'Upload as Public Resource'}
          </button>
        </form>

        {/* Existing public resources */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Current Public Resources ({publicResources.length})
          </h2>
          {loadingResources ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-100" />)}
            </div>
          ) : publicResources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No public resources yet.</p>
          ) : (
            <div className="space-y-2">
              {publicResources.map((r) => (
                <div key={r.resourceId} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-[#641BC4]/10 flex items-center justify-center shrink-0">
                    <IconFolder className="w-5 h-5 text-[#641BC4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{r.resourceName}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RESOURCE_TYPE_COLORS[r.resourceType]}`}>
                        {RESOURCE_TYPE_LABELS[r.resourceType]}
                      </span>
                      {r.subject && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.subject}</span>}
                      {r.classLevel && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.classLevel}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#641BC4] font-medium hover:underline">View</a>
                    <button
                      onClick={() => handleDelete(r.resourceId)}
                      disabled={deleting}
                      className="text-xs text-red-400 hover:text-red-600 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
