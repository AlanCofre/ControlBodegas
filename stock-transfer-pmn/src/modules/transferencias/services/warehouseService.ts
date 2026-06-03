/**
 * Servicio de bodegas
 * Abstrae la obtención de datos de bodegas
 * 
 * Sincronizado con tabla: bodegas (id, codigo, nombre, direccion, activa, created_at)
 */

import { supabase } from '../../../lib/supabaseClient'

export interface Warehouse {
  id: string
  nombre: string
  codigo: string
  direccion?: string
  activa: boolean
  stock_actual?: number // Este campo ahora viene de la tabla 'inventario'
}

export const warehouseService = {
  /**
   * Obtiene todas las bodegas
   * @returns Promise con array de bodegas
   */
  async getAll(): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('bodegas')
        .select('*')
        .eq('activa', true)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching warehouses from Supabase:', error)
      return []
    }
  },

  /**
   * Obtiene una bodega por ID
   * @param id ID de la bodega
   * @returns Promise con la bodega encontrada
   */
  async getById(id: string | number): Promise<Warehouse | null> {
    try {
      const { data, error } = await supabase
        .from('bodegas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data || null
    } catch (error) {
      console.error(`Error fetching warehouse ${id}:`, error)
      return null
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
        .from('bodegas')
        .select('*')
        .eq('activa', true)
        .ilike('nombre', `%${nombre}%`)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error fetching warehouses by name ${nombre}:`, error)
      return []
    }
  },

  /**
   * Obtiene nombres de bodegas (para selectores)
   * @returns Promise con array de nombres
   */
  async getNames(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bodegas')
        .select('nombre')
        .eq('activa', true)

      if (error) throw error
      return data?.map((w) => w.nombre) || []
    } catch (error) {
      console.error('Error fetching warehouse names:', error)
      return []
    }
  },

  /**
   * Valida disponibilidad de stock en una bodega para un producto
   * @param bodegaId ID de la bodega
   * @param productoId ID del producto
   * @param cantidad Cantidad requerida
   * @returns Promise con booleano indicando disponibilidad
   */
  async hasStock(bodegaId: string | number, productoId: string | number, cantidad: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('inventario')
        .select('stock_disponible')
        .eq('bodega_id', bodegaId)
        .eq('producto_id', productoId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return false // No hay registro de inventario
        throw error
      }

      return (data?.stock_disponible || 0) >= cantidad
    } catch (error) {
      console.error('Error checking warehouse stock:', error)
      return false
    }
  },
}
