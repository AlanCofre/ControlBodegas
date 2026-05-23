import { useState } from 'react'

interface SupervisorEvaluationProps {
  transferId: string
  estado: string
  onApprove: () => void
  onReject: (motivo: string) => void
  disabled?: boolean
}

export default function SupervisorEvaluation({
  transferId,
  estado,
  onApprove,
  onReject,
  disabled = false,
}: SupervisorEvaluationProps) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectMotivo, setRejectMotivo] = useState('')
  const [evaluating, setEvaluating] = useState(false)

  if (estado !== 'CREADA') {
    return null
  }

  const handleApprove = async () => {
    setEvaluating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setEvaluating(false)
    onApprove()
  }

  const handleRejectConfirm = async () => {
    if (!rejectMotivo.trim()) return
    
    setEvaluating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setEvaluating(false)
    
    onReject(rejectMotivo)
    setShowRejectModal(false)
    setRejectMotivo('')
  }

  const viabilidad = {
    stock: 'Disponible',
    distancia: 'Óptima',
    recursos: 'Disponibles',
    prioridad: 'Normal',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluación del Supervisor</h3>

      {/* Indicadores de Viabilidad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg border border-green-200 bg-green-50">
          <p className="text-xs font-medium text-green-700">Stock</p>
          <p className="text-sm font-semibold text-green-900 mt-1">{viabilidad.stock}</p>
        </div>
        <div className="p-3 rounded-lg border border-green-200 bg-green-50">
          <p className="text-xs font-medium text-green-700">Distancia</p>
          <p className="text-sm font-semibold text-green-900 mt-1">{viabilidad.distancia}</p>
        </div>
        <div className="p-3 rounded-lg border border-green-200 bg-green-50">
          <p className="text-xs font-medium text-green-700">Recursos</p>
          <p className="text-sm font-semibold text-green-900 mt-1">{viabilidad.recursos}</p>
        </div>
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
          <p className="text-xs font-medium text-blue-700">Prioridad</p>
          <p className="text-sm font-semibold text-blue-900 mt-1">{viabilidad.prioridad}</p>
        </div>
      </div>

      {/* Información */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Supervisor:</span> Carlos S. (Bodega Centro)
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <span className="font-medium">Recomendación:</span> Aprobar - Todos los indicadores operacionales son favorables.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={disabled || evaluating}
          className="flex-1 px-4 py-2 rounded-lg bg-green-600 font-medium text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {evaluating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Aprobando...
            </>
          ) : (
            '✓ Aprobar Solicitud'
          )}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={disabled || evaluating}
          className="flex-1 px-4 py-2 rounded-lg border border-red-300 font-medium text-red-700 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✗ Rechazar
        </button>
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechazar Solicitud</h3>
            <p className="text-sm text-gray-600 mb-4">Indique el motivo del rechazo:</p>
            <textarea
              value={rejectMotivo}
              onChange={(e) => setRejectMotivo(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 mb-4"
              rows={4}
              placeholder="Motivo del rechazo..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectMotivo('')
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectMotivo.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 font-medium text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
