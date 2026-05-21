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
]

export default function AppSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <h1 className="text-lg font-bold">
          StockFlow PMN
        </h1>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }: { isActive: boolean }) =>
              `
              rounded-lg px-4 py-3 text-sm font-medium transition
              ${
                isActive
                  ? 'bg-blue-600 text-white'
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