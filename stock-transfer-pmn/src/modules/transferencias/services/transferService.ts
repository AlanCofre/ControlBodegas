import type { Transfer } from '../types'
import { supabase } from '../../../lib/supabaseClient'

/**
 * Mapea una transferencia de la base de datos al modelo del UI
 */
const mapTransferFromDB = (t: any): Transfer => ({
  id: t.codigo,
  db_id: t.id,
  producto: t.producto?.nombre || 'Desconocido',
  cantidad: t.cantidad,
  origen: t.origen?.nombre || 'Sin origen',
  destino: t.destino?.nombre || 'Sin destino',
  prioridad: t.prioridad || 'normal',
  estado: t.estado,
  creada_por: t.solicitante?.nombre || 'Desconocido',
  fecha_creacion: t.created_at,
  fecha_actualizacion: t.updated_at,
  descripcion: t.observacion,
  eventos: []
})

/**
 * Servicio de transferencias
 * Actúa como abstracción entre componentes y fuente de datos
 * 
 * Sincronizado con tabla: transferencias
 */
export const transferService = {
  /**
   * Obtiene todas las transferencias
   * @returns Promise con array de transferencias
   */
  async getAll(): Promise<Transfer[]> {
    try {
      const { data, error } = await supabase
        .from('transferencias')
        .select(`
          *,
          producto:productos(nombre),
          origen:bodegas!bodega_origen_id(nombre),
          destino:bodegas!bodega_destino_id(nombre),
          solicitante:usuarios(nombre)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(mapTransferFromDB) as unknown as Transfer[]
    } catch (error) {
      console.error('Error fetching transfers from Supabase:', error)
      return []
    }
  },

  /**
   * Obtiene una transferencia por ID (código)
   * @param id Código de la transferencia
   * @returns Promise con la transferencia encontrada
   */
  async getById(id: string): Promise<Transfer | null> {
    try {
      const { data, error } = await supabase
        .from('transferencias')
        .select(`
          *,
          producto:productos(nombre),
          origen:bodegas!bodega_origen_id(nombre),
          destino:bodegas!bodega_destino_id(nombre),
          solicitante:usuarios(nombre)
        `)
        .eq('codigo', id)
        .single()

      if (error) throw error
      if (!data) return null

      return mapTransferFromDB(data) as unknown as Transfer
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
  async create(data: any): Promise<Transfer> {
    try {
      const { data: created, error } = await supabase
        .from('transferencias')
        .insert({
          codigo: `TRF-${Date.now()}`,
          producto_id: data.producto_id,
          cantidad: data.cantidad,
          estado: 'CREADA',
          bodega_origen_id: data.bodega_origen_id,
          bodega_destino_id: data.bodega_destino_id,
          solicitante_id: data.solicitante_id,
          observacion: data.descripcion
        })
        .select(`
          *,
          producto:productos(nombre),
          origen:bodegas!bodega_origen_id(nombre),
          destino:bodegas!bodega_destino_id(nombre),
          solicitante:usuarios(nombre)
        `)
        .single()

      if (error) throw error
      return mapTransferFromDB(created) as unknown as Transfer
    } catch (error) {
      console.error('Error creating transfer:', error)
      throw error
    }
  },

  /**
   * Actualiza una transferencia
   * @param id ID (DB id o Código)
   * @param data Datos a actualizar
   * @returns Promise con la transferencia actualizada
   */
  async update(id: string | number, data: any): Promise<Transfer> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.estado) updateData.estado = data.estado
      if (data.observacion) updateData.observacion = data.observacion

      const query = typeof id === 'number' || !isNaN(Number(id))
        ? supabase.from('transferencias').update(updateData).eq('id', id)
        : supabase.from('transferencias').update(updateData).eq('codigo', id)

      const { data: result, error } = await query
        .select(`
          *,
          producto:productos(nombre),
          origen:bodegas!bodega_origen_id(nombre),
          destino:bodegas!bodega_destino_id(nombre),
          solicitante:usuarios(nombre)
        `)
        .single()

      if (error) throw error
      return mapTransferFromDB(result) as unknown as Transfer
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
        .from('transferencias')
        .select(`
          *,
          producto:productos(nombre),
          origen:bodegas!bodega_origen_id(nombre),
          destino:bodegas!bodega_destino_id(nombre),
          solicitante:usuarios(nombre)
        `)
        .eq('estado', estado)

      if (error) throw error

      return (data || []).map(mapTransferFromDB) as unknown as Transfer[]
    } catch (error) {
      console.error(`Error fetching transfers by status ${estado}:`, error)
      return []
    }
  },
}
