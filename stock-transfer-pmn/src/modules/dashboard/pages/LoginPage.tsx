import { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/auth/AuthContext'

export default function LoginPage() {
  const { dbUsers, loadingUsers, login } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (dbUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(String(dbUsers[0].id))
    }
  }, [dbUsers, selectedUserId])

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      administrador: 'Administrador',
      supervisor_solicitante: 'Supervisor Solicitante',
      supervisor_remitente: 'Supervisor Remitente',
      operario_despacho: 'Operario de Despacho',
      operario_recepcion: 'Operario de Recepción'
    }
    return labels[role] || role
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId) {
      setErrorMsg('Por favor seleccione un usuario para ingresar')
      return
    }

    setSubmitLoading(true)
    setErrorMsg('')
    try {
      await login(Number(selectedUserId))
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión')
      setSubmitLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Control de Bodegas
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Selecciona tu usuario de base de datos para ingresar
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Usuario del Sistema *
          </label>
          {loadingUsers ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 bg-gray-50">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Cargando usuarios de la base de datos...
            </div>
          ) : (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={submitLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {dbUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} - ({getRoleLabel(u.rol)})
                </option>
              ))}
              {dbUsers.length === 0 && (
                <option value="">No hay usuarios en la base de datos</option>
              )}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={loadingUsers || submitLoading || dbUsers.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Ingresando...
            </>
          ) : (
            'Ingresar'
          )}
        </button>
      </form>
    </div>
  )
}