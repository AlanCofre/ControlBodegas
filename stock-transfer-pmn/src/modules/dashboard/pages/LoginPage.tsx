import { useState, useEffect } from 'react'
import { useAuth, type UserRole } from '../../../shared/auth/AuthContext'
import { authService, type RoleOption } from '../../../shared/services/authService'
import { SupabaseDemo } from '../../../components/SupabaseDemo'

export default function LoginPage() {
  const { login } = useAuth()
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<UserRole>('administrador')
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  // Cargar roles disponibles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await authService.getRoles()
        setRoles(rolesData)
      } catch (error) {
        console.error('Error loading roles:', error)
      } finally {
        setLoadingRoles(false)
      }
    }

    loadRoles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) return

    // Validar credenciales antes de hacer login
    const isValid = await authService.validateCredentials(nombre.trim(), rol)
    if (isValid) {
      login(nombre.trim(), rol)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-8 shadow-md"
        >
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">
            Control de Bodegas
          </h1>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
              disabled={loadingRoles}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            >
              {loadingRoles ? (
                <option>Cargando roles...</option>
              ) : (
                roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingRoles}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ingresar
          </button>
        </form>

        <SupabaseDemo />
      </div>
    </div>
  )
}