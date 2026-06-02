import { useAuth } from '../auth/AuthContext'

interface TopbarProps {
  title?: string
  status?: string
}

function formatRoleLabel(role: string) {
  switch (role) {
    case 'administrador':
      return 'Administrador'
    case 'supervisor_solicitante':
      return 'Supervisor solicitante'
    case 'supervisor_remitente':
      return 'Supervisor remitente'
    case 'operario_despacho':
      return 'Operario de despacho'
    case 'operario_recepcion':
      return 'Operario de recepción'
    default:
      return role
  }
}

export default function Topbar({
  title = 'Sistema de Gestión de Bodegas',
  status = 'Operacional',
}: TopbarProps) {
  const { user, logout } = useAuth()

  const initial = user?.nombre?.charAt(0).toUpperCase() || 'U'
  const roleLabel = user ? formatRoleLabel(user.rol) : 'Sin rol'

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {status}
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xs font-semibold text-blue-600">{initial}</span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">{roleLabel}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="ml-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}