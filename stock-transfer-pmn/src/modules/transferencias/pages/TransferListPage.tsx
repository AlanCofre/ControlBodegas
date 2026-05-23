import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'
import type { TransferStatus } from '../types'

const getStatusColor = (status: TransferStatus) => {
  const colors: Record<TransferStatus, string> = {
    CREADA: 'bg-slate-100 text-slate-800 border border-slate-300',
    APROBADA: 'bg-blue-100 text-blue-800 border border-blue-300',
    RESERVADA: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
    EN_TRANSITO: 'bg-purple-100 text-purple-800 border border-purple-300',
    RECIBIDA_SIN_DIFERENCIA: 'bg-green-100 text-green-800 border border-green-300',
    CON_DIFERENCIA: 'bg-orange-100 text-orange-800 border border-orange-300',
    CERRADA: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    RECHAZADA: 'bg-red-100 text-red-800 border border-red-300',
    SIN_ORIGEN: 'bg-red-100 text-red-800 border border-red-300',
    ERROR_RESERVA: 'bg-red-100 text-red-800 border border-red-300',
    ESCALADA: 'bg-amber-100 text-amber-800 border border-amber-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: TransferStatus) => {
  const labels: Record<TransferStatus, string> = {
    CREADA: 'Creada',
    APROBADA: 'Aprobada',
    RESERVADA: 'Reservada',
    EN_TRANSITO: 'En Tránsito',
    RECIBIDA_SIN_DIFERENCIA: 'Recibida OK',
    CON_DIFERENCIA: 'Con Diferencia',
    CERRADA: 'Cerrada',
    RECHAZADA: 'Rechazada',
    SIN_ORIGEN: 'Sin Origen',
    ERROR_RESERVA: 'Error Reserva',
    ESCALADA: 'Escalada',
  }
  return labels[status]
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    baja: 'text-green-600',
    normal: 'text-gray-600',
    alta: 'text-orange-600',
    urgente: 'text-red-600',
  }
  return colors[priority] || 'text-gray-600'
}

export default function TransferListPage() {
  const { transfers } = useTransferStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const matchesSearch =
        transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.destino.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || transfer.estado === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [transfers, searchTerm, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transferencias</h1>
          <p className="mt-1 text-gray-600">Gestión operacional de transferencias de stock ({transfers.length} total)</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
          Nueva Transferencia
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar por ID, producto, origen o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="CREADA">Creada</option>
              <option value="APROBADA">Aprobada</option>
              <option value="RESERVADA">Reservada</option>
              <option value="EN_TRANSITO">En Tránsito</option>
              <option value="RECIBIDA_SIN_DIFERENCIA">Recibida OK</option>
              <option value="CON_DIFERENCIA">Con Diferencia</option>
              <option value="CERRADA">Cerrada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="ERROR_RESERVA">Error Reserva</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Origen → Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Actualización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {transfers.length === 0
                      ? 'No hay transferencias registradas'
                      : 'No hay transferencias que coincidan con los filtros'}
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {transfer.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transfer.producto}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>{transfer.origen}</span>
                        <span className="text-gray-400">→</span>
                        <span>{transfer.destino}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {transfer.cantidad}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${getPriorityColor(transfer.prioridad)}`}>
                      {transfer.prioridad.charAt(0).toUpperCase() + transfer.prioridad.slice(1)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transfer.estado)}`}>
                        {getStatusLabel(transfer.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDate(transfer.fecha_actualizacion)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/transfers/${transfer.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-sm text-gray-600">
          Mostrando {filteredTransfers.length} de {transfers.length} transferencias
        </div>
      </div>
    </div>
  )
}