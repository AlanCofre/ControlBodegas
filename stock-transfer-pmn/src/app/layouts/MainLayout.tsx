import type { ReactNode } from 'react'

import { useAuth } from '../../shared/auth/AuthContext'
import AppSidebar from '../../shared/components/AppSidebar'
import Topbar from '../../shared/components/Topbar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar currentRole={(user?.rol ?? 'administrador') as any} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}