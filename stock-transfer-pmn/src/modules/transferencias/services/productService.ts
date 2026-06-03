import { supabase } from '../../../lib/supabaseClient'

/**
 * Servicio de productos
 * Abstrae la obtención de datos de productos
 * 
 * Uso actual: Retorna datos de Supabase
 */

export interface Product {
  id: string
  nombre: string
  categoria: string
  codigo: string
  precio: number
}

export const productService = {
  /**
   * Obtiene todos los productos
   * @returns Promise con array de productos
   */
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')

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
  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
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
        .from('products')
        .select('nombre')

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
        .from('products')
        .select('*')
        .ilike('nombre', `%${nombre}%`)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error searching products by name ${nombre}:`, error)
      return []
    }
  },

  /**
   * Obtiene productos por categoría
   * @param categoria Nombre de la categoría
   * @returns Promise con array de productos
   */
  async getByCategory(categoria: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', categoria)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error fetching products by category ${categoria}:`, error)
      return []
    }
  },

  /**
   * Obtiene todas las categorías disponibles
   * @returns Promise con array de categorías
   */
  async getCategories(): Promise<string[]> {
    try {
      // Supabase no tiene .distinct(), usamos select y luego procesamos o una query raw si es necesario
      // Para este PMN, seleccionamos todas las categorías y filtramos duplicados en JS
      const { data, error } = await supabase
        .from('products')
        .select('categoria')

      if (error) throw error
      const categories = Array.from(new Set(data?.map((p) => p.categoria)))
      return categories
    } catch (error) {
      console.error('Error fetching product categories:', error)
      return []
    }
  },
}
