import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'
import { useAuth } from '../../../shared/auth/AuthContext'
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
    SIN_ORIGEN: 'bg-rose-100 text-rose-800 border border-rose-300',
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
    SIN_ORIGEN: 'Sin origen disponible',
    ERROR_RESERVA: 'Error de reserva',
    ESCALADA: 'Escalada',
  }

  return labels[status]
}

const getActionButtons = (
  transfer: any,
  user?: { id: number; rol: string; bodegaId?: number | null } | null,
): { label: string; action: string; color: string }[] => {
  const status = transfer.estado
  const currentRole = user?.rol


  if (status === 'CREADA' || status === 'ESCALADA') {
    if (currentRole === 'administrador') {
      return [
        {
          label: 'Aprobar',
          action: 'approve',
          color: 'bg-green-600 hover:bg-green-700',
        },
        {
          label: 'Rechazar',
          action: 'reject',
          color: 'bg-red-600 hover:bg-red-700',
        },
      ]
    }
    if (currentRole === 'supervisor_bodega' && user) {
      const isCreator = transfer.solicitante_id === user.id
      const isOriginWarehouse = transfer.origen_id === user.bodegaId
      if (!isCreator && isOriginWarehouse) {
        return [
          {
            label: 'Aprobar',
            action: 'approve',
            color: 'bg-green-600 hover:bg-green-700',
          },
          {
            label: 'Rechazar',
            action: 'reject',
            color: 'bg-red-600 hover:bg-red-700',
          },
        ]
      }
    }
  }

  if (
    status === 'APROBADA' &&
    (currentRole === 'administrador' || currentRole === 'operador_bodega')
  ) {
    if (currentRole === 'operador_bodega') {
      const isOriginWarehouse = Number(transfer.origen_id) === Number(user?.bodegaId)
      if (!isOriginWarehouse) {
        return []
      }
    }

    return [
      {
        label: 'Reservar',
        action: 'reserve',
        color: 'bg-blue-600 hover:bg-blue-700',
      },
      {
        label: 'Cancelar Solicitud',
        action: 'cancel_reserve',
        color: 'bg-red-600 hover:bg-red-700',
      },
    ]
  }

  if (
    status === 'RESERVADA' &&
    (currentRole === 'administrador' ||
      currentRole === 'operador_bodega' ||
      currentRole === 'transportista')
  ) {
    if (currentRole === 'operador_bodega') {
      const isOriginWarehouse = Number(transfer.origen_id) === Number(user?.bodegaId)
      if (!isOriginWarehouse) {
        return []
      }
    }
    if (!transfer.transportista_id) {
      return []
    }
    return [
      {
        label: 'Despachar',
        action: 'dispatch',
        color: 'bg-purple-600 hover:bg-purple-700',
      },
    ]
  }

  if (
    status === 'EN_TRANSITO' &&
    currentRole === 'transportista' &&
    Number(transfer.transportista_id) === Number(user?.id)
  ) {
    return [
      {
        label: 'Reportar Incidente',
        action: 'report_incident',
        color: 'bg-red-600 hover:bg-red-700',
      },
    ]
  }

  if (
    (status === 'EN_TRANSITO' || status === 'EN_TRANSITO_CON_INCIDENTE') &&
    (currentRole === 'administrador' ||
      currentRole === 'operador_bodega')
  ) {
    if (currentRole === 'operador_bodega') {
      const isDestinationWarehouse = Number(transfer.destino_id) === Number(user?.bodegaId)
      if (!isDestinationWarehouse) {
        return []
      }
    }
    return [
      {
        label: 'Recibir',
        action: 'receive',
        color: 'bg-cyan-600 hover:bg-cyan-700',
      },
    ]
  }

  if (
    (status === 'RECIBIDA_SIN_DIFERENCIA' || status === 'CON_DIFERENCIA') &&
    (currentRole === 'administrador' ||
      currentRole === 'supervisor_bodega')
  ) {
    return [
      {
        label: 'Cerrar',
        action: 'close',
        color: 'bg-emerald-600 hover:bg-emerald-700',
      },
    ]
  }

  return []
}

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    transfers,
    approveTransfer,
    rejectTransfer,
    reserveTransfer,
    dispatchTransfer,
    receiveTransfer,
    closeTransfer,
    cancelReserveTransfer,
    assignCarrier,
    getAvailableCarriers,
    reportIncident,
  } = useTransferStore()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [quantityReceived, setQuantityReceived] = useState('')
  const [showCancelReserveModal, setShowCancelReserveModal] = useState(false)
  const [cancelReserveReason, setCancelReserveReason] = useState('Stock físico insuficiente')
  const [cancelReserveReasonOtro, setCancelReserveReasonOtro] = useState('')
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [incidentDescription, setIncidentDescription] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [availableCarriers, setAvailableCarriers] = useState<any[]>([])
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('')
  const [loadingCarriers, setLoadingCarriers] = useState(false)

  const transfer = transfers.find((t) => t.id === id)

  const isOriginWarehouse = transfer?.origen_id && user && Number(transfer.origen_id) === Number(user.bodegaId)
  const canAssignCarrier = !!(user && (user.rol === 'administrador' || (user.rol === 'operador_bodega' && isOriginWarehouse)))

  useEffect(() => {
    const fetchCarriers = async () => {
      if (transfer && transfer.estado === 'RESERVADA' && !transfer.transportista_id && canAssignCarrier) {
        setLoadingCarriers(true)
        try {
          const carriers = await getAvailableCarriers()
          setAvailableCarriers(carriers)
          if (carriers.length > 0) {
            setSelectedCarrierId(String(carriers[0].id))
          } else {
            setSelectedCarrierId('')
          }
        } catch (err) {
          console.error('Error al cargar transportistas:', err)
        } finally {
          setLoadingCarriers(false)
        }
      }
    }
    fetchCarriers()
  }, [transfer?.id, transfer?.estado, transfer?.transportista_id, canAssignCarrier])

  if (!transfer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Transferencia no encontrada
          </h1>
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

  const actions = getActionButtons(transfer, user)

  const handleAction = async (action: string) => {
    setActionLoading(true)
    setErrorMessage('')
    try {
      switch (action) {
        case 'approve':
          await approveTransfer(transfer.id)
          break
        case 'reject':
          setShowRejectModal(true)
          break
        case 'reserve':
          await reserveTransfer(transfer.id)
          break
        case 'cancel_reserve':
          setShowCancelReserveModal(true)
          break
        case 'dispatch':
          await dispatchTransfer(transfer.id)
          break
        case 'report_incident':
          setShowIncidentModal(true)
          break
        case 'receive':
          setShowReceiveModal(true)
          break
        case 'close':
          await closeTransfer(transfer.id)
          break
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al ejecutar la acción')
    } finally {
      setActionLoading(false)
    }
  }

  const handleIncidentConfirm = async () => {
    if (!incidentDescription.trim()) return
    setActionLoading(true)
    setErrorMessage('')
    try {
      await reportIncident(transfer.id, incidentDescription)
      setShowIncidentModal(false)
      setIncidentDescription('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al reportar el incidente')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelReserveConfirm = async () => {
    const finalReason = cancelReserveReason === 'Otro' ? cancelReserveReasonOtro.trim() : cancelReserveReason
    if (!finalReason) return
    setActionLoading(true)
    setErrorMessage('')
    try {
      await cancelReserveTransfer(transfer.id, finalReason)
      setShowCancelReserveModal(false)
      setCancelReserveReason('Stock físico insuficiente')
      setCancelReserveReasonOtro('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al cancelar la reserva')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    setErrorMessage('')
    try {
      await rejectTransfer(transfer.id, rejectReason)
      setShowRejectModal(false)
      setRejectReason('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al rechazar')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReceiveConfirm = async () => {
    const parsed = parseInt(quantityReceived, 10)
    if (Number.isNaN(parsed) || parsed < 0) return
    setActionLoading(true)
    setErrorMessage('')
    try {
      await receiveTransfer(transfer.id, parsed)
      setShowReceiveModal(false)
      setQuantityReceived('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al recibir')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Transferencia {transfer.id}
          </h1>
          <p className="mt-1 text-gray-600">
            Gestión operacional del flujo de transferencia
          </p>
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
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Estado actual
          </h2>
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
              <span className="text-sm font-medium text-gray-600">
                Prioridad:
              </span>
              <span className="text-sm font-medium capitalize text-gray-900">
                {transfer.prioridad}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Creada por:
              </span>
              <span className="text-sm text-gray-900">
                {transfer.creada_por}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Última actualización:
              </span>
              <span className="text-sm text-gray-600">
                {formatDate(transfer.fecha_actualizacion)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Información operacional
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Producto
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {transfer.producto}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Cantidad solicitada
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {transfer.cantidad}
                </p>
              </div>

              {transfer.cantidad_recibida !== undefined && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Cantidad recibida
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {transfer.cantidad_recibida}
                  </p>
                  {transfer.diferencia !== undefined &&
                    transfer.diferencia !== 0 && (
                      <p className="mt-1 text-xs text-orange-600">
                        Diferencia: {transfer.diferencia > 0 ? '+' : ''}
                        {transfer.diferencia}
                      </p>
                    )}
                </div>
              )}
            </div>

            {transfer.descripcion && (
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Observaciones
                </p>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 mt-1 whitespace-pre-wrap">
                  {transfer.descripcion}
                </p>
              </div>
            )}

            {transfer.motivo_rechazo && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <strong>Motivo de rechazo:</strong> {transfer.motivo_rechazo}
              </div>
            )}

            {transfer.motivo_cancelacion_reserva && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
                <strong>Motivo de cancelación de reserva (Diferencia física):</strong> {transfer.motivo_cancelacion_reserva}
              </div>
            )}

            {transfer.transportista_nombre && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Transportista asignado
                </p>
                <p className="text-sm font-semibold text-gray-900 bg-purple-50 p-2 rounded border border-purple-100 mt-1 flex items-center gap-2">
                  <span>🚚</span>
                  <span>{transfer.transportista_nombre}</span>
                </p>
              </div>
            )}

            {transfer.descripcion_incidente && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 mt-2 animate-fade-in">
                <strong>⚠️ Incidente Reportado:</strong> {transfer.descripcion_incidente}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Ruta de transferencia
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-gray-500">
              Bodega origen
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {transfer.origen}
            </p>
          </div>
          <div className="mx-6 text-2xl text-gray-400">→</div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-gray-500">
              Bodega destino
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {transfer.destino}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Timeline de eventos
        </h2>
        <div className="space-y-4">
          {transfer.eventos.map((evento, index) => (
            <div key={evento.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-100">
                  <span className="text-xs font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                {index < transfer.eventos.length - 1 && (
                  <div className="mt-2 h-12 w-0.5 bg-blue-200"></div>
                )}
              </div>

              <div className="flex-1 pb-4">
                <p className="text-sm font-semibold text-gray-900">
                  {evento.accion}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {evento.descripcion}
                </p>
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

      {transfer.estado === 'RESERVADA' && !transfer.transportista_id && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-yellow-800 flex items-center gap-2">
            ⚠️ Asignación de Transportista Requerida
          </h2>
          <p className="mb-4 text-sm text-gray-700">
            Esta transferencia se encuentra reservada. Debe asignarse un transportista disponible antes de registrar el despacho.
          </p>

          {canAssignCarrier ? (
            <div className="space-y-4">
              {loadingCarriers ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                  Buscando transportistas disponibles...
                </div>
              ) : availableCarriers.length === 0 ? (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  No hay transportistas disponibles en este momento (todos se encuentran en tránsito en otras transferencias).
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportistas disponibles:
                    </label>
                    <select
                      value={selectedCarrierId}
                      onChange={(e) => setSelectedCarrierId(e.target.value)}
                      disabled={actionLoading}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      {availableCarriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      if (!selectedCarrierId) return
                      setActionLoading(true)
                      setErrorMessage('')
                      try {
                        await assignCarrier(transfer.id, Number(selectedCarrierId))
                      } catch (err: any) {
                        setErrorMessage(err.message || 'Error al asignar transportista')
                      } finally {
                        setActionLoading(false)
                      }
                    }}
                    disabled={actionLoading || !selectedCarrierId}
                    className="w-full sm:w-auto rounded-lg bg-yellow-600 hover:bg-yellow-700 px-4 py-2 font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Asignar Transportista
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-gray-100 p-3 text-sm text-gray-700 border border-gray-200">
              Solo un operador de la bodega origen ({transfer.origen}) o un administrador pueden asignar el transportista.
            </div>
          )}
        </div>
      )}

      {(actions.length > 0 || errorMessage) && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Acciones disponibles
          </h2>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {actions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                disabled={actionLoading}
                className={`rounded-lg px-4 py-2 font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              >
                {action.label}
              </button>
            ))}
            {actionLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Procesando acción...
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Rechazar transferencia
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Indique el motivo del rechazo:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={actionLoading}
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
                disabled={actionLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || actionLoading}
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Recibir transferencia
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Cantidad solicitada: <strong>{transfer.cantidad}</strong>
            </p>
            <p className="mb-4 text-sm text-gray-600">
              Indique la cantidad recibida:
            </p>
            <input
              type="number"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(e.target.value)}
              disabled={actionLoading}
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
                disabled={actionLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReceiveConfirm}
                disabled={!quantityReceived || actionLoading}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar recepción
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Cancelar Solicitud de Transferencia
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Indique el motivo por el cual no se puede realizar la reserva de stock (diferencias físicas detectadas):
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <select
                  value={cancelReserveReason}
                  onChange={(e) => setCancelReserveReason(e.target.value)}
                  disabled={actionLoading}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Stock físico insuficiente">Stock físico insuficiente</option>
                  <option value="Diferencia de inventario detectada">Diferencia de inventario detectada</option>
                  <option value="Producto no encontrado">Producto no encontrado</option>
                  <option value="Producto dañado">Producto dañado</option>
                  <option value="Error de registro de inventario">Error de registro de inventario</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {cancelReserveReason === 'Otro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especifique el motivo *
                  </label>
                  <textarea
                    value={cancelReserveReasonOtro}
                    onChange={(e) => setCancelReserveReasonOtro(e.target.value)}
                    disabled={actionLoading}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    rows={3}
                    placeholder="Escriba el motivo detallado aquí..."
                    required
                  />
                 </div>
               )}

               <div className="flex gap-3 pt-2">
                 <button
                   onClick={() => {
                     setShowCancelReserveModal(false)
                     setCancelReserveReason('Stock físico insuficiente')
                     setCancelReserveReasonOtro('')
                   }}
                   disabled={actionLoading}
                   className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={handleCancelReserveConfirm}
                   disabled={actionLoading || (cancelReserveReason === 'Otro' && !cancelReserveReasonOtro.trim())}
                   className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                 >
                   Confirmar
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl border border-gray-100">
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Reportar Incidente en Ruta
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Describa en detalle el problema ocurrido durante el transporte. Esta información quedará registrada en la bitácora de auditoría y la transferencia pasará a estado con incidente:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Incidente *
                </label>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  disabled={actionLoading}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  rows={4}
                  placeholder="Ej: Avería mecánica en ruta, retraso de 2 horas..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowIncidentModal(false)
                    setIncidentDescription('')
                  }}
                  disabled={actionLoading}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleIncidentConfirm}
                  disabled={actionLoading || !incidentDescription.trim()}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Confirmar Incidente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}