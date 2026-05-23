import type { Transfer, TransferStatus, AuditEvent } from '../../modules/transferencias/types'

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase()

export interface TransferAction {
  type:
    | 'CREATE_TRANSFER'
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
  accion: string,
  estado_anterior: TransferStatus | undefined,
  estado_nuevo: TransferStatus,
  descripcion: string,
): AuditEvent => ({
  id: generateId(),
  transferencia_id,
  actor,
  rol: 'sistema',
  accion,
  estado_anterior,
  estado_nuevo,
  descripcion,
  timestamp: new Date().toISOString(),
  datos_adicionales: {},
})

export const transferReducer = (state: TransferState, action: TransferAction): TransferState => {
  switch (action.type) {
    case 'CREATE_TRANSFER': {
      const producto = action.payload?.producto as string
      const cantidad = action.payload?.cantidad as number
      const origen = action.payload?.origen as string
      const destino = action.payload?.destino as string
      const prioridad = (action.payload?.prioridad as any) || 'normal'
      const descripcion = (action.payload?.descripcion as string) || ''

      const newId = `TRF-${String(state.transfers.length + 1).padStart(3, '0')}`
      const timestamp = new Date().toISOString()

      const eventoCreacion = createAuditEvent(
        newId,
        'Rodrigo M.',
        'crear',
        undefined,
        'CREADA',
        `Transferencia creada: ${cantidad} unidades de ${producto}`,
      )

      const newTransfer: Transfer = {
        id: newId,
        producto,
        cantidad,
        origen,
        destino,
        prioridad,
        estado: 'CREADA',
        creada_por: 'Rodrigo M.',
        fecha_creacion: timestamp,
        fecha_actualizacion: timestamp,
        descripcion,
        eventos: [eventoCreacion],
      }

      state.transfers.push(newTransfer)
      state.auditLog.push(eventoCreacion)

      return { ...state }
    }

    case 'APPROVE_TRANSFER': {
      const id = action.payload?.transferId as string
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer || transfer.estado !== 'CREADA') return state

      const estadoAnterior = transfer.estado
      transfer.estado = 'APROBADA'
      transfer.fecha_actualizacion = new Date().toISOString()

      const evento = createAuditEvent(
        id,
        'Carlos S.',
        'aprobar',
        estadoAnterior,
        'APROBADA',
        'Supervisor bodega aprobó la transferencia',
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    case 'REJECT_TRANSFER': {
      const id = action.payload?.transferId as string
      const motivo = (action.payload?.motivo as string) || 'No especificado'
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer) return state

      const estadoAnterior = transfer.estado
      transfer.estado = 'RECHAZADA'
      transfer.fecha_actualizacion = new Date().toISOString()
      transfer.descripcion = `Rechazada: ${motivo}`

      const evento = createAuditEvent(
        id,
        'Carlos S.',
        'rechazar',
        estadoAnterior,
        'RECHAZADA',
        `Transferencia rechazada: ${motivo}`,
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    case 'RESERVE_TRANSFER': {
      const id = action.payload?.transferId as string
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer || transfer.estado !== 'APROBADA') return state

      const estadoAnterior = transfer.estado
      transfer.estado = 'RESERVADA'
      transfer.fecha_actualizacion = new Date().toISOString()

      const evento = createAuditEvent(
        id,
        'Pedro R.',
        'reservar',
        estadoAnterior,
        'RESERVADA',
        `${transfer.cantidad} unidades de ${transfer.producto} reservadas en ${transfer.origen}`,
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    case 'DISPATCH_TRANSFER': {
      const id = action.payload?.transferId as string
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer || transfer.estado !== 'RESERVADA') return state

      const estadoAnterior = transfer.estado
      transfer.estado = 'EN_TRANSITO'
      transfer.fecha_actualizacion = new Date().toISOString()

      const evento = createAuditEvent(
        id,
        'Pedro R.',
        'despachar',
        estadoAnterior,
        'EN_TRANSITO',
        `Transferencia despachada de ${transfer.origen} hacia ${transfer.destino}`,
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    case 'RECEIVE_TRANSFER': {
      const id = action.payload?.transferId as string
      const cantidadRecibida = (action.payload?.cantidadRecibida as number) || 0
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer || transfer.estado !== 'EN_TRANSITO') return state

      const estadoAnterior = transfer.estado
      transfer.cantidad_recibida = cantidadRecibida
      transfer.diferencia = cantidadRecibida - transfer.cantidad

      const tienesDiferencia = transfer.diferencia !== 0
      transfer.estado = tienesDiferencia ? 'CON_DIFERENCIA' : 'RECIBIDA_SIN_DIFERENCIA'
      transfer.fecha_actualizacion = new Date().toISOString()

      const descripcion = tienesDiferencia
        ? `Recibida con diferencia: ${transfer.diferencia > 0 ? '+' : ''}${transfer.diferencia} unidades`
        : 'Recibida sin diferencia'

      const evento = createAuditEvent(
        id,
        'Sistema',
        'recibir',
        estadoAnterior,
        transfer.estado,
        descripcion,
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    case 'CLOSE_TRANSFER': {
      const id = action.payload?.transferId as string
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer) return state

      const estadoAnterior = transfer.estado
      transfer.estado = 'CERRADA'
      transfer.fecha_actualizacion = new Date().toISOString()

      const evento = createAuditEvent(
        id,
        'Sistema',
        'cerrar',
        estadoAnterior,
        'CERRADA',
        'Transferencia cerrada correctamente',
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    case 'ERROR_TRANSFER': {
      const id = action.payload?.transferId as string
      const errorMsg = (action.payload?.error as string) || 'Error desconocido'
      const transfer = state.transfers.find((t) => t.id === id)
      if (!transfer) return state

      const estadoAnterior = transfer.estado
      transfer.estado = 'ERROR_RESERVA'
      transfer.fecha_actualizacion = new Date().toISOString()
      transfer.descripcion = `Error: ${errorMsg}`

      const evento = createAuditEvent(
        id,
        'Sistema',
        'error',
        estadoAnterior,
        'ERROR_RESERVA',
        errorMsg,
      )
      transfer.eventos.push(evento)
      state.auditLog.push(evento)

      return { ...state }
    }

    default:
      return state
  }
}
