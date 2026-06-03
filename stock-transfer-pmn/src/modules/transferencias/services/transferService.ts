import type { Transfer } from '../types'
import { supabase } from '../../../lib/supabaseClient'

/**
 * Servicio de transferencias
 * Actúa como abstracción entre componentes y fuente de datos
 * 
 * Uso actual: Retorna datos de Supabase
 */
export const transferService = {
  /**
   * Obtiene todas las transferencias
   * @returns Promise con array de transferencias
   */
  async getAll(): Promise<Transfer[]> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching transfers from Supabase:', error)
      return []
    }
  },

  /**
   * Obtiene una transferencia por ID
   * @param id ID de la transferencia
   * @returns Promise con la transferencia encontrada
   */
  async getById(id: string): Promise<Transfer | null> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data || null
    } catch (error) {
      console.error(`Error fetching transfer ${id}:`, error)
      return null
    }
  },

  /**
   * Crea una nueva transferencia
   * @param data Datos de la transferencia
   * @returns Promise con la transferencia creada
   */
  async create(data: Omit<Transfer, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Transfer> {
    try {
      const newTransfer = {
        ...data,
        id: `TRF-${Date.now()}`,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      }

      const { data: created, error } = await supabase
        .from('transfers')
        .insert(newTransfer)
        .select()
        .single()

      if (error) throw error
      return created || (newTransfer as Transfer)
    } catch (error) {
      console.error('Error creating transfer:', error)
      throw error
    }
  },

  /**
   * Actualiza una transferencia
   * @param id ID de la transferencia
   * @param data Datos a actualizar
   * @returns Promise con la transferencia actualizada
   */
  async update(id: string, data: Partial<Transfer>): Promise<Transfer> {
    try {
      const updated = {
        ...data,
        fecha_actualizacion: new Date().toISOString(),
      }

      const { data: result, error } = await supabase
        .from('transfers')
        .update(updated)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result || ({ id, ...data } as Transfer)
    } catch (error) {
      console.error(`Error updating transfer ${id}:`, error)
      throw error
    }
  },

  /**
   * Filtra transferencias por estado
   * @param estado Estado de la transferencia
   * @returns Promise con transferencias filtradas
   */
  async getByStatus(estado: string): Promise<Transfer[]> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('estado', estado)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error fetching transfers by status ${estado}:`, error)
      return []
    }
  },
}
