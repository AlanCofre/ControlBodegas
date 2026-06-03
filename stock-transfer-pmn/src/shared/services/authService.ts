import type { UserRole } from '../auth/AuthContext'
import { supabase } from '../../lib/supabaseClient'

/**
 * Servicio de autenticación
 * Abstrae la obtención de roles de usuario
 * 
 * Uso actual: Retorna datos de Supabase
 */

export interface RoleOption {
  value: UserRole
  label: string
  descripcion?: string
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
      return data || []
    } catch (error) {
      console.error('Error fetching roles from Supabase:', error)
      return []
    }
  },

  /**
   * Obtiene un rol específico por valor
   * @param value Valor del rol
   * @returns Promise con el rol encontrado
   */
  async getRoleByValue(value: UserRole): Promise<RoleOption | null> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('value', value)
        .single()

      if (error) throw error
      return data || null
    } catch (error) {
      console.error(`Error fetching role ${value}:`, error)
      return null
    }
  },

  /**
   * Valida credenciales de usuario
   * @param nombre Nombre del usuario
   * @param rol Rol del usuario
   * @returns Promise con booleano indicando si es válido
   */
  async validateCredentials(nombre: string, rol: UserRole): Promise<boolean> {
    try {
      if (!nombre.trim()) return false

      // Validar que el rol existe
      const roleExists = await this.getRoleByValue(rol)
      if (!roleExists) return false

      // Aquí puedes agregar validación adicional contra Supabase
      return true
    } catch (error) {
      console.error('Error validating credentials:', error)
      return false
    }
  },
}
