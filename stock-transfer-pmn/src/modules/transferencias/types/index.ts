export type TransferStatus =
  | 'CREADA'
  | 'APROBADA'
  | 'RESERVADA'
  | 'EN_TRANSITO'
  | 'RECIBIDA_SIN_DIFERENCIA'
  | 'CON_DIFERENCIA'
  | 'CERRADA'
  | 'RECHAZADA'
  | 'SIN_ORIGEN'
  | 'ERROR_RESERVA'
  | 'ESCALADA'

export type UserRole =
  | 'supervisor_solicitante'
  | 'supervisor_bodega'
  | 'operario_despacho'
  | 'operario_recepcion'
  | 'sistema'

export type Priority = 'baja' | 'normal' | 'alta' | 'urgente'

export interface Transfer {
  id: string
  producto: string
  cantidad: number
  cantidad_recibida?: number
  diferencia?: number
  origen: string
  destino: string
  prioridad: Priority
  estado: TransferStatus
  creada_por: string
  fecha_creacion: string
  fecha_actualizacion: string
  descripcion?: string
  eventos: AuditEvent[]
}

export interface AuditEvent {
  id: string
  transferencia_id: string
  actor: string
  rol: UserRole
  accion: string
  estado_anterior?: TransferStatus
  estado_nuevo?: TransferStatus
  descripcion: string
  timestamp: string
  datos_adicionales?: Record<string, unknown>
}

export interface TransferItem {
  sku: string
  name: string
  quantity: number
  unit: string
}

export interface TransferFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}
