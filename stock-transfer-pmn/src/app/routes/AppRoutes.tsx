import { Route, Routes } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'

import DashboardPage from '../../modules/dashboard/pages/DashboardPage'
import TransferListPage from '../../modules/transferencias/pages/TransferListPage'
import TransferDetailPage from '../../modules/transferencias/pages/TransferDetailPage'
import InventoryPage from '../../modules/inventario/pages/InventoryPage'
import AuditPage from '../../modules/auditoria/pages/AuditPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />

      <Route
        path="/transfers"
        element={
          <MainLayout>
            <TransferListPage />
          </MainLayout>
        }
      />

      <Route
        path="/transfers/:id"
        element={
          <MainLayout>
            <TransferDetailPage />
          </MainLayout>
        }
      />

      <Route
        path="/inventory"
        element={
          <MainLayout>
            <InventoryPage />
          </MainLayout>
        }
      />

      <Route
        path="/audit"
        element={
          <MainLayout>
            <AuditPage />
          </MainLayout>
        }
      />
    </Routes>
  )
}