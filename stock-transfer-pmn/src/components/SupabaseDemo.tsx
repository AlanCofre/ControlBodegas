import { useState } from 'react'
import { transferService } from '../modules/transferencias/services/transferService'
import { warehouseService } from '../modules/transferencias/services/warehouseService'
import { productService } from '../modules/transferencias/services/productService'
import { authService } from '../shared/services/authService'

export function SupabaseDemo() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('🔍 Iniciando prueba de conexión a Supabase...\n')

      // 1. Test de roles
      console.log('🔐 Probando authService...')
      const roles = await authService.getRoles()
      console.log('✅ Roles cargados:', roles.length)

      // 2. Test de bodegas
      console.log('📦 Probando warehouseService...')
      const warehouses = await warehouseService.getAll()
      console.log('✅ Bodegas cargadas:', warehouses.length)

      // 3. Test de productos
      console.log('🛍️  Probando productService...')
      const products = await productService.getAll()
      console.log('✅ Productos cargados:', products.length)

      // 4. Test de transferencias
      console.log('📋 Probando transferService...')
      const transfers = await transferService.getAll()
      console.log('✅ Transferencias cargadas:', transfers.length)

      setResults({
        roles: roles.length,
        warehouses: warehouses.length,
        products: products.length,
        transfers: transfers.length,
        rolesNames: roles.map((r) => r.label),
        warehouseNames: warehouses.map((w) => w.nombre),
        productNames: products.slice(0, 3).map((p) => p.nombre),
      })

      console.log('\n✅ ¡PRUEBA EXITOSA! Sistema conectado a Supabase')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('❌ Error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', border: '2px solid #4CAF50', borderRadius: '8px', marginTop: '20px' }}>
      <h3>🚀 Demo de Supabase</h3>
      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? '⏳ Probando conexión...' : '✅ Probar Conexión a Supabase'}
      </button>

      {error && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {results && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
          <h4>✅ Resultados:</h4>
          <ul style={{ margin: '5px 0' }}>
            <li>
              <strong>Roles:</strong> {results.roles} cargados → {results.rolesNames.join(', ')}
            </li>
            <li>
              <strong>Bodegas:</strong> {results.warehouses} cargadas → {results.warehouseNames.join(', ')}
            </li>
            <li>
              <strong>Productos:</strong> {results.products} cargados → {results.productNames.join(', ')} ...
            </li>
            <li>
              <strong>Transferencias:</strong> {results.transfers} cargadas
            </li>
          </ul>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            💡 Abre la consola (F12) para ver logs detallados
          </p>
        </div>
      )}
    </div>
  )
}
