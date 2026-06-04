import type { AppAction, TransferStatusValue, UserRole } from '../types'

export const ROLE_PERMISSIONS: Record<UserRole, AppAction[]> = {
  administrador: [
    'ver_alertas',
    'consultar_inventario',
    'crear_solicitud',
    'seleccionar_bodega_origen',
    'aprobar_solicitud',
    'rechazar_solicitud',
    'validar_discrepancia',
    'registrar_despacho',
    'registrar_recepcion',
    'cerrar_transferencia',
    'configurar_parametros',
    'resolver_escalacion',
  ],
  supervisor_bodega: [
    'ver_alertas',
    'consultar_inventario',
    'crear_solicitud',
    'seleccionar_bodega_origen',
    'aprobar_solicitud',
    'rechazar_solicitud',
    'validar_discrepancia',
    'cerrar_transferencia',
    'resolver_escalacion',
  ],
  operador_bodega: [
    'consultar_inventario',
    'registrar_despacho',
    'registrar_recepcion',
  ],
  transportista: [
    'ver_alertas',
    'registrar_despacho',
  ],
}

export const ACTION_ALLOWED_STATUS: Partial<Record<AppAction, TransferStatusValue[]>> = {
  aprobar_solicitud: ['creada'],
    rechazar_solicitud: ['creada'],
    validar_discrepancia: ['recibida', 'con_diferencia'],
    registrar_despacho: ['reservada'],
    registrar_recepcion: ['en_transito', 'en_transito_con_incidente'],
    cerrar_transferencia: ['recibida', 'con_diferencia'],
}

export function hasPermission(role: UserRole, action: AppAction): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false
}

export function canExecuteAction(
  role: UserRole,
  action: AppAction,
  status?: TransferStatusValue,
): boolean {
  const roleAllowed = hasPermission(role, action)

  if (!roleAllowed) return false
  if (!status) return true

  const allowedStatuses = ACTION_ALLOWED_STATUS[action]
  if (!allowedStatuses) return true

  return allowedStatuses.includes(status)
}