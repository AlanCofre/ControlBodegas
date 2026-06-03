import type { NavLinkItem } from '../types'

export const NAVIGATION_ITEMS: NavLinkItem[] = [
  {
    name: 'Alertas',
    path: '/alertas',
    allowedRoles: ['supervisor', 'administrador'],
  },
  {
    name: 'Inventario',
    path: '/inventario',
    allowedRoles: ['supervisor', 'operador', 'transportista', 'administrador'],
  },
  {
    name: 'Nueva solicitud',
    path: '/solicitudes/nueva',
    allowedRoles: ['supervisor', 'administrador'],
  },
  {
    name: 'Elegir origen',
    path: '/solicitudes/origen',
    allowedRoles: ['supervisor', 'administrador'],
  },
  {
    name: 'Solicitudes por evaluar',
    path: '/evaluacion',
    allowedRoles: ['supervisor', 'administrador'],
  },
  {
    name: 'Validar discrepancias',
    path: '/discrepancias',
    allowedRoles: ['supervisor', 'administrador'],
  },
  {
    name: 'Despacho',
    path: '/despacho',
    allowedRoles: ['operador', 'transportista', 'administrador'],
  },
  {
    name: 'Recepción',
    path: '/recepcion',
    allowedRoles: ['operador', 'administrador'],
  },
  {
    name: 'Configuración',
    path: '/configuracion',
    allowedRoles: ['administrador'],
  },
  {
    name: 'Escalaciones',
    path: '/escalaciones',
    allowedRoles: ['administrador'],
  },
]