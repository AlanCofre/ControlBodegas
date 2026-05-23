import type {
  Transfer,
  TransferStatus,
  AuditEvent,
  UserRole,
} from '../../modules/transferencias/types'

const generateId = () => Math.random().toString(36).substring(2, 10).toUpperCase()

export interface TransferAction {
  type:
    | 'APPROVE_TRANSFER'
    | 'REJECT_TRANSFER'
    | 'RESERVE_TRANSFER'
    | 'DISPATCH_TRANSFER'
    | 'RECEIVE_TRANSFER'
    | 'CLOSE_TRANSFER'
    | 'ERROR_TRANSFER'
  payload?: Record<string, unknown>
}

export interface TransferState {
  transfers: Transfer[]
  auditLog: AuditEvent[]
}

const createAuditEvent = (
  transferencia_id: string,
  actor: string,
  rol: UserRole,
  accion: string,
  estado_anterior: TransferStatus | undefined,
  estado_nuevo: TransferStatus,
  descripcion: string,
  datos_adicionales?: Record<string, unknown>,
): AuditEvent => ({
  id: generateId(),
  transferencia_id,
  actor,
  rol,
  accion,
  estado_anterior,
  estado_nuevo,
  descripcion,
  timestamp: new Date().toISOString(),
  datos_adicionales: datos_adicionales ?? {},
})

