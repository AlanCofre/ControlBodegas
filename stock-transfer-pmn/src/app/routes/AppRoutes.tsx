import { Route, Routes } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'

import DashboardPage from '../../modules/dashboard/pages/DashboardPage'
import TransferListPage from '../../modules/transferencias/pages/TransferListPage'

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
    </Routes>
  )
}