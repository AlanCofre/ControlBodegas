import { TransferProvider } from './app/store/TransferContext'
import AppRoutes from './app/routes/AppRoutes'

export default function App() {
  return (
    <TransferProvider>
      <AppRoutes />
    </TransferProvider>
  )
}