export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Bienvenido al sistema de control de bodegas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total de Transferencias</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          <p className="mt-1 text-xs text-gray-500">Este mes</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Por procesar</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Completadas</p>
          <p className="mt-2 text-3xl font-bold text-green-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Exitosas</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Rechazadas</p>
          <p className="mt-2 text-3xl font-bold text-red-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Canceladas</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
        <p className="mt-4 text-center text-gray-500">No hay actividad registrada</p>
      </div>
    </div>
  )
}