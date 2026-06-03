/**
 * TEST DE CONEXIÓN A SUPABASE
 * Ejecuta para verificar que la conexión funciona
 * 
 * Uso: Abre la consola del navegador (F12) y ejecuta en Developer Tools
 */

import { supabase } from '../lib/supabaseClient'
import { transferService } from '../modules/transferencias/services/transferService'
import { warehouseService } from '../modules/transferencias/services/warehouseService'
import { productService } from '../modules/transferencias/services/productService'
import { authService } from '../shared/services/authService'

/**
 * Función principal de demostración
 */
export async function testSupabaseConnection() {
  console.log('🔍 Iniciando prueba de conexión a Supabase...\n')

  try {
    // 1. Probar conexión básica
    console.log('📡 1. Probando conexión básica a Supabase...')
    const { error: tableError } = await supabase
      .from('transfers')
      .select('count')
      .limit(1)

    if (tableError) {
      console.warn('⚠️  Tabla transfers no existe aún (es normal si es primera vez)')
      console.log('   Error:', tableError.message)
    } else {
      console.log('✅ Conexión exitosa a Supabase')
    }

    // 2. Probar authService
    console.log('\n🔐 2. Probando authService...')
    const roles = await authService.getRoles()
    console.log('✅ Roles cargados:', roles.length, 'roles disponibles')
    console.log('   Roles:', roles.map((r) => r.label).join(', '))

    // 3. Probar warehouseService
    console.log('\n📦 3. Probando warehouseService...')
    const warehouses = await warehouseService.getAll()
    console.log('✅ Bodegas cargadas:', warehouses.length, 'bodegas')
    console.log('   Bodegas:', warehouses.map((w) => w.nombre).join(', '))

    // 4. Probar productService
    console.log('\n🛍️  4. Probando productService...')
    const products = await productService.getAll()
    console.log('✅ Productos cargados:', products.length, 'productos')
    console.log('   Productos:', products.map((p) => p.nombre).slice(0, 3).join(', '), '...')

    // 5. Probar transferService
    console.log('\n📋 5. Probando transferService...')
    const transfers = await transferService.getAll()
    console.log('✅ Transferencias cargadas:', transfers.length, 'transferencias')
    console.log('   Estados:', [...new Set(transfers.map((t) => t.estado))].join(', '))

    console.log('\n✅ ¡TODAS LAS PRUEBAS EXITOSAS! Sistema listo para usar')
    console.log('\n📝 Resumen:')
    console.log('  - Roles:', roles.length)
    console.log('  - Bodegas:', warehouses.length)
    console.log('  - Productos:', products.length)
    console.log('  - Transferencias:', transfers.length)

    return {
      success: true,
      roles,
      warehouses,
      products,
      transfers,
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Función para probar crear una transferencia
 */
export async function testCreateTransfer() {
  console.log('\n📝 Probando crear una transferencia...')

  try {
    const newTransfer = await transferService.create({
      producto: 'Laptop DELL XPS 13',
      cantidad: 5,
      origen: 'Bodega Centro',
      destino: 'Bodega Norte',
      prioridad: 'alta',
      descripcion: 'Transfer de prueba desde Supabase',
      creada_por: 'Demo User',
      estado: 'CREADA',
      eventos: [],
    })

    console.log('✅ Transferencia creada:', newTransfer.id)
    return newTransfer
  } catch (error) {
    console.error(
      '⚠️  No se pudo crear en Supabase',
      error,
    )
    return null
  }
}

/**
 * Función para validar credenciales
 */
export async function testValidateCredentials() {
  console.log('\n🔑 Probando validación de credenciales...')

  const validTest = await authService.validateCredentials('Juan', 'supervisor')
  console.log('Validar "Juan" como supervisor:', validTest ? '✅' : '❌')

  const invalidTest = await authService.validateCredentials('Juan', 'invalid_role' as any)
  console.log('Validar "Juan" como invalid_role:', invalidTest ? '❌' : '✅')
}

// Exportar para usar en consola
if (typeof window !== 'undefined') {
  ;(window as any).testSupabaseConnection = testSupabaseConnection
  ;(window as any).testCreateTransfer = testCreateTransfer
  ;(window as any).testValidateCredentials = testValidateCredentials
}
