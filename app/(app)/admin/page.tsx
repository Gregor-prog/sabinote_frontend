'use client'

import Link from 'next/link'
import { useGetAdminStatsQuery } from '@/lib/services/adminApi'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 font-display">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const NAV_CARDS = [
  {
    href: '/admin/users',
    title: 'User Management',
    desc: 'View all teachers, check wallet balances, and credit accounts.',
    emoji: '👥',
  },
  {
    href: '/admin/resources',
    title: 'Public Resources',
    desc: 'Upload NERDC textbooks visible to all teachers on the platform.',
    emoji: '📚',
  },
  {
    href: '/admin/curriculum',
    title: 'Curriculum',
    desc: 'Add individual weeks or bulk-seed a full term of curriculum data.',
    emoji: '📋',
  },
]

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminStatsQuery()
  const stats = data?.data

  return (
    <div className="min-h-full" style={{ background: '#FAFAFA' }}>
      <div className="px-5 pt-12 pb-4 lg:pt-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#641BC4]/10 text-[#641BC4] uppercase tracking-wider">Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview and management tools</p>
      </div>

      <div className="px-5 pb-8 space-y-6">
        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} />
            <StatCard label="Total Notes" value={stats.totalNotes.toLocaleString()} />
            <StatCard label="Notes This Month" value={stats.notesThisMonth.toLocaleString()} />
            <StatCard
              label="Revenue"
              value={`₦${Number(stats.totalRevenueNGN).toLocaleString()}`}
              sub={`${stats.totalTopups} top-ups`}
            />
          </div>
        ) : null}

        {/* Nav cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage</h2>
          {NAV_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mt-0.5">{card.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{card.title}</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{card.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
