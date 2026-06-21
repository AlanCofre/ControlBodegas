import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransferStore } from '../../../app/store/TransferContext'
import { useAuth } from '../../../shared/auth/AuthContext'
import { supabase } from '../../../shared/utils/supabaseClient'

type Prioridad = 'baja' | 'normal' | 'alta' | 'urgente'

interface FormData {
  producto: string
  cantidad: string
  prioridad: Prioridad
  origen: string
  destino: string
  descripcion: string
}

interface BodegaStock {
  id: number
  nombre: string
  stockDisponible: number
}

export default function CreateTransferPage() {
  const navigate = useNavigate()
  const { createTransfer } = useTransferStore()
  const { user } = useAuth()

  const [productos, setProductos] = useState<string[]>([])
  const [bodegas, setBodegas] = useState<string[]>([])
  const [bodegaStocks, setBodegaStocks] = useState<BodegaStock[]>([])
  const [loadingStocks, setLoadingStocks] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    producto: '',
    cantidad: '',
    prioridad: 'normal',
    origen: '',
    destino: '',
    descripcion: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)

  // Cargar bodegas y productos reales desde la base de datos de Supabase
  useEffect(() => {
    const loadDbResources = async () => {
      try {
        setFetchingData(true)
        const { data: prodData, error: prodErr } = await supabase
          .from('productos')
          .select('nombre')
          .eq('activo', true)
          .order('nombre', { ascending: true })

        if (prodErr) throw prodErr
        if (prodData) setProductos(prodData.map((p) => p.nombre))

        const { data: bodegaData, error: bodegaErr } = await supabase
          .from('bodegas')
          .select('id, nombre')
          .eq('activa', true)
          .order('nombre', { ascending: true })

        if (bodegaErr) throw bodegaErr
        if (bodegaData) {
          setBodegas(bodegaData.map((b) => b.nombre))
          
          if (user && user.rol === 'supervisor_bodega' && user.bodegaId) {
            const userBodega = bodegaData.find((b: any) => Number(b.id) === Number(user.bodegaId))
            if (userBodega) {
              setFormData((prev) => ({ ...prev, destino: userBodega.nombre }))
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar recursos de base de datos:', err)
      } finally {
        setFetchingData(false)
      }
    }

    loadDbResources()
  }, [user])

  // Cargar stock disponible en tiempo real de cada bodega para el producto seleccionado
  useEffect(() => {
    const fetchStocks = async () => {
      if (!formData.producto) {
        setBodegaStocks([])
        return
      }

      try {
        setLoadingStocks(true)
        
        // 1. Obtener ID del producto seleccionado
        const { data: prodData, error: prodErr } = await supabase
          .from('productos')
          .select('id')
          .eq('nombre', formData.producto)
          .single()

        if (prodErr || !prodData) {
          setBodegaStocks([])
          return
        }

        // 2. Obtener el stock disponible de este producto en todas las bodegas
        const { data: invData, error: invErr } = await supabase
          .from('inventario')
          .select('stock_disponible, bodega_id')
          .eq('producto_id', prodData.id)

        if (invErr) throw invErr

        // 3. Obtener todas las bodegas activas cargadas desde la base de datos
        const { data: bodegasData, error: bodegasErr } = await supabase
          .from('bodegas')
          .select('id, nombre')
          .eq('activa', true)
          .order('nombre', { ascending: true })

        if (bodegasErr) throw bodegasErr

        if (bodegasData) {
          const mapped: BodegaStock[] = bodegasData.map((b) => {
            const invRecord = invData?.find((item: any) => Number(item.bodega_id) === Number(b.id))
            return {
              id: Number(b.id),
              nombre: b.nombre,
              stockDisponible: invRecord ? Number(invRecord.stock_disponible) : 0,
            }
          })
          setBodegaStocks(mapped)
        }
      } catch (err) {
        console.error('Error al cargar stock de bodegas:', err)
      } finally {
        setLoadingStocks(false)
      }
    }

    fetchStocks()
  }, [formData.producto])

  // Resetear la bodega origen si ya no es válida (por ejemplo, si coincide con destino o no tiene stock)
  useEffect(() => {
    if (formData.origen) {
      if (formData.destino && formData.origen === formData.destino) {
        setFormData((prev) => ({ ...prev, origen: '' }))
        return
      }

      if (bodegaStocks.length > 0) {
        const selectedBodegaStock = bodegaStocks.find((b) => b.nombre === formData.origen)
        const reqQty = parseInt(formData.cantidad, 10) || 0
        if (!selectedBodegaStock || selectedBodegaStock.stockDisponible < reqQty) {
          setFormData((prev) => ({ ...prev, origen: '' }))
        }
      }
    }
  }, [formData.destino, formData.cantidad, bodegaStocks, formData.origen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.producto.trim()) newErrors.producto = 'Producto requerido'
    if (!formData.cantidad || parseInt(formData.cantidad, 10) <= 0) {
      newErrors.cantidad = 'Cantidad debe ser mayor a 0'
    }
    if (!formData.origen) newErrors.origen = 'Bodega origen requerida'
    if (!formData.destino) newErrors.destino = 'Bodega destino requerida'
    if (formData.origen && formData.destino && formData.origen === formData.destino) {
      newErrors.destino = 'Origen y destino deben ser diferentes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const newTransferId = await createTransfer(
        formData.producto,
        parseInt(formData.cantidad, 10),
        formData.origen,
        formData.destino,
        formData.prioridad,
        formData.descripcion,
      )

      setLoading(false)
      navigate(`/transfers/${newTransferId}`)
    } catch (err) {
      console.error('Error al crear la transferencia:', err)
      setErrors((prev) => ({
        ...prev,
        submit: 'Error al comunicarse con la base de datos de Supabase.',
      }))
      setLoading(false)
    }
  }

  const handleProductoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, producto: e.target.value })
    setErrors({ ...errors, producto: '' })
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Nueva Solicitud de Transferencia
        </h1>
        <p className="mt-1 text-gray-600">
          Completa el formulario para crear una transferencia de stock
        </p>
      </div>

      {errors.submit && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errors.submit}
        </div>
      )}

      {fetchingData ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-500">Cargando recursos de la base de datos...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Detalles de la Solicitud
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Producto *
                </label>
                <select
                  name="producto"
                  value={formData.producto}
                  onChange={handleProductoChange}
                  className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                    errors.producto
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  <option value="">-- Seleccionar producto --</option>
                  {productos.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </select>
                {errors.producto && (
                  <p className="mt-1 text-sm text-red-600">{errors.producto}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cantidad (unidades) *
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                    errors.cantidad
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Ingrese la cantidad"
                />
                {errors.cantidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bodega Destino *
                  </label>
                  <select
                    name="destino"
                    value={formData.destino}
                    onChange={handleInputChange}
                    disabled={user?.rol === 'supervisor_bodega'}
                    className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
                      user?.rol === 'supervisor_bodega'
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : errors.destino
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">-- Seleccionar --</option>
                    {bodegas.map((bodega) => (
                      <option key={bodega} value={bodega}>
                        {bodega}
                      </option>
                    ))}
                  </select>
                  {errors.destino && (
                    <p className="mt-1 text-sm text-red-600">{errors.destino}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Bodega Origen *
                  </label>
                  
                  {!formData.producto ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                      <p className="text-sm">Por favor, seleccione un producto para ver las bodegas origen disponibles.</p>
                    </div>
                  ) : loadingStocks ? (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        Consultando disponibilidad de stock...
                      </div>
                    </div>
                  ) : bodegaStocks.filter((b) => b.nombre !== formData.destino).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                      <p className="text-sm text-red-600 font-medium">No hay otras bodegas de origen disponibles.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {bodegaStocks
                        .filter((b) => b.nombre !== formData.destino)
                        .map((b) => {
                          const reqQty = parseInt(formData.cantidad, 10) || 0
                          const hasEnoughStock = b.stockDisponible >= reqQty
                          const isSelected = formData.origen === b.nombre
                          
                          return (
                            <button
                              key={b.id}
                              type="button"
                              disabled={!hasEnoughStock}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, origen: b.nombre }))
                                setErrors((prev) => ({ ...prev, origen: '' }))
                              }}
                              className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                                  : hasEnoughStock
                                  ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                                  : 'border-gray-100 bg-gray-50/40 opacity-70 cursor-not-allowed'
                              }`}
                            >
                              <div className="w-full">
                                <div className="flex items-start justify-between">
                                  <span className={`font-semibold transition-colors ${
                                    isSelected 
                                      ? 'text-blue-900 font-bold' 
                                      : 'text-gray-900 group-hover:text-blue-700'
                                  }`}>
                                    {b.nombre}
                                  </span>
                                  {isSelected && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  Producto: <span className="font-medium text-gray-700">{formData.producto}</span>
                                </p>
                              </div>
                              
                              <div className="mt-4 w-full">
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                  <span className="text-xs text-gray-500">Stock disponible:</span>
                                  <span className={`text-sm font-bold ${
                                    hasEnoughStock 
                                      ? (isSelected ? 'text-blue-700' : 'text-green-700') 
                                      : 'text-red-600'
                                  }`}>
                                    {b.stockDisponible} uds
                                  </span>
                                </div>

                                {!hasEnoughStock && (
                                  <div className="mt-2.5 rounded bg-red-50 p-2 text-center text-[11px] font-medium text-red-700 border border-red-100/50">
                                    ⚠️ Stock insuficiente para esta solicitud
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  )}
                  {errors.origen && (
                    <p className="mt-1 text-sm text-red-600">{errors.origen}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/transfers')}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creando...
                </>
              ) : (
                'Crear Solicitud'
              )}
            </button>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase text-blue-700">
              Información
            </p>
            <p className="mt-2 text-sm text-blue-700">
              La solicitud será creada en estado <strong>CREADA</strong> y enviada
              al supervisor de bodega para evaluación operacional.
            </p>
          </div>
        </form>
      )}
    </div>
  )
}