import { NavLink } from 'react-router-dom'
import type { UserRole } from '../auth/AuthContext'

interface AppSidebarProps {
  currentRole: UserRole
}

interface MenuItem {
  label: string
  to: string
  roles: UserRole[]
  exact?: boolean
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    roles: [
      'administrador',
      'supervisor_solicitante',
      'supervisor_remitente',
      'operario_despacho',
      'operario_recepcion',
    ],
    exact: true,
  },
  {
    label: 'Transferencias',
    to: '/transfers',
    roles: [
      'administrador',
      'supervisor_solicitante',
      'supervisor_remitente',
      'operario_despacho',
      'operario_recepcion',
    ],
    exact: true,
  },
  {
    label: 'Crear transferencia',
    to: '/transfers/create',
    roles: ['administrador', 'supervisor_solicitante'],
    exact: true,
  },
  {
    label: 'Auditoría',
    to: '/audit',
    roles: ['administrador'],
    exact: true,
  },
]

export default function AppSidebar({ currentRole }: AppSidebarProps) {
  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(currentRole),
  )

  return (
    <aside className="flex w-64 flex-col border-r border-blue-900 bg-blue-950 text-white">
      <div className="border-b border-blue-900 px-6 py-5">
        <h1 className="text-lg font-bold tracking-wide text-white">
          CONTROLBODEGAS
        </h1>
        <p className="mt-1 text-xs text-blue-200">Stock Transfer PMN</p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-blue-900 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}