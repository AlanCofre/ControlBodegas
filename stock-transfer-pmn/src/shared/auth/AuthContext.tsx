import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, seedDatabaseIfNeeded } from '../utils/supabaseClient'

export type UserRole =
  | 'administrador'
  | 'supervisor_bodega'
  | 'operador_bodega'
  | 'transportista'

export interface DbUser {
  id: number
  nombre: string
  rol: UserRole
  email: string
  bodegaId?: number | null
}

interface AuthUser {
  id: number
  nombre: string
  rol: UserRole
  email: string
  bodegaId?: number | null
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  dbUsers: DbUser[]
  loadingUsers: boolean
  login: (userId: number) => Promise<void>
  logout: () => void
  refreshDbUsers: () => Promise<void>
}

// Normaliza los nombres de roles de la base de datos a los tipos del frontend
export function normalizeRole(dbRoleName: string): UserRole {
  if (!dbRoleName) return 'operador_bodega'
  
  const normalized = dbRoleName.toLowerCase().replace(/[\s_-]+/g, '_').trim()
  
  if (normalized.includes('admin')) return 'administrador'
  if (normalized.includes('supervisor')) return 'supervisor_bodega'
  if (normalized.includes('operador') || normalized.includes('operario')) return 'operador_bodega'
  if (normalized.includes('transp')) return 'transportista'
  
  return normalized as UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [dbUsers, setDbUsers] = useState<DbUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true)

  const refreshDbUsers = async () => {
    try {
      setLoadingUsers(true)
      // Aseguramos que la BD esté seedeadada
      await seedDatabaseIfNeeded()

      const { data: dbRolesLog } = await supabase.from('roles').select('*')
      console.log('--- DEBUG DE BASE DE DATOS ---')
      console.log('Roles en Supabase:', dbRolesLog)

      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          email,
          bodega_id,
          roles!rol_id (
            nombre
          )
        `)
        .eq('activo', true)

      if (error) throw error

      console.log('Usuarios cargados de Supabase:', data)

      if (data) {
        const mapped: DbUser[] = data.map((u: any) => {
          const rawRole = u.roles ? (Array.isArray(u.roles) ? u.roles[0]?.nombre : u.roles.nombre) : ''
          return {
            id: Number(u.id),
            nombre: u.nombre,
            rol: normalizeRole(rawRole),
            email: u.email,
            bodegaId: u.bodega_id ? Number(u.bodega_id) : null,
          }
        })
        setDbUsers(mapped)
      }
    } catch (err) {
      console.error('Error al cargar los usuarios desde Supabase:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    refreshDbUsers()
  }, [])

  const login = async (userId: number) => {
    try {
      const selectedUser = dbUsers.find((u) => u.id === userId)
      if (selectedUser) {
        setUser({
          id: selectedUser.id,
          nombre: selectedUser.nombre,
          rol: selectedUser.rol,
          email: selectedUser.email,
          bodegaId: selectedUser.bodegaId,
        })
        return
      }

      // Si por alguna razón no está en la lista de dbUsers cargados, consultamos a Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          email,
          bodega_id,
          roles!rol_id (
            nombre
          )
        `)
        .eq('id', userId)
        .single()

      if (error || !data) throw new Error('Usuario no encontrado en la base de datos')

      const userData = data as any
      const rawRole = userData.roles ? (Array.isArray(userData.roles) ? userData.roles[0]?.nombre : userData.roles.nombre) : ''
      setUser({
        id: Number(userData.id),
        nombre: userData.nombre,
        rol: normalizeRole(rawRole),
        email: userData.email,
        bodegaId: userData.bodega_id ? Number(userData.bodega_id) : null,
      })
    } catch (error) {
      console.error('Error durante el login en Supabase:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        dbUsers,
        loadingUsers,
        login,
        logout,
        refreshDbUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}