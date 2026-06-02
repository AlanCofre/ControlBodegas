import { useEffect, useState } from 'react'

interface StockValidationFlowProps {
  transferId: string
  producto: string
  cantidad: number
  origen: string
  onValidationComplete: (success: boolean, resultado?: string) => void
  autoStart?: boolean
}

type ValidationStep = 'idle' | 'validating' | 'blocking' | 'complete'

export default function StockValidationFlow({
  transferId,
  producto,
  cantidad,
  origen,
  onValidationComplete,
  autoStart = false,
}: StockValidationFlowProps) {
  const [step, setStep] = useState<ValidationStep>('idle')
  const [mensaje, setMensaje] = useState('')
  const [success, setSuccess] = useState(false)
  const [resultado, setResultado] = useState('')

  const handleValidate = async () => {
    setStep('validating')
    setMensaje(`Validando stock disponible de "${producto}" en ${origen}...`)

    await new Promise((resolve) => setTimeout(resolve, 1200))

    setStep('blocking')
    setMensaje('Bloqueando inventario temporalmente...')

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const isSuccess = Math.random() < 0.9

    if (isSuccess) {
      setSuccess(true)
      setResultado(
        `Stock validado correctamente para la transferencia ${transferId}. ${cantidad} unidades disponibles en ${origen}.`,
      )
      setMensaje('✓ Stock validado y bloqueado exitosamente')
      setStep('complete')
      onValidationComplete(true, 'VALIDADO')
    } else {
      setSuccess(false)
      setResultado(
        `Error en transferencia ${transferId}: stock insuficiente. Se solicitaron ${cantidad} unidades pero solo hay disponibles 3.`,
      )
      setMensaje('✗ Error en validación de stock')
      setStep('complete')
      onValidationComplete(false, 'ERROR_STOCK')
    }
  }

  useEffect(() => {
    if (autoStart && step === 'idle') {
      void handleValidate()
    }
  }, [autoStart, step])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Validación de Stock
      </h3>

      {step === 'idle' && (
        <button
          onClick={() => void handleValidate()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Iniciar Validación
        </button>
      )}

      {step !== 'idle' && (
        <div className="space-y-4">
          <div
            className={`flex gap-3 rounded-lg border p-4 ${
              step === 'validating'
                ? 'border-blue-300 bg-blue-50'
                : step === 'blocking' || step === 'complete'
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              {step === 'validating' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-blue-600" />
              ) : step === 'blocking' || step === 'complete' ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                  <span className="text-xs text-white">✓</span>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Validar disponibilidad
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Verificando stock en sistema
              </p>
            </div>
          </div>

          <div
            className={`flex gap-3 rounded-lg border p-4 ${
              step === 'blocking'
                ? 'border-blue-300 bg-blue-50'
                : step === 'complete'
                  ? success
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              {step === 'blocking' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-blue-600" />
              ) : step === 'complete' ? (
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span className="text-xs text-white">
                    {success ? '✓' : '✕'}
                  </span>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Bloquear inventario
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Reservando temporalmente
              </p>
            </div>
          </div>

          {step === 'complete' && (
            <div
              className={`rounded-lg border p-4 ${
                success
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {mensaje}
              </p>
              <p
                className={`mt-2 text-xs ${
                  success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {resultado}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}