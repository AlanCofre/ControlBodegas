import { useState, useEffect } from 'react'
import { supabase } from '../../../shared/lib/supabase'

interface Product {
  id: string
  name: string
  sku: string
  stock_total: number
  unit: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name')
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const stats = {
    totalSkus: products.length,
    lowStock: products.filter((p) => p.stock_total > 0 && p.stock_total <= 10).length,
    noStock: products.filter((p) => p.stock_total === 0).length,
    warehouses: 5, // Static for now as per schema
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="mt-1 text-gray-600">Gestiona el inventario de todas las bodegas</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total de SKUs</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalSkus}</p>
          <p className="mt-1 text-xs text-gray-500">Productos registrados</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{loading ? '...' : stats.lowStock}</p>
          <p className="mt-1 text-xs text-gray-500">Requiere atención {'(<= 10)'}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Sin Stock</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{loading ? '...' : stats.noStock}</p>
          <p className="mt-1 text-xs text-gray-500">Agotados</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Bodegas</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.warehouses}</p>
          <p className="mt-1 text-xs text-gray-500">Ubicaciones activas</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Listado de Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Cargando productos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hay productos registrados</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`font-bold ${product.stock_total <= 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {product.stock_total}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
