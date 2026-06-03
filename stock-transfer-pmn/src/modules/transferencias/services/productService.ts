import { supabase } from '../../../lib/supabaseClient'

/**
 * Servicio de productos
 * Abstrae la obtención de datos de productos
 * 
 * Sincronizado con tabla: productos (id, sku, nombre, descripcion, stock_minimo, activo, created_at)
 */

export interface Product {
  id: string
  nombre: string
  categoria?: string // En el nuevo schema no hay categoría explícita, se mantiene por compatibilidad
  sku: string
  descripcion?: string
  stock_minimo: number
  activo: boolean
}

export const productService = {
  /**
   * Obtiene todos los productos
   * @returns Promise con array de productos
   */
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all products:', error)
      return []
    }
  },

  /**
   * Obtiene un producto por ID
   * @param id ID del producto
   * @returns Promise con el producto encontrado
   */
  async getById(id: string | number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data || null
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      return null
    }
  },

  /**
   * Obtiene nombres de productos (para selectores)
   * @returns Promise con array de nombres
   */
  async getNames(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('nombre')
        .eq('activo', true)

      if (error) throw error
      return data?.map((p) => p.nombre) || []
    } catch (error) {
      console.error('Error fetching product names:', error)
      return []
    }
  },

  /**
   * Busca productos por nombre
   * @param nombre Nombre o parte del nombre del producto
   * @returns Promise con array de productos encontrados
   */
  async searchByName(nombre: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .ilike('nombre', `%${nombre}%`)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error searching products by name ${nombre}:`, error)
      return []
    }
  },

  /**
   * Obtiene todas las categorías disponibles
   * @returns Promise con array de categorías
   */
  async getCategories(): Promise<string[]> {
    // El nuevo esquema no tiene columna categoría.
    // Podríamos retornar un array vacío o una categoría por defecto si es necesario para el UI.
    return []
  },
}
