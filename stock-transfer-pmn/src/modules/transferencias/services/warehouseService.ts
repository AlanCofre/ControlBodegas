/**
 * Servicio de bodegas
 * Abstrae la obtención de datos de bodegas
 * 
 * Uso actual: Retorna datos de Supabase
 */

import { supabase } from '../../../lib/supabaseClient'

export interface Warehouse {
  id: string
  nombre: string
  ubicacion: string
  capacidad: number
  stock_actual: number
}

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
        .from('warehouses')
        .select('*')
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
        .from('warehouses')
        .select('nombre')

      if (error) throw error
      return data?.map((w) => w.nombre) || []
    } catch (error) {
      console.error('Error fetching warehouse names:', error)
      return []
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
