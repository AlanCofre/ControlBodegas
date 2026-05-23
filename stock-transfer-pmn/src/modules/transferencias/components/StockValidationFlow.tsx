import { useState, useEffect } from 'react'

interface StockValidationFlowProps {
  transferId: string
  producto: string
  cantidad: number
  origen: string
  onValidationComplete: (success: boolean, resultado?: string) => void
  autoStart?: boolean
}

export default function StockValidationFlow({
  transferId,
  producto,
  cantidad,
  origen,
  onValidationComplete,
  autoStart = false,
}: StockValidationFlowProps) {
  const [step, setStep] = useState<'idle' | 'validating' | 'blocking' | 'complete'>('idle')
  const [mensaje, setMensaje] = useState('')
  const [success, setSuccess] = useState(false)
  const [resultado, setResultado] = useState('')

  useEffect(() => {
    if (autoStart && step === 'idle') {
      handleValidate()
    }
  }, [autoStart])

  const handleValidate = async () => {
    setStep('validating')
    setMensaje(`Validando stock disponible de "${producto}" en ${origen}...`)

    // Simular validación
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setStep('blocking')
    setMensaje('Bloqueando inventario temporalmente...')

    // Simular bloqueo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simular resultado exitoso (90% de probabilidad)
    const isSuccess = Math.random() < 0.9

    if (isSuccess) {
      setSuccess(true)
      setResultado(
        `Stock validado correctamente. ${cantidad} unidades disponibles en ${origen}.`
      )
      setMensaje('✓ Stock validado y bloqueado exitosamente')
      setStep('complete')
      onValidationComplete(true, 'VALIDADO')
    } else {
      setSuccess(false)
      setResultado(`Error: Stock insuficiente. Se solicitaron ${cantidad} unidades pero solo hay disponibles 3.`)
      setMensaje('✗ Error en validación de stock')
      setStep('complete')
      onValidationComplete(false, 'ERROR_STOCK')
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Validación de Stock</h3>

      {step === 'idle' && (
        <button
          onClick={handleValidate}
          className="px-4 py-2 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 transition"
        >
          Iniciar Validación
        </button>
      )}

      {(step === 'validating' || step === 'blocking' || step === 'complete') && (
        <div className="space-y-4">
          {/* Paso 1: Validación */}
          <div className={`flex gap-3 p-4 rounded-lg border ${
            step !== 'idle' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex-shrink-0">
              {step === 'idle' || step === 'validating' || step === 'blocking' ? (
                <div className={`h-5 w-5 rounded-full border-2 border-transparent border-t-blue-600 animate-spin`}></div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Validar disponibilidad</p>
              <p className="text-xs text-gray-600 mt-1">Verificando stock en sistema</p>
            </div>
          </div>

          {/* Paso 2: Bloqueo */}
          <div className={`flex gap-3 p-4 rounded-lg border ${
            step === 'blocking' || step === 'complete' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex-shrink-0">
              {step === 'blocking' ? (
                <div className={`h-5 w-5 rounded-full border-2 border-transparent border-t-blue-600 animate-spin`}></div>
              ) : step === 'complete' ? (
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Bloquear inventario</p>
              <p className="text-xs text-gray-600 mt-1">Reservando temporalmente</p>
            </div>
          </div>

          {/* Mensaje */}
          {step === 'complete' && (
            <div className={`p-4 rounded-lg border ${
              success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
            }`}>
              <p className={`text-sm font-medium ${success ? 'text-green-900' : 'text-red-900'}`}>
                {mensaje}
              </p>
              <p className={`text-xs mt-2 ${success ? 'text-green-700' : 'text-red-700'}`}>
                {resultado}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
