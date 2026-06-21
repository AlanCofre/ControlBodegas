import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './shared/auth/AuthContext'
import { TransferProvider } from './app/store/TransferContext'

import MainLayout from './app/layouts/MainLayout'
import LoginPage from './modules/dashboard/pages/LoginPage'
import DashboardPage from './modules/dashboard/pages/DashboardPage'
import TransfersPage from './modules/transferencias/pages/TransferListPage'
import AuditPage from './modules/auditoria/pages/AuditPage'
import CreateTransferPage from './modules/transferencias/pages/CreateTransferPage'
import TransferDetailPage from './modules/transferencias/pages/TransferDetailPage'
import InventoryPage from './modules/inventario/pages/InventoryPage'

function AppContent() {
  const { isAuthenticated, loadingSession } = useAuth()

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-blue-200/80">Validando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <TransferProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/transfers/create" element={<CreateTransferPage />} />
            <Route path="/transfers/:id" element={<TransferDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TransferProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}