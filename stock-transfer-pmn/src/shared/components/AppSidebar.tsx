import { NavLink } from 'react-router-dom'

interface NavLinkItem {
  name: string
  path: string
}

const links: NavLinkItem[] = [
  {
    name: 'Dashboard',
    path: '/',
  },
  {
    name: 'Transferencias',
    path: '/transfers',
  },
  {
    name: 'Inventario',
    path: '/inventory',
  },
  {
    name: 'Auditoría',
    path: '/audit',
  },
]

export default function AppSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-600 to-blue-700 p-5">
        <h1 className="text-lg font-bold text-white">
          StockFlow PMN
        </h1>
        <p className="mt-1 text-xs text-blue-100">Sistema Operacional</p>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }: { isActive: boolean }) =>
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