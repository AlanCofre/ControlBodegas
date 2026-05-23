import { NavLink } from 'react-router-dom'

type UserRole =
  | 'supervisor_solicitante'
  | 'supervisor_remitente'
  | 'operario_destino'
  | 'administrador'

interface NavLinkItem {
  name: string
  path: string
  allowedRoles: UserRole[]
}

const links: NavLinkItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    allowedRoles: [
      'supervisor_solicitante',
      'supervisor_remitente',
      'operario_destino',
      'administrador',
    ],
  },
  {
    name: 'Inventario',
    path: '/inventory',
    allowedRoles: ['supervisor_solicitante', 'administrador'],
  },
  {
    name: 'Transferencias',
    path: '/transfers',
    allowedRoles: [
      'supervisor_solicitante',
      'supervisor_remitente',
      'operario_destino',
      'administrador',
    ],
  },
  {
    name: 'Auditoría',
    path: '/audit',
    allowedRoles: ['administrador'],
  },
]

interface AppSidebarProps {
  currentRole: UserRole
}

export default function AppSidebar({ currentRole }: AppSidebarProps) {
  const visibleLinks = links.filter((link) =>
    link.allowedRoles.includes(currentRole)
  )

  return (
    <aside className="w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-600 to-blue-700 p-5">
        <h1 className="text-lg font-bold text-white">StockFlow PMN</h1>
        <p className="mt-1 text-xs text-blue-100">Sistema Operacional</p>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `
              rounded-lg px-4 py-3 text-sm font-medium transition duration-200
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }
              `
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}