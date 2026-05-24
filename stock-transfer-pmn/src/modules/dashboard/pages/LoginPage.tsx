import { useState } from 'react'
import { useAuth, type UserRole } from '../../../shared/auth/AuthContext'

const roles: { value: UserRole; label: string }[] = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'supervisor_solicitante', label: 'Supervisor solicitante' },
  { value: 'supervisor_remitente', label: 'Supervisor remitente' },
  { value: 'operario_despacho', label: 'Operario de despacho' },
  { value: 'operario_recepcion', label: 'Operario de recepción' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<UserRole>('administrador')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) return

    login(nombre.trim(), rol)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}