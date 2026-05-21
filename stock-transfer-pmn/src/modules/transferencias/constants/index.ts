export const TRANSFER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const

export const TRANSFER_STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  rejected: 'Rechazada',
} as const

export const TRANSFER_STATUS_COLORS = {
  pending: 'yellow',
  processing: 'blue',
  completed: 'green',
  rejected: 'red',
} as const
