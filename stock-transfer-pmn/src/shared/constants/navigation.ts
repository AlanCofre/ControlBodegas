import type { NavLinkItem } from '../types'

export const NAVIGATION_ITEMS: NavLinkItem[] = [
  {
    name: 'Alertas',
    path: '/alertas',
    allowedRoles: ['supervisor_solicitante'],
  },
  {
    name: 'Inventario',
    path: '/inventario',
    allowedRoles: ['supervisor_solicitante'],
  },
  {
    name: 'Nueva solicitud',
    path: '/solicitudes/nueva',
    allowedRoles: ['supervisor_solicitante'],
  },
  {
    name: 'Elegir origen',
    path: '/solicitudes/origen',
    allowedRoles: ['supervisor_solicitante'],
  },
  {
    name: 'Solicitudes por evaluar',
    path: '/evaluacion',
    allowedRoles: ['supervisor_remitente'],
  },
  {
    name: 'Validar discrepancias',
    path: '/discrepancias',
    allowedRoles: ['supervisor_remitente'],
  },
  {
    name: 'Despacho',
    path: '/despacho',
    allowedRoles: ['operario_remitente'],
  },
  {
    name: 'Recepción',
    path: '/recepcion',
    allowedRoles: ['operario_destino'],
  },
  {
    name: 'Configuración',
    path: '/configuracion',
    allowedRoles: ['administrador_sistema'],
  },
  {
    name: 'Escalaciones',
    path: '/escalaciones',
    allowedRoles: ['supervisor_superior'],
  },
]