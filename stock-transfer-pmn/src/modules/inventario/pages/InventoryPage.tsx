import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../../shared/utils/supabaseClient'

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
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBodega, setSelectedBodega] = useState('Todas')

  // Obtener bodegas únicas para el filtro
  const bodegas = useMemo(() => {
    const list = new Set(items.map((item) => item.bodega))
    return ['Todas', ...Array.from(list)]
  }, [items])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
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
  }

  useEffect(() => {
    fetchInventory()
  }, [])

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
        <button
          onClick={fetchInventory}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          🔄 Refrescar
        </button>
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
    </div>
  )
}
