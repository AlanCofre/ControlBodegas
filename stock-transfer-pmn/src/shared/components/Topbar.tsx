interface TopbarProps {
  title?: string
  status?: string
  userName?: string
  userRoleLabel?: string
}

export default function Topbar({
  title = 'Sistema de Gestión de Bodegas',
  status = 'Operacional',
  userName = 'Usuario demo',
  userRoleLabel = 'Supervisor solicitante',
}: TopbarProps) {
  return (
    <header className="w-full border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{status}</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500">{userRoleLabel}</p>
        </div>
      </div>
    </header>
  )
}