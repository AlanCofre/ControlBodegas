import { Link } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'
import type { TransferStatus } from '../types'

const getStatusColor = (status: TransferStatus) => {
  const colors: Record<TransferStatus, string> = {
    CREADA: 'bg-slate-100 text-slate-800 border border-slate-300',
    APROBADA: 'bg-blue-100 text-blue-800 border border-blue-300',
    RESERVADA: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
    EN_TRANSITO: 'bg-purple-100 text-purple-800 border border-purple-300',
    EN_TRANSITO_CON_INCIDENTE:
      'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300',
    RECIBIDA_SIN_DIFERENCIA:
      'bg-green-100 text-green-800 border border-green-300',
    CON_DIFERENCIA: 'bg-orange-100 text-orange-800 border border-orange-300',
    CERRADA: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    RECHAZADA: 'bg-red-100 text-red-800 border border-red-300',
    SIN_ORIGEN_DISPONIBLE: 'bg-rose-100 text-rose-800 border border-rose-300',
    ERROR_RESERVA: 'bg-red-100 text-red-800 border border-red-300',
    ESCALADA: 'bg-amber-100 text-amber-800 border border-amber-300',
  }

  return colors[status]
}

const getStatusLabel = (status: TransferStatus) => {
  const labels: Record<TransferStatus, string> = {
    CREADA: 'Creada',
    APROBADA: 'Aprobada',
    RESERVADA: 'Reservada',
    EN_TRANSITO: 'En tránsito',
    EN_TRANSITO_CON_INCIDENTE: 'En tránsito con incidente',
    RECIBIDA_SIN_DIFERENCIA: 'Recibida OK',
    CON_DIFERENCIA: 'Con diferencia',
    CERRADA: 'Cerrada',
    RECHAZADA: 'Rechazada',
    SIN_ORIGEN_DISPONIBLE: 'Sin origen disponible',
    ERROR_RESERVA: 'Error de reserva',
    ESCALADA: 'Escalada',
  }

  return labels[status]
}

export default function TransferListPage() {
  const { transfers } = useTransferStore()

  const sortedTransfers = [...transfers].sort(
    (a, b) =>
      new Date(b.fecha_actualizacion).getTime() -
      new Date(a.fecha_actualizacion).getTime(),
  )

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-CL')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transferencias</h1>
          <p className="mt-1 text-gray-600">
            Listado general del flujo operacional
          </p>
        </div>
        <Link
          to="/transfers/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition inline-block"
        >
          Nueva Transferencia
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ruta
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actualización
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Detalle
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {sortedTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {transfer.id}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {transfer.producto}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {transfer.origen} → {transfer.destino}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {transfer.cantidad}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        transfer.estado,
                      )}`}
                    >
                      {getStatusLabel(transfer.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(transfer.fecha_actualizacion)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      to={`/transfers/${transfer.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}

              {sortedTransfers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No hay transferencias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}