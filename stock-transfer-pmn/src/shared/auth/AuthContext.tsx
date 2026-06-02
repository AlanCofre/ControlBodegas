import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole =
  | 'administrador'
  | 'supervisor_solicitante'
  | 'supervisor_remitente'
  | 'operario_despacho'
  | 'operario_recepcion'

interface AuthUser {
  nombre: string
  rol: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (nombre: string, rol: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = (nombre: string, rol: UserRole) => {
    setUser({ nombre, rol })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
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