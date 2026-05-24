import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Transfer, AuditEvent } from '../../modules/transferencias/types'
import {
  transferReducer,
  type TransferAction,
  type TransferState,
} from './transferActions'
import { initialTransfers } from './initialData'

type TransferPriority = 'baja' | 'normal' | 'alta' | 'urgente'

interface TransferContextType {
  transfers: Transfer[]
  auditLog: AuditEvent[]
  createTransfer: (
    producto: string,
    cantidad: number,
    origen: string,
    destino: string,
    prioridad: TransferPriority,
    descripcion?: string,
  ) => string
  approveTransfer: (transferId: string) => void
  rejectTransfer: (transferId: string, motivo: string) => void
  reserveTransfer: (transferId: string) => void
  dispatchTransfer: (transferId: string) => void
  receiveTransfer: (transferId: string, cantidadRecibida: number) => void
  closeTransfer: (transferId: string) => void
  errorTransfer: (transferId: string, error: string) => void
}

const TransferContext = createContext<TransferContextType | undefined>(undefined)

const initialState: TransferState = {
  transfers: initialTransfers,
  auditLog: initialTransfers.flatMap((t) => t.eventos),
}

export function TransferProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transferReducer, initialState)

  const dispatchAction = (action: TransferAction) => {
    dispatch(action)
  }

  const createTransfer = (
    producto: string,
    cantidad: number,
    origen: string,
    destino: string,
    prioridad: TransferPriority,
    descripcion?: string,
  ): string => {
    const newId = `TRF-${String(state.transfers.length + 1).padStart(3, '0')}`

    dispatchAction({
      type: 'CREATE_TRANSFER',
      payload: {
        producto,
        cantidad,
        origen,
        destino,
        prioridad,
        descripcion,
      },
    })

    return newId
  }

  const approveTransfer = (transferId: string) => {
    dispatchAction({
      type: 'APPROVE_TRANSFER',
      payload: { transferId },
    })
  }

  const rejectTransfer = (transferId: string, motivo: string) => {
    dispatchAction({
      type: 'REJECT_TRANSFER',
      payload: { transferId, motivo },
    })
  }

  const reserveTransfer = (transferId: string) => {
    dispatchAction({
      type: 'RESERVE_TRANSFER',
      payload: { transferId },
    })
  }

  const dispatchTransfer = (transferId: string) => {
    dispatchAction({
      type: 'DISPATCH_TRANSFER',
      payload: { transferId },
    })
  }

  const receiveTransfer = (
    transferId: string,
    cantidadRecibida: number,
  ) => {
    dispatchAction({
      type: 'RECEIVE_TRANSFER',
      payload: { transferId, cantidadRecibida },
    })
  }

  const closeTransfer = (transferId: string) => {
    dispatchAction({
      type: 'CLOSE_TRANSFER',
      payload: { transferId },
    })
  }

  const errorTransfer = (transferId: string, error: string) => {
    dispatchAction({
      type: 'ERROR_TRANSFER',
      payload: { transferId, error },
    })
  }

  const value: TransferContextType = {
    transfers: state.transfers,
    auditLog: state.auditLog,
    createTransfer,
    approveTransfer,
    rejectTransfer,
    reserveTransfer,
    dispatchTransfer,
    receiveTransfer,
    closeTransfer,
    errorTransfer,
  }

  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  )
}

export function useTransferStore() {
  const context = useContext(TransferContext)

  if (!context) {
    throw new Error('useTransferStore must be used within a TransferProvider')
  }

  return context
}