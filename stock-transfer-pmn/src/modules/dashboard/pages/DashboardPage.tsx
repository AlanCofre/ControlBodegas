import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'
import type { TransferStatus } from '../../transferencias/types'

const getStatusColor = (status: TransferStatus) => {
  const colors: Record<TransferStatus, string> = {
    CREADA: 'bg-slate-100 text-slate-800',
    APROBADA: 'bg-blue-100 text-blue-800',
    RESERVADA: 'bg-cyan-100 text-cyan-800',
    EN_TRANSITO: 'bg-purple-100 text-purple-800',
    EN_TRANSITO_CON_INCIDENTE: 'bg-fuchsia-100 text-fuchsia-800',
    RECIBIDA_SIN_DIFERENCIA: 'bg-green-100 text-green-800',
    CON_DIFERENCIA: 'bg-orange-100 text-orange-800',
    CERRADA: 'bg-emerald-100 text-emerald-800',
    RECHAZADA: 'bg-red-100 text-red-800',
    SIN_ORIGEN_DISPONIBLE: 'bg-rose-100 text-rose-800',
    ERROR_RESERVA: 'bg-red-100 text-red-800',
    ESCALADA: 'bg-amber-100 text-amber-800',
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

export default function DashboardPage() {
  const { transfers } = useTransferStore()

  const stats = useMemo(() => {
    const total = transfers.length
    const pending = transfers.filter(
      (t) =>
        t.estado === 'CREADA' ||
        t.estado === 'APROBADA' ||
        t.estado === 'ESCALADA' ||
        t.estado === 'SIN_ORIGEN_DISPONIBLE',
    ).length

    const inTransit = transfers.filter(
      (t) =>
        t.estado === 'RESERVADA' ||
        t.estado === 'EN_TRANSITO' ||
        t.estado === 'EN_TRANSITO_CON_INCIDENTE',
    ).length

    const completed = transfers.filter(
      (t) =>
        t.estado === 'CERRADA' || t.estado === 'RECIBIDA_SIN_DIFERENCIA',
    ).length

    const withDifference = transfers.filter((t) => t.estado === 'CON_DIFERENCIA').length
    const rejected = transfers.filter((t) => t.estado === 'RECHAZADA').length
    const errors = transfers.filter((t) => t.estado === 'ERROR_RESERVA').length

    return { total, pending, inTransit, completed, withDifference, rejected, errors }
  }, [transfers])

  const recentActivity = useMemo(() => {
    return [...transfers]
      .sort(
        (a, b) =>
          new Date(b.fecha_actualizacion).getTime() -
          new Date(a.fecha_actualizacion).getTime(),
      )
      .slice(0, 5)
  }, [transfers])

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Panel operacional en tiempo real - {stats.total} transferencias activas</p>
        </div>
        <Link
          to="/transfers/new"
          className="px-4 py-2 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 transition"
        >
          + Nueva Transferencia
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-gray-600">Total de transferencias</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="mt-1 text-xs text-gray-500">Registradas en el sistema</p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-yellow-700">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="mt-1 text-xs text-yellow-600">Por revisar o reencaminar</p>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-purple-700">En proceso</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">{stats.inTransit}</p>
          <p className="mt-1 text-xs text-purple-600">Reservadas o en tránsito</p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-green-700">Completadas</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.completed}</p>
          <p className="mt-1 text-xs text-green-600">Recibidas o cerradas</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.withDifference > 0 && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-orange-700">Con diferencia</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">{stats.withDifference}</p>
            <p className="mt-1 text-xs text-orange-600">Requieren conciliación</p>
          </div>
        )}

        {stats.rejected > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">Rechazadas</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="mt-1 text-xs text-red-600">No continuaron el flujo</p>
          </div>
        )}

        {stats.errors > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">Errores</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{stats.errors}</p>
            <p className="mt-1 text-xs text-red-600">Requieren revisión técnica</p>
          </div>
        )}
      </div>

      {/* Alertas Operacionales */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18.664 3.217A1 1 0 00.337 2.283l2.13 10.652a1 1 0 001.965 0L6 5a1 1 0 011.5-.5l2.5 2 2.5-2a1 1 0 011.5.5l1.568 7.935c2.4 0 4.5-2.1 4.5-4.682V5.335a1 1 0 00-1.336-.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Alertas Operacionales</h3>
            <div className="mt-2 space-y-2 text-sm text-amber-800">
              {stats.errors > 0 && (
                <p>• {stats.errors} transferencia(s) con error de reserva requieren evaluación</p>
              )}
              {stats.withDifference > 0 && (
                <p>• {stats.withDifference} transferencia(s) con diferencia en recepción</p>
              )}
              {stats.rejected > 0 && (
                <p>• {stats.rejected} solicitud(es) rechazada(s) - revisar motivos</p>
              )}
              {stats.pending > 2 && (
                <p>• {stats.pending} transferencias aguardando aprobación del supervisor</p>
              )}
              {stats.errors === 0 && stats.withDifference === 0 && stats.rejected === 0 && stats.pending <= 2 && (
                <p className="text-green-700">✓ Sistema operacional normal - No hay alertas críticas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
          <Link to="/transfers" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Ver todas →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-center text-gray-500">No hay actividad registrada</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{transfer.id}</span>
                    <span className="text-sm text-gray-600">{transfer.producto}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {transfer.origen} → {transfer.destino} • Cantidad: {transfer.cantidad}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      transfer.estado,
                    )}`}
                  >
                    {getStatusLabel(transfer.estado)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(transfer.fecha_actualizacion)}
                  </span>
                  <Link
                    to={`/transfers/${transfer.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Flujo Principal (Happy Path)</h3>
          <div className="space-y-2 text-xs text-blue-700">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              CREADA → APROBADA
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              APROBADA → RESERVADA
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              RESERVADA → EN_TRANSITO
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              EN_TRANSITO → RECIBIDA_SIN_DIFERENCIA
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              RECIBIDA_SIN_DIFERENCIA → CERRADA
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Estados Críticos</h3>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600"></span>
              RECHAZADA - Transferencia rechazada
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600"></span>
              ERROR_RESERVA - Falla en reserva de producto
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-600"></span>
              CON_DIFERENCIA - Diferencia en recepción
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}