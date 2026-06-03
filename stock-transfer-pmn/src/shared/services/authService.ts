import type { UserRole } from '../auth/AuthContext'
import { supabase } from '../../lib/supabaseClient'

/**
 * Servicio de autenticación
 * Abstrae la obtención de roles de usuario
 * 
 * Uso actual: Retorna datos de Supabase
 * Fallback: Retorna mocks si la conexión falla
 */

export interface RoleOption {
  value: UserRole
  label: string
  descripcion?: string
}

const ROLES_MOCK: RoleOption[] = [
  {
    value: 'administrador',
    label: 'Administrador',
    descripcion: 'Acceso total al sistema',
  },
  {
    value: 'supervisor',
    label: 'Supervisor',
    descripcion: 'Gestiona y aprueba transferencias',
  },
  {
    value: 'operador',
    label: 'Operador',
    descripcion: 'Registra entrada y salida de inventario',
  },
  {
    value: 'transportista',
    label: 'Transportista',
    descripcion: 'Gestiona transporte de mercancía',
  },
]

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
      return data || ROLES_MOCK
    } catch (error) {
      console.warn('Error fetching roles from Supabase:', error)
      return ROLES_MOCK
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
      console.warn(`Error fetching role ${value}:`, error)
      const role = ROLES_MOCK.find((r) => r.value === value)
      return role || null
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
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('nombre', nombre)
      //   .eq('rol', rol)
      //   .single()

      return true
    } catch (error) {
      console.warn('Error validating credentials:', error)
      return false
    }
  },
}
