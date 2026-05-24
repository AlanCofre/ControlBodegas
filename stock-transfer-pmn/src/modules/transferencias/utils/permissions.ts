import type { UserRole } from '../../../shared/auth/AuthContext'

export type TransferStatus =
  | 'creada'
  | 'aprobada'
  | 'rechazada'
  | 'escalada'
  | 'reservada'
  | 'en_transito'
  | 'en_transito_con_incidente'
  | 'recibido_sin_diferencia'
  | 'con_diferencia_calidad'
  | 'con_diferencia_cantidad'
  | 'con_diferencia_investigacion'
  | 'sin_origen_disponible'
  | 'cerrada'

export interface TransferAction {
  key: string
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface TransferLike {
  id: string
  status: TransferStatus
}

export function getAvailableActions(
  transfer: TransferLike,
  currentRole: UserRole,
): TransferAction[] {
  const actions: TransferAction[] = []

  if (currentRole === 'administrador') {
    switch (transfer.status) {
      case 'creada':
        actions.push(
          { key: 'view', label: 'Ver detalle', variant: 'secondary' },
          { key: 'approve', label: 'Aprobar', variant: 'primary' },
          { key: 'reject', label: 'Rechazar', variant: 'danger' },
        )
        break
      case 'aprobada':
        actions.push(
          { key: 'view', label: 'Ver detalle', variant: 'secondary' },
          { key: 'reserve', label: 'Simular reserva', variant: 'primary' },
        )
        break
      case 'reservada':
        actions.push(
          { key: 'view', label: 'Ver detalle', variant: 'secondary' },
          { key: 'dispatch', label: 'Registrar despacho', variant: 'primary' },
        )
        break
      case 'en_transito':
      case 'en_transito_con_incidente':
        actions.push(
          { key: 'view', label: 'Ver detalle', variant: 'secondary' },
          { key: 'receive', label: 'Registrar recepción', variant: 'primary' },
        )
        break
      case 'recibido_sin_diferencia':
      case 'con_diferencia_calidad':
      case 'con_diferencia_cantidad':
      case 'con_diferencia_investigacion':
        actions.push(
          { key: 'view', label: 'Ver detalle', variant: 'secondary' },
          { key: 'validate', label: 'Validar recepción', variant: 'primary' },
          { key: 'close', label: 'Cerrar transferencia', variant: 'secondary' },
        )
        break
      default:
        actions.push({ key: 'view', label: 'Ver detalle', variant: 'secondary' })
    }

    return actions
  }

  switch (currentRole) {
    case 'supervisor_solicitante':
      actions.push({ key: 'view', label: 'Ver detalle', variant: 'secondary' })

      if (transfer.status === 'creada') {
        actions.push({ key: 'edit', label: 'Editar', variant: 'secondary' })
        actions.push({ key: 'cancel', label: 'Cancelar', variant: 'danger' })
      }

      if (
        transfer.status === 'recibido_sin_diferencia' ||
        transfer.status === 'con_diferencia_calidad' ||
        transfer.status === 'con_diferencia_cantidad' ||
        transfer.status === 'con_diferencia_investigacion'
      ) {
        actions.push({
          key: 'validate',
          label: 'Validar recepción',
          variant: 'primary',
        })
      }

      if (
        transfer.status === 'recibido_sin_diferencia' ||
        transfer.status === 'con_diferencia_calidad' ||
        transfer.status === 'con_diferencia_cantidad'
      ) {
        actions.push({
          key: 'close',
          label: 'Cerrar transferencia',
          variant: 'secondary',
        })
      }
      break

    case 'supervisor_remitente':
      actions.push({ key: 'view', label: 'Ver detalle', variant: 'secondary' })

      if (transfer.status === 'creada' || transfer.status === 'escalada') {
        actions.push({ key: 'approve', label: 'Aprobar', variant: 'primary' })
        actions.push({ key: 'reject', label: 'Rechazar', variant: 'danger' })
      }
      break

    case 'operario_despacho':
      actions.push({ key: 'view', label: 'Ver detalle', variant: 'secondary' })

      if (transfer.status === 'reservada') {
        actions.push({
          key: 'prepare',
          label: 'Preparar despacho',
          variant: 'secondary',
        })
        actions.push({
          key: 'dispatch',
          label: 'Registrar despacho',
          variant: 'primary',
        })
      }
      break

    case 'operario_recepcion':
      actions.push({ key: 'view', label: 'Ver detalle', variant: 'secondary' })

      if (
        transfer.status === 'en_transito' ||
        transfer.status === 'en_transito_con_incidente'
      ) {
        actions.push({
          key: 'receive',
          label: 'Registrar recepción',
          variant: 'primary',
        })
      }
      break
  }

  return actions
}