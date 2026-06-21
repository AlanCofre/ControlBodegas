import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'

export default function AuditPage() {
  const { auditLog, loading } = useTransferStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('Todas')

  // Obtener acciones únicas para el filtro
  const actions = useMemo(() => {
    const list = new Set(auditLog.map((log) => log.accion))
    return ['Todas', ...Array.from(list)]
  }, [auditLog])

  // Filtrar eventos de auditoría
  const filteredEvents = useMemo(() => {
    return [...auditLog]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((log) => {
        const matchesSearch =
          log.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.transferencia_id.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAction = selectedAction === 'Todas' || log.accion === selectedAction
        return matchesSearch && matchesAction
      })
  }, [auditLog, searchTerm, selectedAction])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL')
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'crear_solicitud':
        return 'bg-slate-100 text-slate-800'
      case 'aprobar_solicitud':
        return 'bg-blue-100 text-blue-800'
      case 'rechazar_solicitud':
        return 'bg-red-100 text-red-800'
      case 'reservar_stock':
        return 'bg-cyan-100 text-cyan-800'
      case 'asignar_transportista':
        return 'bg-sky-100 text-sky-800'
      case 'reportar_incidente':
        return 'bg-pink-100 text-pink-800 border border-pink-300'
      case 'registrar_despacho':
        return 'bg-purple-100 text-purple-800'
      case 'registrar_recepcion':
        return 'bg-orange-100 text-orange-800'
      case 'cerrar_transferencia':
        return 'bg-emerald-100 text-emerald-800'
      case 'error_reserva':
        return 'bg-red-100 text-red-800'
      case 'ajuste_manual':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'crear_solicitud':
        return 'Creación'
      case 'aprobar_solicitud':
        return 'Aprobación'
      case 'rechazar_solicitud':
        return 'Rechazo'
      case 'reservar_stock':
        return 'Reserva'
      case 'asignar_transportista':
        return 'Asignación de Transportista'
      case 'reportar_incidente':
        return 'Incidente en Ruta'
      case 'registrar_despacho':
        return 'Despacho'
      case 'registrar_recepcion':
        return 'Recepción'
      case 'cerrar_transferencia':
        return 'Cierre'
      case 'error_reserva':
        return 'Error de Reserva'
      case 'ajuste_manual':
        return 'Ajuste Manual'
      default:
        return action
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoría</h1>
          <p className="mt-1 text-gray-600">Registro histórico de todas las operaciones realizadas</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-500">Cargando bitácora de auditoría...</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <input
                type="text"
                placeholder="Buscar por descripción, actor o transferencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Todas">Todas las acciones</option>
                {actions.map((act) => (
                  <option key={act} value={act}>
                    {getActionLabel(act)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Transferencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredEvents.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {log.transferencia_id && log.transferencia_id !== 'N/A' && log.transferencia_id !== 'null' ? (
                        <Link to={`/transfers/${log.transferencia_id}`} className="text-blue-600 hover:text-blue-800">
                          {log.transferencia_id}
                        </Link>
                      ) : (
                        <span className="text-gray-400 font-normal">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${getActionBadgeColor(log.accion)}`}>
                        {getActionLabel(log.accion)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500 capitalize whitespace-nowrap">
                      {log.rol.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {log.descripcion}
                    </td>
                  </tr>
                ))}

                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No hay registros de auditoría que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
