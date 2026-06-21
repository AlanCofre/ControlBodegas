import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../utils/supabaseClient'

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
  loadingSession: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nombre: string, rolId: number, bodegaId?: number | null) => Promise<void>
  logout: () => Promise<void>
  signOut: () => Promise<void>
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
  const [loadingSession, setLoadingSession] = useState<boolean>(true)

  const fetchUserProfile = async (authUserId: string) => {
    try {
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
        .eq('auth_user_id', authUserId)
        .eq('activo', true)
        .single()

      if (error) throw error

      if (data) {
        const u = data as any
        const rawRole = u.roles ? (Array.isArray(u.roles) ? u.roles[0]?.nombre : u.roles.nombre) : ''
        setUser({
          id: Number(u.id),
          nombre: u.nombre,
          rol: normalizeRole(rawRole),
          email: u.email,
          bodegaId: u.bodega_id ? Number(u.bodega_id) : null,
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Error al cargar el perfil del usuario desde la base de datos:', err)
      setUser(null)
    }
  }

  useEffect(() => {
    const initSession = async () => {
      try {
        setLoadingSession(true)

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Error al inicializar sesión:', err)
      } finally {
        setLoadingSession(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoadingSession(true)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoadingSession(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (
    email: string,
    password: string,
    nombre: string,
    rolId: number,
    bodegaId?: number | null
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          rol_id: rolId,
          bodega_id: bodegaId || null,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const logout = signOut

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loadingSession,
        login,
        signUp,
        logout,
        signOut,
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