export const transferReducer = (
  state: TransferState,
  action: TransferAction,
): TransferState => {
  const updateTransfer = (
    transferId: string,
    updater: (transfer: Transfer) => { updated: Transfer; event: AuditEvent } | null,
  ): TransferState => {
    const transfer = state.transfers.find((t) => t.id === transferId)
    if (!transfer) return state

    const result = updater(transfer)
    if (!result) return state

    const { updated, event } = result

    return {
      transfers: state.transfers.map((t) =>
        t.id === transferId ? { ...updated, eventos: [...updated.eventos, event] } : t,
      ),
      auditLog: [...state.auditLog, event],
    }
  }

  switch (action.type) {
    case 'APPROVE_TRANSFER': {
      const id = action.payload?.transferId as string

      return updateTransfer(id, (transfer) => {
        if (transfer.estado !== 'CREADA') return null

        const estadoAnterior = transfer.estado
        const updated: Transfer = {
          ...transfer,
          estado: 'APROBADA',
          fecha_actualizacion: new Date().toISOString(),
        }

        const event = createAuditEvent(
          id,
          'Carlos S.',
          'supervisor_remitente',
          'aprobar_solicitud',
          estadoAnterior,
          'APROBADA',
          'Supervisor remitente aprobó la transferencia',
        )

        return { updated, event }
      })
    }

    case 'REJECT_TRANSFER': {
      const id = action.payload?.transferId as string
      const motivo = (action.payload?.motivo as string) || 'No especificado'

      return updateTransfer(id, (transfer) => {
        if (transfer.estado !== 'CREADA') return null

        const estadoAnterior = transfer.estado
        const updated: Transfer = {
          ...transfer,
          estado: 'RECHAZADA',
          fecha_actualizacion: new Date().toISOString(),
          descripcion: `Rechazada: ${motivo}`,
        }

        const event = createAuditEvent(
          id,
          'Carlos S.',
          'supervisor_remitente',
          'rechazar_solicitud',
          estadoAnterior,
          'RECHAZADA',
          `Transferencia rechazada: ${motivo}`,
          { motivo },
        )

        return { updated, event }
      })
    }

    case 'RESERVE_TRANSFER': {
      const id = action.payload?.transferId as string

      return updateTransfer(id, (transfer) => {
        if (transfer.estado !== 'APROBADA') return null

        const estadoAnterior = transfer.estado
        const updated: Transfer = {
          ...transfer,
          estado: 'RESERVADA',
          fecha_actualizacion: new Date().toISOString(),
        }

        const event = createAuditEvent(
          id,
          'Sistema',
          'sistema',
          'reservar_stock',
          estadoAnterior,
          'RESERVADA',
          `${transfer.cantidad} unidades reservadas en ${transfer.origen}`,
          {
            producto: transfer.producto,
            cantidad: transfer.cantidad,
            origen: transfer.origen,
          },
        )

        return { updated, event }
      })
    }

    case 'DISPATCH_TRANSFER': {
      const id = action.payload?.transferId as string

      return updateTransfer(id, (transfer) => {
        if (transfer.estado !== 'RESERVADA') return null

        const estadoAnterior = transfer.estado
        const updated: Transfer = {
          ...transfer,
          estado: 'EN_TRANSITO',
          fecha_actualizacion: new Date().toISOString(),
        }

        const event = createAuditEvent(
          id,
          'Pedro R.',
          'operario_despacho',
          'registrar_despacho',
          estadoAnterior,
          'EN_TRANSITO',
          `Transferencia despachada de ${transfer.origen} hacia ${transfer.destino}`,
        )

        return { updated, event }
      })
    }

    case 'RECEIVE_TRANSFER': {
      const id = action.payload?.transferId as string
      const cantidadRecibida = Number(action.payload?.cantidadRecibida ?? 0)

      return updateTransfer(id, (transfer) => {
        if (
          transfer.estado !== 'EN_TRANSITO' &&
          transfer.estado !== 'EN_TRANSITO_CON_INCIDENTE'
        ) {
          return null
        }

        const estadoAnterior = transfer.estado
        const diferencia = cantidadRecibida - transfer.cantidad
        const tieneDiferencia = diferencia !== 0
        const estadoNuevo: TransferStatus = tieneDiferencia
          ? 'CON_DIFERENCIA'
          : 'RECIBIDA_SIN_DIFERENCIA'

        const updated: Transfer = {
          ...transfer,
          cantidad_recibida: cantidadRecibida,
          diferencia,
          estado: estadoNuevo,
          fecha_actualizacion: new Date().toISOString(),
        }

        const descripcion = tieneDiferencia
          ? `Recepción con diferencia: ${diferencia > 0 ? '+' : ''}${diferencia} unidades`
          : 'Recepción conforme sin diferencias'

        const event = createAuditEvent(
          id,
          'Miguel A.',
          'operario_recepcion',
          'registrar_recepcion',
          estadoAnterior,
          estadoNuevo,
          descripcion,
          {
            cantidad_esperada: transfer.cantidad,
            cantidad_recibida: cantidadRecibida,
            diferencia,
          },
        )

        return { updated, event }
      })
    }

    case 'CLOSE_TRANSFER': {
      const id = action.payload?.transferId as string

      return updateTransfer(id, (transfer) => {
        if (
          transfer.estado !== 'RECIBIDA_SIN_DIFERENCIA' &&
          transfer.estado !== 'CON_DIFERENCIA'
        ) {
          return null
        }

        const estadoAnterior = transfer.estado
        const updated: Transfer = {
          ...transfer,
          estado: 'CERRADA',
          fecha_actualizacion: new Date().toISOString(),
        }

        const event = createAuditEvent(
          id,
          'Sistema',
          'sistema',
          'cerrar_transferencia',
          estadoAnterior,
          'CERRADA',
          'Transferencia cerrada correctamente',
        )

        return { updated, event }
      })
    }

    case 'ERROR_TRANSFER': {
      const id = action.payload?.transferId as string
      const errorMsg = (action.payload?.error as string) || 'Error desconocido'

      return updateTransfer(id, (transfer) => {
        const estadoAnterior = transfer.estado
        const updated: Transfer = {
          ...transfer,
          estado: 'ERROR_RESERVA',
          fecha_actualizacion: new Date().toISOString(),
          descripcion: `Error: ${errorMsg}`,
        }

        const event = createAuditEvent(
          id,
          'Sistema',
          'sistema',
          'error_reserva',
          estadoAnterior,
          'ERROR_RESERVA',
          errorMsg,
          { error: errorMsg },
        )

        return { updated, event }
      })
    }

    default:
      return state
  }
}