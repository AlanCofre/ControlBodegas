import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'

const PRODUCTOS_MOCK = [
  'Laptop DELL XPS 13',
  'Monitor LG 27"',
  'Teclado Mecánico RGB',
  'Mouse Logitech MX Master',
  'Monitor Samsung 32"',
  'Webcam Logitech HD',
  'Auriculares Sony WH-1000XM5',
  'Docking Station USB-C',
  'Cable HDMI 2.1',
  'Adaptador DisplayPort',
]

const BODEGAS_MOCK = ['Bodega Centro', 'Bodega Norte', 'Bodega Sur', 'Bodega Este', 'Bodega Oeste']

export default function CreateTransferPage() {
  const navigate = useNavigate()
  const { createTransfer } = useTransferStore()

  const [formData, setFormData] = useState({
    producto: '',
    cantidad: '',
    prioridad: 'normal',
    origen: '',
    destino: '',
    descripcion: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.producto.trim()) newErrors.producto = 'Producto requerido'
    if (!formData.cantidad || parseInt(formData.cantidad, 10) <= 0) newErrors.cantidad = 'Cantidad debe ser mayor a 0'
    if (!formData.origen) newErrors.origen = 'Bodega origen requerida'
    if (!formData.destino) newErrors.destino = 'Bodega destino requerida'
    if (formData.origen === formData.destino) newErrors.destino = 'Origen y destino deben ser diferentes'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    // Simular validación del backend
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newTransferId = createTransfer(
      formData.producto,
      parseInt(formData.cantidad, 10),
      formData.origen,
      formData.destino,
      formData.prioridad,
      formData.descripcion,
    )

    setLoading(false)
    navigate(`/transfers/${newTransferId}`)
  }

  const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, producto: e.target.value })
    setErrors({ ...errors, producto: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud de Transferencia</h1>
        <p className="mt-1 text-gray-600">Completa el formulario para crear una transferencia de stock</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Detalles de la Solicitud</h2>

          <div className="space-y-5">
            {/* Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto *
              </label>
              <select
                name="producto"
                value={formData.producto}
                onChange={handleProductoChange}
                className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                  errors.producto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              >
                <option value="">-- Seleccionar producto --</option>
                {PRODUCTOS_MOCK.map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
              {errors.producto && <p className="mt-1 text-sm text-red-600">{errors.producto}</p>}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (unidades) *
              </label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                min="1"
                className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                  errors.cantidad ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Ingrese la cantidad"
              />
              {errors.cantidad && <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>}
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleInputChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="baja">Baja</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            {/* Bodegas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bodega Origen *
                </label>
                <select
                  name="origen"
                  value={formData.origen}
                  onChange={handleInputChange}
                  className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                    errors.origen ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  <option value="">-- Seleccionar --</option>
                  {BODEGAS_MOCK.map((bodega) => (
                    <option key={bodega} value={bodega}>
                      {bodega}
                    </option>
                  ))}
                </select>
                {errors.origen && <p className="mt-1 text-sm text-red-600">{errors.origen}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bodega Destino *
                </label>
                <select
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                    errors.destino ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  <option value="">-- Seleccionar --</option>
                  {BODEGAS_MOCK.map((bodega) => (
                    <option key={bodega} value={bodega}>
                      {bodega}
                    </option>
                  ))}
                </select>
                {errors.destino && <p className="mt-1 text-sm text-red-600">{errors.destino}</p>}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Agregue notas o comentarios relevantes..."
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/transfers')}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </>
            ) : (
              'Crear Solicitud'
            )}
          </button>
        </div>

        {/* Información */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-700 uppercase">Información</p>
          <p className="text-sm text-blue-700 mt-2">
            La solicitud será creada en estado <strong>CREADA</strong> y enviada al supervisor de bodega para evaluación operacional.
          </p>
        </div>
      </form>
    </div>
  )
}
