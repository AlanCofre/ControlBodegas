import type { NavLinkItem } from '../types'

export const NAVIGATION_ITEMS: NavLinkItem[] = [
  {
    name: 'Alertas',
    path: '/alertas',
    allowedRoles: ['supervisor_bodega'],
  },
  {
    name: 'Inventario',
    path: '/inventario',
    allowedRoles: ['supervisor_bodega', 'operador_bodega'],
  },
  {
    name: 'Nueva solicitud',
    path: '/solicitudes/nueva',
    allowedRoles: ['supervisor_bodega'],
  },
  {
    name: 'Elegir origen',
    path: '/solicitudes/origen',
    allowedRoles: ['supervisor_bodega'],
  },
  {
    name: 'Solicitudes por evaluar',
    path: '/evaluacion',
    allowedRoles: ['supervisor_bodega'],
  },
  {
    name: 'Validar discrepancias',
    path: '/discrepancias',
    allowedRoles: ['supervisor_bodega'],
  },
  {
    name: 'Despacho',
    path: '/despacho',
    allowedRoles: ['operador_bodega', 'transportista'],
  },
  {
    name: 'Recepción',
    path: '/recepcion',
    allowedRoles: ['operador_bodega'],
  },
  {
    name: 'Configuración',
    path: '/configuracion',
    allowedRoles: ['administrador'],
  },
  {
    name: 'Escalaciones',
    path: '/escalaciones',
    allowedRoles: ['supervisor_bodega'],
  },
]