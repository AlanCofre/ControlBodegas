/**
 * Servicio de bodegas
 * Abstrae la obtención de datos de bodegas
 * 
 * Uso actual: Retorna datos de Supabase
 * Fallback: Retorna mocks si la conexión falla
 */

import { supabase } from '../../../lib/supabaseClient'

export interface Warehouse {
  id: string
  nombre: string
  ubicacion: string
  capacidad: number
  stock_actual: number
}

const BODEGAS_MOCK: Warehouse[] = [
  {
    id: 'BOD-001',
    nombre: 'Bodega Centro',
    ubicacion: 'Centro',
    capacidad: 1000,
    stock_actual: 450,
  },
  {
    id: 'BOD-002',
    nombre: 'Bodega Norte',
    ubicacion: 'Norte',
    capacidad: 800,
    stock_actual: 320,
  },
  {
    id: 'BOD-003',
    nombre: 'Bodega Sur',
    ubicacion: 'Sur',
    capacidad: 900,
    stock_actual: 650,
  },
  {
    id: 'BOD-004',
    nombre: 'Bodega Este',
    ubicacion: 'Este',
    capacidad: 750,
    stock_actual: 280,
  },
  {
    id: 'BOD-005',
    nombre: 'Bodega Oeste',
    ubicacion: 'Oeste',
    capacidad: 600,
    stock_actual: 500,
  },
]

export const warehouseService = {
  /**
   * Obtiene todas las bodegas
   * @returns Promise con array de bodegas
   */
  async getAll(): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')

      if (error) throw error
      return data || BODEGAS_MOCK
    } catch (error) {
      console.warn('Error fetching warehouses from Supabase:', error)
      return BODEGAS_MOCK
    }
  },

  /**
   * Obtiene una bodega por ID
   * @param id ID de la bodega
   * @returns Promise con la bodega encontrada
   */
  async getById(id: string): Promise<Warehouse | null> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data || null
    } catch (error) {
      console.warn(`Error fetching warehouse ${id}:`, error)
      const warehouse = BODEGAS_MOCK.find((w) => w.id === id)
      return warehouse || null
    }
  },

  /**
   * Obtiene bodegas por nombre
   * @param nombre Nombre de la bodega
   * @returns Promise con array de bodegas
   */
  async getByName(nombre: string): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .ilike('nombre', `%${nombre}%`)

      if (error) throw error
      return data || []
    } catch (error) {
      console.warn(`Error fetching warehouses by name ${nombre}:`, error)
      const filtered = BODEGAS_MOCK.filter((w) =>
        w.nombre.toLowerCase().includes(nombre.toLowerCase()),
      )
      return filtered
    }
  },

  /**
   * Obtiene nombres de bodegas (para selectores)
   * @returns Promise con array de nombres
   */
  async getNames(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('nombre')

      if (error) throw error
      return data?.map((w: any) => w.nombre) || []
    } catch (error) {
      console.warn('Error fetching warehouse names:', error)
      const names = BODEGAS_MOCK.map((w) => w.nombre)
      return names
    }
  },

  /**
   * Valida disponibilidad de stock en una bodega
   * @param bodegaId ID de la bodega
   * @param cantidad Cantidad requerida
   * @returns Promise con booleano indicando disponibilidad
   */
  async hasStock(bodegaId: string, cantidad: number): Promise<boolean> {
    try {
      const warehouse = await this.getById(bodegaId)
      if (!warehouse) return false
      return warehouse.stock_actual >= cantidad
    } catch (error) {
      console.error('Error checking warehouse stock:', error)
      return false
    }
  },
}
