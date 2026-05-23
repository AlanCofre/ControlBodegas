import type { AppAction, TransferStatusValue, UserRole } from '../types'

export const ROLE_PERMISSIONS: Record<UserRole, AppAction[]> = {
  administrador_sistema: [
    'configurar_parametros',
  ],
  supervisor_solicitante: [
    'ver_alertas',
    'consultar_inventario',
    'crear_solicitud',
    'seleccionar_bodega_origen',
    'cerrar_transferencia',
  ],
  supervisor_remitente: [
    'aprobar_solicitud',
    'rechazar_solicitud',
    'validar_discrepancia',
  ],
  operario_remitente: [
    'registrar_despacho',
  ],
  operario_destino: [
    'registrar_recepcion',
  ],
  supervisor_superior: [
    'resolver_escalacion',
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