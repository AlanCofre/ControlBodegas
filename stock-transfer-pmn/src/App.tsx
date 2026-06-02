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

function AppContent() {
  const { isAuthenticated } = useAuth()

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