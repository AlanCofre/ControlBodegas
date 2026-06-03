import { supabase } from '../../lib/supabaseClient'

/**
 * Servicio de autenticación
 * Sincronizado con tablas: roles y usuarios
 */

export interface RoleOption {
  id: number | string
  nombre: string
  label?: string // Para compatibilidad UI
  value?: string // Para compatibilidad UI
}

export const authService = {
  /**
   * Obtiene todos los roles disponibles
   * @returns Promise con array de roles
   */
  async getRoles(): Promise<RoleOption[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')

      if (error) throw error

      return (data || []).map(r => ({
        ...r,
        label: r.nombre,
        value: r.nombre.toLowerCase()
      }))
    } catch (error) {
      console.error('Error fetching roles from Supabase:', error)
      return []
    }
  },

  /**
   * Obtiene un rol específico por ID o nombre
   * @param identifier ID o Nombre del rol
   * @returns Promise con el rol encontrado
   */
  async getRole(identifier: string | number): Promise<RoleOption | null> {
    try {
      const query = typeof identifier === 'number'
        ? supabase.from('roles').select('*').eq('id', identifier).single()
        : supabase.from('roles').select('*').eq('nombre', identifier).single()

      const { data, error } = await query

      if (error) throw error
      return data ? { ...data, label: data.nombre, value: data.nombre.toLowerCase() } : null
    } catch (error) {
      console.error(`Error fetching role ${identifier}:`, error)
      return null
    }
  },

  /**
   * Valida credenciales de usuario contra la tabla usuarios
   * @param email Email del usuario
   * @param rolNombre Nombre del rol
   * @returns Promise con booleano indicando si es válido
   */
  async validateCredentials(email: string, rolNombre: string): Promise<boolean> {
    try {
      if (!email.trim()) return false

      const { data, error } = await supabase
        .from('usuarios')
        .select('*, roles!inner(nombre)')
        .eq('email', email)
        .eq('roles.nombre', rolNombre)
        .eq('activo', true)
        .single()

      if (error || !data) return false

      return true
    } catch (error) {
      console.error('Error validating credentials:', error)
      return false
    }
  },

  /**
   * Obtiene un usuario por email
   */
  async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, roles(nombre)')
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching user ${email}:`, error)
      return null
    }
  }
}
