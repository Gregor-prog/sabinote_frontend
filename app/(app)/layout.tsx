'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/lib/hooks'
import { selectIsAuthenticated, selectCurrentUser } from '@/lib/slices/authSlice'
import TabBar from '@/components/TabBar'
import { useGetMeQuery } from '@/lib/services/authApi'
import {
  IconHome,
  IconBolt,
  IconLibrary,
  IconWallet,
  IconSettings,
  IconUpload,
  IconShield,
} from '@/components/icons'

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
        active
          ? 'bg-(--color-primary)/10 text-(--color-primary)'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

function DesktopSidebar({
  user,
  isAdmin,
}: {
  user: { firstName: string; lastName: string; email: string } | null
  isAdmin: boolean
}) {
  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 border-r border-gray-100 bg-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-(--color-primary) flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display font-bold text-[17px] text-gray-900 tracking-tight">SabiNote</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
        <SidebarLink href="/dashboard" icon={IconHome} label="Dashboard" />
        <SidebarLink href="/generate" icon={IconBolt} label="Generate" />
        <SidebarLink href="/notes" icon={IconLibrary} label="Library" />
        <SidebarLink href="/resources" icon={IconUpload} label="Resources" />
        <SidebarLink href="/wallet" icon={IconWallet} label="Wallet" />
        <SidebarLink href="/settings" icon={IconSettings} label="Settings" />

        {isAdmin && (
          <>
            <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Admin</p>
            <SidebarLink href="/admin" icon={IconShield} label="Admin Panel" />
          </>
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-(--color-primary)/15 flex items-center justify-center shrink-0">
              <span className="text-(--color-primary) font-bold text-sm">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                {isAdmin && (
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-(--color-primary)/10 text-(--color-primary) uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const isAdmin = user?.role === 'admin'
  const [mounted, setMounted] = useState(false)

  useGetMeQuery(undefined, { skip: !isAuthenticated })

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated) {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!mounted) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        <DesktopSidebar user={user} isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>

      {/* Mobile layout — centered 430px shell */}
      <div className="lg:hidden flex items-center justify-center min-h-screen bg-gray-100">
        <div className="app-screen shadow-2xl">
          <div className="flex-1 overflow-y-auto scrollbar-hidden">{children}</div>
          <TabBar />
        </div>
      </div>
    </div>
  )
}
