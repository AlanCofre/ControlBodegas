import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Transfer, AuditEvent } from '../../modules/transferencias/types'
import { transferReducer, type TransferAction, type TransferState } from './transferActions'
import { initialTransfers } from './initialData'

interface TransferContextType {
  transfers: Transfer[]
  auditLog: AuditEvent[]
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

  const dispatchAction = (action: TransferAction) => dispatch(action)

  const value: TransferContextType = {
    transfers: state.transfers,
    auditLog: state.auditLog,
    approveTransfer: (transferId: string) =>
      dispatchAction({
        type: 'APPROVE_TRANSFER',
        payload: { transferId },
      }),
    rejectTransfer: (transferId: string, motivo: string) =>
      dispatchAction({
        type: 'REJECT_TRANSFER',
        payload: { transferId, motivo },
      }),
    reserveTransfer: (transferId: string) =>
      dispatchAction({
        type: 'RESERVE_TRANSFER',
        payload: { transferId },
      }),
    dispatchTransfer: (transferId: string) =>
      dispatchAction({
        type: 'DISPATCH_TRANSFER',
        payload: { transferId },
      }),
    receiveTransfer: (transferId: string, cantidadRecibida: number) =>
      dispatchAction({
        type: 'RECEIVE_TRANSFER',
        payload: { transferId, cantidadRecibida },
      }),
    closeTransfer: (transferId: string) =>
      dispatchAction({
        type: 'CLOSE_TRANSFER',
        payload: { transferId },
      }),
    errorTransfer: (transferId: string, error: string) =>
      dispatchAction({
        type: 'ERROR_TRANSFER',
        payload: { transferId, error },
      }),
  }

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>
}

export function useTransferStore() {
  const context = useContext(TransferContext)
  if (!context) {
    throw new Error('useTransferStore must be used within a TransferProvider')
  }
  return context
}