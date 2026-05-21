import type { ReactNode } from 'react'

import AppSidebar from '../../shared/components/AppSidebar'
import Topbar from '../../shared/components/Topbar'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}