import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'
import type { TransferStatus } from '../types'

const getStatusColor = (status: TransferStatus) => {
  const colors: Record<TransferStatus, string> = {
    CREADA: 'bg-slate-100 text-slate-800 border border-slate-300',
    APROBADA: 'bg-blue-100 text-blue-800 border border-blue-300',
    RESERVADA: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
    EN_TRANSITO: 'bg-purple-100 text-purple-800 border border-purple-300',
    EN_TRANSITO_CON_INCIDENTE: 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300',
    RECIBIDA_SIN_DIFERENCIA: 'bg-green-100 text-green-800 border border-green-300',
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

const getActionButtons = (
  status: TransferStatus,
): { label: string; action: string; color: string }[] => {
  const actions: Record<TransferStatus, { label: string; action: string; color: string }[]> = {
    CREADA: [
      { label: 'Aprobar', action: 'approve', color: 'bg-green-600 hover:bg-green-700' },
      { label: 'Rechazar', action: 'reject', color: 'bg-red-600 hover:bg-red-700' },
    ],
    APROBADA: [{ label: 'Reservar', action: 'reserve', color: 'bg-blue-600 hover:bg-blue-700' }],
    RESERVADA: [{ label: 'Despachar', action: 'dispatch', color: 'bg-purple-600 hover:bg-purple-700' }],
    EN_TRANSITO: [{ label: 'Recibir', action: 'receive', color: 'bg-cyan-600 hover:bg-cyan-700' }],
    EN_TRANSITO_CON_INCIDENTE: [{ label: 'Recibir', action: 'receive', color: 'bg-cyan-600 hover:bg-cyan-700' }],
    RECIBIDA_SIN_DIFERENCIA: [{ label: 'Cerrar', action: 'close', color: 'bg-emerald-600 hover:bg-emerald-700' }],
    CON_DIFERENCIA: [{ label: 'Cerrar', action: 'close', color: 'bg-emerald-600 hover:bg-emerald-700' }],
    CERRADA: [],
    RECHAZADA: [],
    SIN_ORIGEN_DISPONIBLE: [],
    ERROR_RESERVA: [],
    ESCALADA: [],
  }

  return actions[status]
}

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    transfers,
    approveTransfer,
    rejectTransfer,
    reserveTransfer,
    dispatchTransfer,
    receiveTransfer,
    closeTransfer,
  } = useTransferStore()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [quantityReceived, setQuantityReceived] = useState('')

  const transfer = transfers.find((t) => t.id === id)

  if (!transfer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Transferencia no encontrada</h1>
          <button
            onClick={() => navigate('/transfers')}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Volver a listado
          </button>
        </div>
      </div>
    )
  }

  const actions = getActionButtons(transfer.estado)

  const handleAction = (action: string) => {
    switch (action) {
      case 'approve':
        approveTransfer(transfer.id)
        break
      case 'reject':
        setShowRejectModal(true)
        break
      case 'reserve':
        reserveTransfer(transfer.id)
        break
      case 'dispatch':
        dispatchTransfer(transfer.id)
        break
      case 'receive':
        setShowReceiveModal(true)
        break
      case 'close':
        closeTransfer(transfer.id)
        break
    }
  }

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return
    rejectTransfer(transfer.id, rejectReason)
    setShowRejectModal(false)
    setRejectReason('')
  }

  const handleReceiveConfirm = () => {
    const parsed = parseInt(quantityReceived, 10)
    if (Number.isNaN(parsed) || parsed < 0) return

    receiveTransfer(transfer.id, parsed)
    setShowReceiveModal(false)
    setQuantityReceived('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transferencia {transfer.id}</h1>
          <p className="mt-1 text-gray-600">Gestión operacional del flujo de transferencia</p>
        </div>
        <button
          onClick={() => navigate('/transfers')}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          ← Volver a listado
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado actual</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Estado:</span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                  transfer.estado,
                )}`}
              >
                {getStatusLabel(transfer.estado)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Prioridad:</span>
              <span className="text-sm font-medium capitalize text-gray-900">{transfer.prioridad}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Creada por:</span>
              <span className="text-sm text-gray-900">{transfer.creada_por}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Última actualización:</span>
              <span className="text-sm text-gray-600">{formatDate(transfer.fecha_actualizacion)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Información operacional</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Producto</p>
              <p className="text-sm font-semibold text-gray-900">{transfer.producto}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Cantidad solicitada</p>
                <p className="text-lg font-bold text-gray-900">{transfer.cantidad}</p>
              </div>

              {transfer.cantidad_recibida !== undefined && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Cantidad recibida</p>
                  <p className="text-lg font-bold text-gray-900">{transfer.cantidad_recibida}</p>
                  {transfer.diferencia !== undefined && transfer.diferencia !== 0 && (
                    <p className="mt-1 text-xs text-orange-600">
                      Diferencia: {transfer.diferencia > 0 ? '+' : ''}
                      {transfer.diferencia}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ruta de transferencia</h2>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-gray-500">Bodega origen</p>
            <p className="text-lg font-semibold text-gray-900">{transfer.origen}</p>
          </div>
          <div className="mx-6 text-2xl text-gray-400">→</div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-gray-500">Bodega destino</p>
            <p className="text-lg font-semibold text-gray-900">{transfer.destino}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Timeline de eventos</h2>
        <div className="space-y-4">
          {transfer.eventos.map((evento, index) => (
            <div key={evento.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-100">
                  <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                </div>
                {index < transfer.eventos.length - 1 && <div className="mt-2 h-12 w-0.5 bg-blue-200"></div>}
              </div>

              <div className="flex-1 pb-4">
                <p className="text-sm font-semibold text-gray-900">{evento.accion}</p>
                <p className="mt-1 text-sm text-gray-600">{evento.descripcion}</p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>👤 {evento.actor}</span>
                  <span>Rol: {evento.rol}</span>
                  <span>⏱️ {formatDate(evento.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Acciones disponibles</h2>
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                className={`rounded-lg px-4 py-2 font-medium text-white transition ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Rechazar transferencia</h3>
            <p className="mb-4 text-sm text-gray-600">Indique el motivo del rechazo:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder="Motivo del rechazo..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Recibir transferencia</h3>
            <p className="mb-4 text-sm text-gray-600">
              Cantidad solicitada: <strong>{transfer.cantidad}</strong>
            </p>
            <p className="mb-4 text-sm text-gray-600">Indique la cantidad recibida:</p>
            <input
              type="number"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              min="0"
              placeholder="Cantidad recibida..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReceiveModal(false)
                  setQuantityReceived('')
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReceiveConfirm}
                disabled={!quantityReceived}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar recepción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}