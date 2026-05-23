export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="mt-1 text-gray-600">Gestiona el inventario de todas las bodegas</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total de SKUs</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          <p className="mt-1 text-xs text-gray-500">Productos registrados</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Requiere atención</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Sin Stock</p>
          <p className="mt-2 text-3xl font-bold text-red-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Agotados</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Bodegas</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Ubicaciones activas</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Listado de Productos</h2>
        <p className="mt-4 text-center text-gray-500">No hay productos registrados</p>
      </div>
    </div>
  )
}
