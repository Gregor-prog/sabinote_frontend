'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'
import { selectCurrentUser } from '@/lib/slices/authSlice'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAppSelector(selectCurrentUser)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') return null

  return <>{children}</>
}
