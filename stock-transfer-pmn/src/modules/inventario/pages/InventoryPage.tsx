import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../../../shared/utils/supabaseClient'
import { useAuth } from '../../../shared/auth/AuthContext'
import { useTransferStore } from '../../../app/store/TransferContext'

interface InventoryItem {
  id: number
  sku: string
  producto: string
  bodega: string
  stockDisponible: number
  stockReservado: number
  stockMinimo: number
  updatedAt: string
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBodega, setSelectedBodega] = useState('Todas')

  const { adjustStock } = useTransferStore()

  // Modal and DB items state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dbProducts, setDbProducts] = useState<{ id: number; nombre: string; sku: string }[]>([])
  const [dbBodegas, setDbBodegas] = useState<{ id: number; nombre: string }[]>([])

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedBodegaId, setSelectedBodegaId] = useState('')
  const [tipoAjuste, setTipoAjuste] = useState<'incrementar' | 'disminuir'>('incrementar')
  const [cantidad, setCantidad] = useState<number>(1)
  const [motivo, setMotivo] = useState('Error de conteo')
  const [motivoOtro, setMotivoOtro] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  // Cargar productos y bodegas para el formulario de ajuste
  const fetchProductsAndBodegas = useCallback(async () => {
    try {
      const { data: prodData } = await supabase.from('productos').select('id, nombre, sku').eq('activo', true)
      const { data: bodData } = await supabase.from('bodegas').select('id, nombre').eq('activa', true)
      if (prodData) setDbProducts(prodData)
      if (bodData) setDbBodegas(bodData)
    } catch (err) {
      console.error('Error al cargar productos y bodegas:', err)
    }
  }, [])

  useEffect(() => {
    fetchProductsAndBodegas()
  }, [fetchProductsAndBodegas])

  // Inicializar campos al abrir el modal
  useEffect(() => {
    if (isModalOpen) {
      if (user && user.rol === 'supervisor_bodega' && user.bodegaId) {
        setSelectedBodegaId(String(user.bodegaId))
      } else if (dbBodegas.length > 0) {
        setSelectedBodegaId(String(dbBodegas[0].id))
      }

      if (dbProducts.length > 0) {
        setSelectedProductId(String(dbProducts[0].id))
      }

      setCantidad(1)
      setTipoAjuste('incrementar')
      setMotivo('Error de conteo')
      setMotivoOtro('')
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isModalOpen, user, dbBodegas, dbProducts])

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) {
      setErrorMsg('Por favor seleccione un producto.')
      return
    }

    const targetBodegaId = user?.rol === 'supervisor_bodega' ? user.bodegaId : Number(selectedBodegaId)
    if (!targetBodegaId) {
      setErrorMsg('Por favor seleccione una bodega.')
      return
    }

    if (cantidad <= 0) {
      setErrorMsg('La cantidad debe ser mayor a 0.')
      return
    }

    const finalMotivo = motivo === 'Otro' ? motivoOtro.trim() : motivo
    if (!finalMotivo) {
      setErrorMsg('Debe especificar un motivo.')
      return
    }

    setSubmitLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const prodObj = dbProducts.find(p => p.id === Number(selectedProductId))
      const bodegaObj = dbBodegas.find(b => b.id === Number(targetBodegaId))

      if (!prodObj || !bodegaObj) {
        throw new Error('Producto o bodega no encontrados en el sistema.')
      }

      // Validar stock resultante en frontend
      const invItem = items.find(
        item => item.producto === prodObj.nombre && item.bodega === bodegaObj.nombre
      )
      const currentStock = invItem ? invItem.stockDisponible : 0
      const stockNuevo = tipoAjuste === 'incrementar' ? currentStock + cantidad : currentStock - cantidad

      if (stockNuevo < 0) {
        throw new Error(`El stock resultante no puede ser menor a 0. Stock disponible actual: ${currentStock}`)
      }

      await adjustStock(
        prodObj.id,
        prodObj.nombre,
        bodegaObj.id,
        bodegaObj.nombre,
        tipoAjuste,
        cantidad,
        finalMotivo
      )

      setSuccessMsg('Ajuste de stock realizado correctamente.')
      setTimeout(() => {
        setIsModalOpen(false)
        fetchInventory()
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el ajuste de stock.')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Obtener bodegas únicas para el filtro
  const bodegas = useMemo(() => {
    const list = new Set(items.map((item) => item.bodega))
    return ['Todas', ...Array.from(list)]
  }, [items])

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('inventario')
        .select(`
          id,
          stock_disponible,
          stock_reservado,
          updated_at,
          bodegas:bodegas!bodega_id (
            nombre
          ),
          productos:productos!producto_id (
            sku,
            nombre,
            stock_minimo
          )
        `)

      if (user && (user.rol === 'supervisor_bodega' || user.rol === 'operador_bodega')) {
        if (user.bodegaId) {
          query = query.eq('bodega_id', user.bodegaId)
        } else {
          // Si es supervisor u operador pero no tiene bodega asociada, no mostramos registros
          query = query.eq('bodega_id', -1)
        }
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        const mapped: InventoryItem[] = data.map((inv: any) => ({
          id: inv.id,
          sku: inv.productos ? inv.productos.sku : 'N/A',
          producto: inv.productos ? inv.productos.nombre : 'Desconocido',
          bodega: inv.bodegas ? inv.bodegas.nombre : 'Desconocida',
          stockDisponible: inv.stock_disponible,
          stockReservado: inv.stock_reservado,
          stockMinimo: inv.productos ? inv.productos.stock_minimo : 0,
          updatedAt: inv.updated_at,
        }))
        setItems(mapped)
      }
    } catch (err) {
      console.error('Error al obtener el inventario:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const uniqueSKUs = new Set(items.map((item) => item.sku)).size
    const uniqueBodegas = new Set(items.map((item) => item.bodega)).size
    const stockBajo = items.filter((item) => item.stockDisponible > 0 && item.stockDisponible < item.stockMinimo).length
    const sinStock = items.filter((item) => item.stockDisponible === 0).length

    return { uniqueSKUs, uniqueBodegas, stockBajo, sinStock }
  }, [items])

  // Filtrar ítems
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBodega = selectedBodega === 'Todas' || item.bodega === selectedBodega
      return matchesSearch && matchesBodega
    })
  }, [items, searchTerm, selectedBodega])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="mt-1 text-gray-600">Existencias actuales en tiempo real por cada bodega</p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.rol === 'administrador' || user?.rol === 'supervisor_bodega') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              🔧 Ajustar Stock
            </button>
          )}
          <button
            onClick={fetchInventory}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            🔄 Refrescar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-500">Cargando inventario...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600">Total de SKUs</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.uniqueSKUs}</p>
              <p className="mt-1 text-xs text-gray-500">Productos distintos registrados</p>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 shadow-sm">
              <p className="text-sm font-medium text-orange-700">Stock Bajo</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">{stats.stockBajo}</p>
              <p className="mt-1 text-xs text-orange-600">Bajo el límite mínimo de seguridad</p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm font-medium text-red-700">Sin Stock</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats.sinStock}</p>
              <p className="mt-1 text-xs text-red-600">Existencias en cero</p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-700">Bodegas activas</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats.uniqueBodegas}</p>
              <p className="mt-1 text-xs text-blue-600">Ubicaciones de almacenamiento</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
              <div className="flex flex-1 gap-4">
                <input
                  type="text"
                  placeholder="Buscar por producto o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <select
                  value={selectedBodega}
                  onChange={(e) => setSelectedBodega(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {bodegas.map((b) => (
                    <option key={b} value={b}>
                      {b === 'Todas' ? 'Todas las bodegas' : b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Bodega
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Stock Disponible
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Stock Reservado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Stock Mínimo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredItems.map((item) => {
                    let statusLabel = 'Normal'
                    let statusColor = 'bg-green-100 text-green-800'

                    if (item.stockDisponible === 0) {
                      statusLabel = 'Sin stock'
                      statusColor = 'bg-red-100 text-red-800'
                    } else if (item.stockDisponible < item.stockMinimo) {
                      statusLabel = 'Stock bajo'
                      statusColor = 'bg-orange-100 text-orange-800'
                    }

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{item.sku}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{item.producto}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.bodega}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{item.stockDisponible}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.stockReservado}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{item.stockMinimo}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        No hay existencias que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal de Ajuste de Stock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden transform transition-all duration-300 border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-xl font-bold">Ajustar Stock Manual</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {successMsg}
                </div>
              )}

              {/* Bodega */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Bodega *
                </label>
                {user?.rol === 'supervisor_bodega' ? (
                  <input
                    type="text"
                    disabled
                    value={dbBodegas.find(b => b.id === user.bodegaId)?.nombre || 'Mi Bodega'}
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none"
                  />
                ) : (
                  <select
                    value={selectedBodegaId}
                    onChange={(e) => setSelectedBodegaId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccione una bodega</option>
                    {dbBodegas.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Producto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Seleccione un producto</option>
                  {dbProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {/* Tipo de ajuste */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Ajuste *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTipoAjuste('incrementar')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-3 text-sm cursor-pointer transition ${
                      tipoAjuste === 'incrementar'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>Incrementar (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoAjuste('disminuir')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-3 text-sm cursor-pointer transition ${
                      tipoAjuste === 'disminuir'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>Disminuir (-)</span>
                  </button>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Motivo *
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Error de conteo">Error de conteo</option>
                  <option value="Inventario físico">Inventario físico</option>
                  <option value="Corrección administrativa">Corrección administrativa</option>
                  <option value="Diferencia detectada">Diferencia detectada</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Detalle si es "Otro" */}
              {motivo === 'Otro' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Especifique el motivo *
                  </label>
                  <textarea
                    required
                    value={motivoOtro}
                    onChange={(e) => setMotivoOtro(e.target.value)}
                    placeholder="Escriba el motivo detallado..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white h-20"
                  />
                </div>
              )}

              {/* Vista previa de stock (Impacto) */}
              {selectedProductId && (selectedBodegaId || user?.bodegaId) && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Previsualización del impacto en stock
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Stock actual disponible:</span>
                    <span className="font-semibold text-gray-900">
                      {(() => {
                        const prodObj = dbProducts.find(p => p.id === Number(selectedProductId))
                        const bodegaObj = dbBodegas.find(b => b.id === Number(selectedBodegaId || user?.bodegaId))
                        const invItem = items.find(
                          item => item.producto === prodObj?.nombre && item.bodega === bodegaObj?.nombre
                        )
                        return invItem ? invItem.stockDisponible : 0
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Ajuste:</span>
                    <span className={`font-semibold ${tipoAjuste === 'incrementar' ? 'text-green-600' : 'text-orange-600'}`}>
                      {tipoAjuste === 'incrementar' ? '+' : '-'}{cantidad}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-700 font-bold">Stock disponible final:</span>
                    {(() => {
                      const prodObj = dbProducts.find(p => p.id === Number(selectedProductId))
                      const bodegaObj = dbBodegas.find(b => b.id === Number(selectedBodegaId || user?.bodegaId))
                      const invItem = items.find(
                        item => item.producto === prodObj?.nombre && item.bodega === bodegaObj?.nombre
                      )
                      const current = invItem ? invItem.stockDisponible : 0
                      const final = tipoAjuste === 'incrementar' ? current + cantidad : current - cantidad

                      const isNegative = final < 0
                      return (
                        <span className={isNegative ? 'text-red-600 font-black' : 'text-blue-600'}>
                          {final} {isNegative && '(Inválido)'}
                        </span>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitLoading}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Procesando...
                    </>
                  ) : (
                    'Guardar Ajuste'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
