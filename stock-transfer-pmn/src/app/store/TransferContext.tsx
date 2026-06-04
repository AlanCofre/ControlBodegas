import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Transfer, AuditEvent, Priority, TransferStatus, UserRole } from '../../modules/transferencias/types'
import { supabase, seedDatabaseIfNeeded } from '../../shared/utils/supabaseClient'
import { useAuth } from '../../shared/auth/AuthContext'

interface TransferContextType {
  transfers: Transfer[]
  auditLog: AuditEvent[]
  loading: boolean
  createTransfer: (
    producto: string,
    cantidad: number,
    origen: string,
    destino: string,
    prioridad: Priority,
    descripcion?: string,
  ) => Promise<string>
  approveTransfer: (transferId: string) => Promise<void>
  rejectTransfer: (transferId: string, motivo: string) => Promise<void>
  reserveTransfer: (transferId: string) => Promise<void>
  dispatchTransfer: (transferId: string) => Promise<void>
  receiveTransfer: (transferId: string, cantidadRecibida: number) => Promise<void>
  closeTransfer: (transferId: string) => Promise<void>
  errorTransfer: (transferId: string, error: string) => Promise<void>
  refreshData: () => Promise<void>
}

const TransferContext = createContext<TransferContextType | undefined>(undefined)

export function TransferProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const auth = useAuth()

  // Sincronizar datos desde Supabase
  const refreshData = async () => {
    try {
      // 1. Obtener todas las transferencias con sus relaciones
      const { data: transfersData, error: transfersError } = await supabase
        .from('transferencias')
        .select(`
          id,
          codigo,
          cantidad,
          estado,
          observacion,
          created_at,
          updated_at,
          producto_id,
          productos!producto_id (
            id,
            nombre,
            sku
          ),
          bodega_origen_id,
          bodega_origen:bodegas!bodega_origen_id (
            id,
            codigo,
            nombre
          ),
          bodega_destino_id,
          bodega_destino:bodegas!bodega_destino_id (
            id,
            codigo,
            nombre
          ),
          solicitante_id,
          solicitante:usuarios!solicitante_id (
            id,
            nombre,
            email,
            roles!rol_id (
              id,
              nombre
            )
          )
        `)

      if (transfersError) throw transfersError

      // 2. Obtener todos los eventos de auditoría
      const { data: eventsData, error: eventsError } = await supabase
        .from('eventos_auditoria')
        .select(`
          id,
          transferencia_id,
          accion,
          descripcion,
          fecha_evento,
          usuario_id,
          usuario:usuarios!usuario_id (
            id,
            nombre,
            roles!rol_id (
              id,
              nombre
            )
          )
        `)
        .order('fecha_evento', { ascending: true })

      if (eventsError) throw eventsError

      // 3. Mapear los eventos a la interfaz del frontend
      const mappedEvents: AuditEvent[] = (eventsData || []).map((ev) => {
        const transfer = transfersData?.find((t) => Number(t.id) === Number(ev.transferencia_id))
        const code = transfer ? transfer.codigo : String(ev.transferencia_id)
        const user = ev.usuario as any
        return {
          id: String(ev.id),
          transferencia_id: code,
          actor: user ? user.nombre : 'Sistema',
          rol: user && user.roles ? ((Array.isArray(user.roles) ? user.roles[0]?.nombre : user.roles.nombre) as UserRole) : 'sistema',
          accion: ev.accion,
          descripcion: ev.descripcion || '',
          timestamp: ev.fecha_evento,
        }
      })

      // 4. Mapear las transferencias
      const mappedTransfers: Transfer[] = (transfersData || []).map((t) => {
        let prioridad: Priority = 'normal'
        let cantidad_recibida: number | undefined = undefined
        let diferencia: number | undefined = undefined
        let descripcion: string = ''

        // Intentar parsear el JSON de observacion
        if (t.observacion) {
          try {
            const meta = JSON.parse(t.observacion)
            prioridad = meta.prioridad || 'normal'
            cantidad_recibida = meta.cantidad_recibida !== undefined ? meta.cantidad_recibida : undefined
            diferencia = meta.diferencia !== undefined ? meta.diferencia : undefined
            descripcion = meta.descripcion || ''
          } catch (e) {
            // Si no es JSON, es texto plano
            descripcion = t.observacion
          }
        }

        // Mapear estado
        let estado: TransferStatus = t.estado as TransferStatus
        if (t.estado === 'SIN_ORIGEN') {
          estado = 'SIN_ORIGEN'
        }

        const transEvents = mappedEvents.filter((ev) => ev.transferencia_id === t.codigo)

        const prodData = t.productos as any
        const origData = t.bodega_origen as any
        const destData = t.bodega_destino as any
        const solData = t.solicitante as any

        return {
          id: t.codigo,
          db_id: Number(t.id),
          producto: prodData ? (Array.isArray(prodData) ? prodData[0]?.nombre : prodData.nombre) : 'Producto Desconocido',
          producto_id: t.producto_id,
          cantidad: t.cantidad,
          cantidad_recibida,
          diferencia,
          origen: origData ? (Array.isArray(origData) ? origData[0]?.nombre : origData.nombre) : 'Sin origen asignado',
          origen_id: t.bodega_origen_id,
          destino: destData ? (Array.isArray(destData) ? destData[0]?.nombre : destData.nombre) : 'Destino Desconocido',
          destino_id: t.bodega_destino_id,
          prioridad,
          estado,
          creada_por: solData ? (Array.isArray(solData) ? solData[0]?.nombre : solData.nombre) : 'Sistema',
          fecha_creacion: t.created_at,
          fecha_actualizacion: t.updated_at,
          descripcion,
          eventos: transEvents,
        }
      })

      setTransfers(mappedTransfers)
      setAuditLog(mappedEvents)
    } catch (err) {
      console.error('Error al actualizar datos desde Supabase:', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await seedDatabaseIfNeeded()
      await refreshData()
      setLoading(false)
    }
    init()
  }, [])

  const createTransfer = async (
    producto: string,
    cantidad: number,
    origen: string,
    destino: string,
    prioridad: Priority,
    descripcion?: string,
  ): Promise<string> => {
    // 1. Obtener ID del producto
    const { data: prodData } = await supabase
      .from('productos')
      .select('id')
      .eq('nombre', producto)
      .single()

    if (!prodData) throw new Error(`Producto no encontrado: ${producto}`)

    // 2. Obtener ID de la bodega de origen (puede ser null)
    let origenId: number | null = null
    if (origen && origen !== 'Sin origen asignado') {
      const { data: origData } = await supabase
        .from('bodegas')
        .select('id')
        .eq('nombre', origen)
        .single()
      if (origData) origenId = Number(origData.id)
    }

    // 3. Obtener ID de la bodega de destino
    const { data: destData } = await supabase
      .from('bodegas')
      .select('id')
      .eq('nombre', destino)
      .single()

    if (!destData) throw new Error(`Bodega destino no encontrada: ${destino}`)

    // 4. Generar código único
    const newCodigo = `TRF-2026-${Math.floor(100000 + Math.random() * 900000)}`

    // 5. Preparar observación JSON
    const observacionJson = JSON.stringify({
      prioridad,
      descripcion: descripcion || '',
    })

    // 6. Determinar el ID del solicitante (usuario activo)
    const solicitanteId = auth.user ? auth.user.id : 1 // fallback al primer usuario si no hay sesión

    // 7. Insertar transferencia
    const { data: newTransfer, error: insertError } = await supabase
      .from('transferencias')
      .insert({
        codigo: newCodigo,
        producto_id: prodData.id,
        cantidad,
        estado: 'CREADA',
        bodega_origen_id: origenId,
        bodega_destino_id: destData.id,
        solicitante_id: solicitanteId,
        observacion: observacionJson,
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // 8. Crear evento de auditoría de creación
    await supabase.from('eventos_auditoria').insert({
      transferencia_id: newTransfer.id,
      usuario_id: solicitanteId,
      accion: 'crear_solicitud',
      descripcion: `Transferencia creada: ${cantidad} unidades de ${producto}`,
    })

    await refreshData()
    return newCodigo
  }

  const approveTransfer = async (transferId: string): Promise<void> => {
    // Buscar la transferencia localmente
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    // Actualizar transferencia
    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        estado: 'APROBADA',
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.db_id)

    if (updateError) throw updateError

    // Crear evento de auditoría
    await supabase.from('eventos_auditoria').insert({
      transferencia_id: t.db_id,
      usuario_id: auth.user ? auth.user.id : null,
      accion: 'aprobar_solicitud',
      descripcion: 'Supervisor remitente aprobó la transferencia',
    })

    await refreshData()
  }

  const rejectTransfer = async (transferId: string, motivo: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    // Actualizar observación JSON para agregar el motivo de rechazo
    const newObservacion = JSON.stringify({
      prioridad: t.prioridad,
      descripcion: t.descripcion,
      motivo_rechazo: motivo,
    })

    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        estado: 'RECHAZADA',
        observacion: newObservacion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.db_id)

    if (updateError) throw updateError

    await supabase.from('eventos_auditoria').insert({
      transferencia_id: t.db_id,
      usuario_id: auth.user ? auth.user.id : null,
      accion: 'rechazar_solicitud',
      descripcion: `Transferencia rechazada: ${motivo}`,
    })

    await refreshData()
  }

  const reserveTransfer = async (transferId: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id || !t.origen_id || !t.producto_id) return

    try {
      // 1. Obtener stock disponible de inventario en origen
      const { data: invData, error: invError } = await supabase
        .from('inventario')
        .select('id, stock_disponible, stock_reservado')
        .eq('bodega_id', t.origen_id)
        .eq('producto_id', t.producto_id)
        .single()

      if (invError || !invData) {
        throw new Error('No se encontró el registro de inventario en la bodega origen')
      }

      if (Number(invData.stock_disponible) < t.cantidad) {
        // No hay stock suficiente, marcamos como ERROR_RESERVA
        await supabase
          .from('transferencias')
          .update({
            estado: 'ERROR_RESERVA',
            updated_at: new Date().toISOString(),
          })
          .eq('id', t.db_id)

        await supabase.from('eventos_auditoria').insert({
          transferencia_id: t.db_id,
          usuario_id: null, // sistema
          accion: 'error_reserva',
          descripcion: `Fallo de reserva: Stock insuficiente en ${t.origen}. Disponible: ${invData.stock_disponible}, Requerido: ${t.cantidad}`,
        })

        await refreshData()
        throw new Error(`Stock insuficiente en ${t.origen} para reservar la transferencia`)
      }

      // 2. Modificar stocks en inventario
      const nuevoDisponible = Number(invData.stock_disponible) - t.cantidad
      const nuevoReservado = Number(invData.stock_reservado) + t.cantidad

      const { error: updateInvError } = await supabase
        .from('inventario')
        .update({
          stock_disponible: nuevoDisponible,
          stock_reservado: nuevoReservado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invData.id)

      if (updateInvError) throw updateInvError

      // 3. Modificar transferencia a RESERVADA
      await supabase
        .from('transferencias')
        .update({
          estado: 'RESERVADA',
          updated_at: new Date().toISOString(),
        })
        .eq('id', t.db_id)

      // 4. Registrar evento
      await supabase.from('eventos_auditoria').insert({
        transferencia_id: t.db_id,
        usuario_id: null, // sistema
        accion: 'reservar_stock',
        descripcion: `${t.cantidad} unidades reservadas en ${t.origen}`,
      })

      await refreshData()
    } catch (err: any) {
      console.error('Error al reservar transferencia:', err)
      // Aseguramos que la transferencia pase a error si falla algo técnico
      await supabase
        .from('transferencias')
        .update({
          estado: 'ERROR_RESERVA',
          updated_at: new Date().toISOString(),
        })
        .eq('id', t.db_id)

      await supabase.from('eventos_auditoria').insert({
        transferencia_id: t.db_id,
        usuario_id: null,
        accion: 'error_reserva',
        descripcion: `Error técnico de reserva: ${err.message || 'Error desconocido'}`,
      })

      await refreshData()
      throw err
    }
  }

  const dispatchTransfer = async (transferId: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        estado: 'EN_TRANSITO',
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.db_id)

    if (updateError) throw updateError

    await supabase.from('eventos_auditoria').insert({
      transferencia_id: t.db_id,
      usuario_id: auth.user ? auth.user.id : null,
      accion: 'registrar_despacho',
      descripcion: `Transferencia despachada de ${t.origen} hacia ${t.destino}`,
    })

    await refreshData()
  }

  const receiveTransfer = async (transferId: string, cantidadRecibida: number): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id || !t.origen_id || !t.destino_id || !t.producto_id) return

    try {
      const diferencia = cantidadRecibida - t.cantidad
      const estadoNuevo: TransferStatus = diferencia === 0 ? 'RECIBIDA_SIN_DIFERENCIA' : 'CON_DIFERENCIA'

      // 1. Modificar inventario origen: restar del stock reservado
      const { data: invOrig, error: origError } = await supabase
        .from('inventario')
        .select('id, stock_reservado')
        .eq('bodega_id', t.origen_id)
        .eq('producto_id', t.producto_id)
        .single()

      if (origError) throw origError
      const nuevoReservadoOrig = Math.max(0, Number(invOrig.stock_reservado) - t.cantidad)

      await supabase
        .from('inventario')
        .update({
          stock_reservado: nuevoReservadoOrig,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invOrig.id)

      // 2. Modificar inventario destino: sumar al stock disponible
      let { data: invDest, error: destError } = await supabase
        .from('inventario')
        .select('id, stock_disponible')
        .eq('bodega_id', t.destino_id)
        .eq('producto_id', t.producto_id)
        .single()

      if (destError || !invDest) {
        // Si no existe el registro de inventario en destino, lo creamos
        const { data: newInvDest, error: createError } = await supabase
          .from('inventario')
          .insert({
            bodega_id: t.destino_id,
            producto_id: t.producto_id,
            stock_disponible: cantidadRecibida,
            stock_reservado: 0,
          })
          .select('id, stock_disponible')
          .single()

        if (createError) throw createError
        invDest = newInvDest
      } else {
        const nuevoDisponibleDest = Number(invDest.stock_disponible) + cantidadRecibida
        await supabase
          .from('inventario')
          .update({
            stock_disponible: nuevoDisponibleDest,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invDest.id)
      }

      // 3. Guardar meta en observación
      const observacionJson = JSON.stringify({
        prioridad: t.prioridad,
        descripcion: t.descripcion,
        cantidad_recibida: cantidadRecibida,
        diferencia: diferencia,
      })

      // 4. Modificar estado de la transferencia
      await supabase
        .from('transferencias')
        .update({
          estado: estadoNuevo,
          observacion: observacionJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', t.db_id)

      // 5. Registrar evento de auditoría
      const descrip = diferencia === 0
        ? 'Recepción conforme sin diferencias'
        : `Recepción con diferencia: ${diferencia > 0 ? '+' : ''}${diferencia} unidades`

      await supabase.from('eventos_auditoria').insert({
        transferencia_id: t.db_id,
        usuario_id: auth.user ? auth.user.id : null,
        accion: 'registrar_recepcion',
        descripcion: descrip,
      })

      await refreshData()
    } catch (err) {
      console.error('Error al recibir transferencia:', err)
      throw err
    }
  }

  const closeTransfer = async (transferId: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        estado: 'CERRADA',
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.db_id)

    if (updateError) throw updateError

    await supabase.from('eventos_auditoria').insert({
      transferencia_id: t.db_id,
      usuario_id: null,
      accion: 'cerrar_transferencia',
      descripcion: 'Transferencia cerrada correctamente',
    })

    await refreshData()
  }

  const errorTransfer = async (transferId: string, error: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        estado: 'ERROR_RESERVA',
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.db_id)

    if (updateError) throw updateError

    await supabase.from('eventos_auditoria').insert({
      transferencia_id: t.db_id,
      usuario_id: null,
      accion: 'error_reserva',
      descripcion: error,
    })

    await refreshData()
  }

  return (
    <TransferContext.Provider
      value={{
        transfers,
        auditLog,
        loading,
        createTransfer,
        approveTransfer,
        rejectTransfer,
        reserveTransfer,
        dispatchTransfer,
        receiveTransfer,
        closeTransfer,
        errorTransfer,
        refreshData,
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