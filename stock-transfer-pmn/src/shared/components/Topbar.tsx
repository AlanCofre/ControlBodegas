interface TopbarProps {
  title?: string
  status?: string
  userName?: string
}

export default function Topbar({
  title = 'Sistema de Transferencias',
  status = 'Operacional',
  userName = 'Rodrigo M.',
}: TopbarProps = {}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          {status}
        </div>

        <div className="text-sm text-gray-600">
          {userName}
        </div>
      </div>
    </header>
  )
}