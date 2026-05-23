export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoría</h1>
          <p className="mt-1 text-gray-600">Registro de todas las operaciones del sistema</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar en auditoría..."
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <select className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option>Todos los tipos</option>
              <option>Crear</option>
              <option>Actualizar</option>
              <option>Eliminar</option>
              <option>Transferencia</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="space-y-4">
            <div className="border-l-4 border-gray-300 bg-gray-50 p-4">
              <p className="text-center text-gray-500">No hay registros de auditoría</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
