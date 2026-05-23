interface TopbarProps {
  title?: string
  status?: string
  userName?: string
}

export default function Topbar({
  title = 'Sistema de Gestión de Bodegas',
  status = 'Operacional',
  userName = 'Rodrigo M.',
}: TopbarProps = {}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {status}
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xs font-semibold text-blue-600">R</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  )
}