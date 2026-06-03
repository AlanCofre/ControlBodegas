import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Transfer, AuditEvent, Priority, TransferStatus, UserRole } from '../../modules/transferencias/types'
import { supabase } from '../../shared/lib/supabase'

interface TransferContextType {
  transfers: Transfer[]
  auditLog: AuditEvent[]
  loading: boolean
  error: string | null
  createTransfer: (
    producto: string,
    cantidad: number,
    origen: string,
    destino: string,
    prioridad: Priority,
    descripcion?: string,
  ) => Promise<string | null>
  approveTransfer: (transferId: string) => Promise<void>
  rejectTransfer: (transferId: string, motivo: string) => Promise<void>
  reserveTransfer: (transferId: string) => Promise<void>
  dispatchTransfer: (transferId: string) => Promise<void>
  receiveTransfer: (transferId: string, cantidadRecibida: number) => Promise<void>
  closeTransfer: (transferId: string) => Promise<void>
  errorTransfer: (transferId: string, error: string) => Promise<void>
  fetchTransfers: () => Promise<void>
}

const TransferContext = createContext<TransferContextType | undefined>(undefined)

export function TransferProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const { data: transfersData, error: transfersError } = await supabase
        .from('transfers')
        .select('*, audit_events(*)')
        .order('fecha_actualizacion', { ascending: false })

      if (transfersError) throw transfersError

      const formattedTransfers: Transfer[] = (transfersData || []).map((t: any) => ({
        ...t,
        eventos: t.audit_events || [],
      }))

      setTransfers(formattedTransfers)

      const { data: auditData, error: auditError } = await supabase
        .from('audit_events')
        .select('*')
        .order('timestamp', { ascending: false })

      if (auditError) throw auditError
      setAuditLog(auditData || [])
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  const createAuditEvent = async (
    transferencia_id: string,
    actor: string,
    rol: UserRole,
    accion: string,
    estado_anterior: TransferStatus | undefined,
    estado_nuevo: TransferStatus,
    descripcion: string,
    datos_adicionales?: Record<string, unknown>,
  ) => {
    const { error: auditError } = await supabase.from('audit_events').insert({
      transferencia_id,
      actor,
      rol,
      accion,
      estado_anterior,
      estado_nuevo,
      descripcion,
      datos_adicionales: datos_adicionales ?? {},
      timestamp: new Date().toISOString(),
    })

    if (auditError) throw auditError
  }

  const createTransfer = async (
    producto: string,
    cantidad: number,
    origen: string,
    destino: string,
    prioridad: Priority,
    descripcion?: string,
  ): Promise<string | null> => {
    try {
      const newId = `TRF-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${String(transfers.length + 1).padStart(3, '0')}`
      const timestamp = new Date().toISOString()

      const { error: transferError } = await supabase.from('transfers').insert({
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
      })

      if (transferError) throw transferError

      await createAuditEvent(
        newId,
        'Rodrigo M.',
        'supervisor_solicitante',
        'crear_solicitud',
        undefined,
        'CREADA',
        `Transferencia creada: ${cantidad} unidades de ${producto}`,
        { producto, cantidad, origen, destino, prioridad, descripcion },
      )

      await fetchTransfers()
      return newId
    } catch (err: any) {
      console.error('Error creating transfer:', err)
      setError(err.message)
      return null
    }
  }

  const updateTransferStatus = async (
    transferId: string,
    newStatus: TransferStatus,
    actor: string,
    rol: UserRole,
    accion: string,
    descripcion: string,
    additionalData?: Record<string, any>,
    transferUpdates: Partial<Transfer> = {},
  ) => {
    try {
      const transfer = transfers.find((t) => t.id === transferId)
      if (!transfer) throw new Error('Transferencia no encontrada')

      const estadoAnterior = transfer.estado
      const timestamp = new Date().toISOString()

      const { error: updateError } = await supabase
        .from('transfers')
        .update({
          estado: newStatus,
          fecha_actualizacion: timestamp,
          ...transferUpdates,
        })
        .eq('id', transferId)

      if (updateError) throw updateError

      await createAuditEvent(
        transferId,
        actor,
        rol,
        accion,
        estadoAnterior,
        newStatus,
        descripcion,
        additionalData,
      )

      await fetchTransfers()
    } catch (err: any) {
      console.error(`Error in ${accion}:`, err)
      setError(err.message)
    }
  }

  const approveTransfer = (transferId: string) =>
    updateTransferStatus(
      transferId,
      'APROBADA',
      'Carlos S.',
      'supervisor_remitente',
      'aprobar_solicitud',
      'Supervisor remitente aprobó la transferencia',
    )

  const rejectTransfer = (transferId: string, motivo: string) =>
    updateTransferStatus(
      transferId,
      'RECHAZADA',
      'Carlos S.',
      'supervisor_remitente',
      'rechazar_solicitud',
      `Transferencia rechazada: ${motivo}`,
      { motivo },
      { descripcion: `Rechazada: ${motivo}` },
    )

  const reserveTransfer = (transferId: string) => {
    const transfer = transfers.find((t) => t.id === transferId)
    return updateTransferStatus(
      transferId,
      'RESERVADA',
      'Sistema',
      'sistema',
      'reservar_stock',
      `${transfer?.cantidad} unidades reservadas en ${transfer?.origen}`,
      {
        producto: transfer?.producto,
        cantidad: transfer?.cantidad,
        origen: transfer?.origen,
      },
    )
  }

  const dispatchTransfer = (transferId: string) => {
    const transfer = transfers.find((t) => t.id === transferId)
    return updateTransferStatus(
      transferId,
      'EN_TRANSITO',
      'Pedro R.',
      'operario_despacho',
      'registrar_despacho',
      `Transferencia despachada de ${transfer?.origen} hacia ${transfer?.destino}`,
    )
  }

  const receiveTransfer = async (transferId: string, cantidadRecibida: number) => {
    const transfer = transfers.find((t) => t.id === transferId)
    if (!transfer) return

    const diferencia = cantidadRecibida - transfer.cantidad
    const estadoNuevo: TransferStatus = diferencia !== 0 ? 'CON_DIFERENCIA' : 'RECIBIDA_SIN_DIFERENCIA'
    const desc = diferencia !== 0
      ? `Recepción con diferencia: ${diferencia > 0 ? '+' : ''}${diferencia} unidades`
      : 'Recepción conforme sin diferencias'

    return updateTransferStatus(
      transferId,
      estadoNuevo,
      'Miguel A.',
      'operario_recepcion',
      'registrar_recepcion',
      desc,
      {
        cantidad_esperada: transfer.cantidad,
        cantidad_recibida: cantidadRecibida,
        diferencia,
      },
      { cantidad_recibida: cantidadRecibida, diferencia },
    )
  }

  const closeTransfer = (transferId: string) =>
    updateTransferStatus(
      transferId,
      'CERRADA',
      'Sistema',
      'sistema',
      'cerrar_transferencia',
      'Transferencia cerrada correctamente',
    )

  const errorTransfer = (transferId: string, errorMsg: string) =>
    updateTransferStatus(
      transferId,
      'ERROR_RESERVA',
      'Sistema',
      'sistema',
      'error_reserva',
      errorMsg,
      { error: errorMsg },
      { descripcion: `Error: ${errorMsg}` },
    )

  return (
    <TransferContext.Provider
      value={{
        transfers,
        auditLog,
        loading,
        error,
        createTransfer,
        approveTransfer,
        rejectTransfer,
        reserveTransfer,
        dispatchTransfer,
        receiveTransfer,
        closeTransfer,
        errorTransfer,
        fetchTransfers,
      }}
    >
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
