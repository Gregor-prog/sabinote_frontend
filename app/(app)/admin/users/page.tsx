'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGetAdminUsersQuery, useCreditWalletMutation, type AdminUser } from '@/lib/services/adminApi'
import { IconBack, IconSearch } from '@/components/icons'

function CreditModal({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creditWallet, { isLoading }] = useCreditWalletMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('Enter a positive amount.'); return }
    if (!reason.trim()) { setError('Reason is required.'); return }
    try {
      const res = await creditWallet({ userId: user.userId, amount: amt, reason: reason.trim() }).unwrap()
      setSuccess(`Credited ₽${amt} — new balance: ₽${res.data.newBalance}`)
      setAmount('')
      setReason('')
    } catch {
      setError('Credit failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div role="dialog" aria-modal="true" aria-label="Credit wallet" className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Credit Wallet</h3>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-[#641BC4]/15 flex items-center justify-center shrink-0">
            <span className="text-[#641BC4] font-bold text-sm">{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <p className="text-sm font-bold text-[#641BC4] shrink-0">₽{Number(user.wallet?.balance ?? 0).toFixed(0)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₽ Parats)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#641BC4] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensation for failed generation"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#641BC4] transition"
            />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition"
            style={{ background: 'var(--color-primary)' }}
          >
            {isLoading ? 'Crediting…' : 'Credit Wallet'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [creditTarget, setCreditTarget] = useState<AdminUser | null>(null)

  const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 20 })

  const users = data?.data?.users ?? []
  const pagination = data?.data?.pagination

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="min-h-full" style={{ background: '#FAFAFA' }}>
      <div className="px-5 pt-12 pb-4 lg:pt-0">
        <div className="flex items-center gap-3 mb-1 lg:hidden">
          <Link href="/admin" className="w-8 h-8 flex items-center justify-center">
            <IconBack className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 font-display">Users</h1>
        </div>
        <h1 className="hidden lg:block text-2xl font-bold text-gray-900 font-display mb-1">Users</h1>
        <p className="text-sm text-gray-500 lg:ml-0 ml-11">
          {pagination ? `${pagination.total} total users` : 'All registered teachers'}
        </p>
      </div>

      <div className="px-5 pb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#641BC4] transition"
          />
        </div>

        {/* User list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl h-16 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No users found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((user) => (
              <div
                key={user.userId}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-[#641BC4]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#641BC4] font-bold text-sm">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.role === 'admin' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#641BC4]/10 text-[#641BC4] shrink-0">ADMIN</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email} · {user.state}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-bold text-gray-700">
                    ₽{Number(user.wallet?.balance ?? 0).toFixed(0)}
                  </p>
                  <button
                    onClick={() => setCreditTarget(user)}
                    className="text-xs font-semibold text-[#641BC4] hover:underline"
                  >
                    Credit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > pagination.limit && (
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="text-xs text-gray-400">
              Page {page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              disabled={page >= Math.ceil(pagination.total / pagination.limit)}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {creditTarget && (
        <CreditModal user={creditTarget} onClose={() => setCreditTarget(null)} />
      )}
    </div>
  )
}
