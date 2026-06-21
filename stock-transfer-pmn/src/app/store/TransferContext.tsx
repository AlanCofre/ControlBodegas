import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Transfer, AuditEvent, Priority, TransferStatus, UserRole } from '../../modules/transferencias/types'
import { supabase } from '../../shared/utils/supabaseClient'
import { useAuth, type DbUser, normalizeRole } from '../../shared/auth/AuthContext'

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
  adjustStock: (
    productoId: number,
    productoNombre: string,
    bodegaId: number,
    bodegaNombre: string,
    tipoAjuste: 'incrementar' | 'disminuir',
    cantidad: number,
    motivo: string,
  ) => Promise<void>
  cancelReserveTransfer: (transferId: string, motivo: string) => Promise<void>
  assignCarrier: (transferId: string, carrierId: number) => Promise<void>
  getAvailableCarriers: () => Promise<DbUser[]>
  reportIncident: (transferId: string, descripcion: string) => Promise<void>
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
            bodega_id,
            roles!rol_id (
              id,
              nombre
            )
          ),
          transportista_id,
          transportista:usuarios!transportista_id (
            id,
            nombre,
            email
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

      // Obtener bodegas para mapeo en filtros de supervisor
      const { data: bodegasData } = await supabase
        .from('bodegas')
        .select('id, nombre')

      // 3. Mapear los eventos a la interfaz del frontend
      const mappedEvents: AuditEvent[] = (eventsData || []).map((ev) => {
        const transfer = ev.transferencia_id ? transfersData?.find((t) => Number(t.id) === Number(ev.transferencia_id)) : null
        const code = transfer ? transfer.codigo : (ev.transferencia_id ? String(ev.transferencia_id) : 'N/A')
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
        let motivo_rechazo: string | undefined = undefined
        let motivo_cancelacion_reserva: string | undefined = undefined
        let descripcion_incidente: string | undefined = undefined

        // Intentar parsear el JSON de observacion
        if (t.observacion) {
          try {
            const meta = JSON.parse(t.observacion)
            prioridad = meta.prioridad || 'normal'
            cantidad_recibida = meta.cantidad_recibida !== undefined ? meta.cantidad_recibida : undefined
            diferencia = meta.diferencia !== undefined ? meta.diferencia : undefined
            descripcion = meta.descripcion || ''
            motivo_rechazo = meta.motivo_rechazo || undefined
            motivo_cancelacion_reserva = meta.motivo_cancelacion_reserva || undefined
            descripcion_incidente = meta.descripcion_incidente || undefined
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
        const transpData = t.transportista as any
 
        return {
          id: t.codigo,
          db_id: Number(t.id),
          solicitante_id: t.solicitante_id ? Number(t.solicitante_id) : undefined,
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
          motivo_rechazo,
          motivo_cancelacion_reserva,
          transportista_id: t.transportista_id ? Number(t.transportista_id) : undefined,
          transportista_nombre: transpData ? (Array.isArray(transpData) ? transpData[0]?.nombre : transpData.nombre) : undefined,
          descripcion_incidente: descripcion_incidente,
          eventos: transEvents,
        }
      })

      // Filtrar transferencias y eventos según el rol del usuario autenticado
      let filteredTransfers = mappedTransfers
      let filteredEvents = mappedEvents

      const user = auth.user
      if (user && (user.rol === 'supervisor_bodega' || user.rol === 'operador_bodega')) {
        const bodegaId = user.bodegaId
        filteredTransfers = mappedTransfers.filter(
          (t) => t.origen_id === bodegaId || t.destino_id === bodegaId
        )
        const allowedTransferCodes = new Set(filteredTransfers.map((t) => t.id))

        let supervisorBodegaNombre = ''
        if (bodegaId && bodegasData) {
          const b = bodegasData.find((x) => Number(x.id) === Number(bodegaId))
          if (b) supervisorBodegaNombre = b.nombre
        }

        filteredEvents = mappedEvents.filter((ev) => {
          if (ev.transferencia_id && ev.transferencia_id !== 'N/A') {
            return allowedTransferCodes.has(ev.transferencia_id)
          }
          if (ev.accion === 'ajuste_manual') {
            return supervisorBodegaNombre ? ev.descripcion.includes(supervisorBodegaNombre) : false
          }
          return false
        })
      } else if (user && user.rol === 'transportista') {
        filteredTransfers = mappedTransfers.filter(
          (t) => t.transportista_id === user.id
        )
        const allowedTransferCodes = new Set(filteredTransfers.map((t) => t.id))

        filteredEvents = mappedEvents.filter((ev) => {
          if (ev.transferencia_id && ev.transferencia_id !== 'N/A') {
            return allowedTransferCodes.has(ev.transferencia_id)
          }
          return false
        })
      }

      setTransfers(filteredTransfers)
      setAuditLog(filteredEvents)
    } catch (err) {
      console.error('Error al actualizar datos desde Supabase:', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
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
    let destinoId: number
    if (auth.user && auth.user.rol === 'supervisor_bodega' && auth.user.bodegaId) {
      destinoId = auth.user.bodegaId
    } else {
      const { data: destData } = await supabase
        .from('bodegas')
        .select('id')
        .eq('nombre', destino)
        .single()

      if (!destData) throw new Error(`Bodega destino no encontrada: ${destino}`)
      destinoId = Number(destData.id)
    }

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
        bodega_destino_id: destinoId,
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

    // Validar estado de la transferencia
    if (t.estado !== 'APROBADA') {
      throw new Error(`No se puede reservar: La transferencia debe estar en estado APROBADA. Estado actual: ${t.estado}`)
    }

    // Validar autorización para reservar stock
    if (!auth.user || (auth.user.rol !== 'operador_bodega' && auth.user.rol !== 'administrador')) {
      throw new Error('No autorizado: Solo los operadores de bodega o administradores pueden reservar stock.')
    }
    if (auth.user.rol === 'operador_bodega' && Number(t.origen_id) !== Number(auth.user.bodegaId)) {
      throw new Error('No autorizado: Un operador solo puede reservar stock en su propia bodega de origen.')
    }

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
          usuario_id: auth.user.id,
          accion: 'error_reserva',
          descripcion: `Fallo de reserva: Stock insuficiente en ${t.origen} para reservar ${t.cantidad} unidades. Operación realizada por el operador ${auth.user.nombre}.`,
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
        usuario_id: auth.user.id,
        accion: 'reservar_stock',
        descripcion: `Reserva de stock realizada: ${t.cantidad} unidades de ${t.producto} reservadas por el operador ${auth.user.nombre} en ${t.origen}.`,
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
        usuario_id: auth.user ? auth.user.id : null,
        accion: 'error_reserva',
        descripcion: `Error técnico de reserva: ${err.message || 'Error desconocido'}.`,
      })

      await refreshData()
      throw err
    }
  }

  const dispatchTransfer = async (transferId: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    // Validar autorización para despachar transferencia (solo operador de origen o administrador)
    if (!auth.user || (auth.user.rol !== 'operador_bodega' && auth.user.rol !== 'administrador')) {
      throw new Error('No autorizado: Solo los operadores de bodega o administradores pueden despachar mercancía.')
    }
    if (auth.user.rol === 'operador_bodega' && Number(t.origen_id) !== Number(auth.user.bodegaId)) {
      throw new Error('No autorizado: El operador solo puede registrar el despacho en su propia bodega de origen.')
    }

    if (!t.transportista_id) {
      throw new Error('No se puede despachar: Debe asignar un transportista antes de realizar el despacho.')
    }

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

    // Validar autorización para recibir transferencia (solo operador de destino o administrador)
    if (!auth.user || (auth.user.rol !== 'operador_bodega' && auth.user.rol !== 'administrador')) {
      throw new Error('No autorizado: Solo los operadores de bodega o administradores pueden recibir mercancía.')
    }
    if (auth.user.rol === 'operador_bodega' && Number(t.destino_id) !== Number(auth.user.bodegaId)) {
      throw new Error('No autorizado: El operador solo puede registrar la recepción en su propia bodega de destino.')
    }

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

      // 4. Modificar estado de la transferencia y liberar al transportista
      await supabase
        .from('transferencias')
        .update({
          estado: estadoNuevo,
          observacion: observacionJson,
          transportista_id: null,
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

  const adjustStock = async (
    productoId: number,
    productoNombre: string,
    bodegaId: number,
    bodegaNombre: string,
    tipoAjuste: 'incrementar' | 'disminuir',
    cantidad: number,
    motivo: string,
  ): Promise<void> => {
    try {
      // 1. Obtener registro de inventario actual
      const { data: invData, error: invError } = await supabase
        .from('inventario')
        .select('id, stock_disponible, stock_reservado')
        .eq('bodega_id', bodegaId)
        .eq('producto_id', productoId)
        .maybeSingle()

      if (invError) throw invError

      const stockAnterior = invData ? Number(invData.stock_disponible) : 0
      const stockNuevo = tipoAjuste === 'incrementar' ? stockAnterior + cantidad : stockAnterior - cantidad

      if (stockNuevo < 0) {
        throw new Error(`El stock resultante no puede ser menor a 0. Stock actual disponible: ${stockAnterior}, Ajuste solicitado: ${tipoAjuste === 'incrementar' ? '+' : '-'}${cantidad}`)
      }

      // 2. Actualizar o insertar registro en inventario
      if (invData) {
        const { error: updateError } = await supabase
          .from('inventario')
          .update({
            stock_disponible: stockNuevo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invData.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('inventario')
          .insert({
            bodega_id: bodegaId,
            producto_id: productoId,
            stock_disponible: stockNuevo,
            stock_reservado: 0,
            updated_at: new Date().toISOString(),
          })

        if (insertError) throw insertError
      }

      // 3. Crear registro de auditoría
      const signo = tipoAjuste === 'incrementar' ? '+' : '-'
      const descripcion = `Ajuste manual de stock para ${productoNombre} en ${bodegaNombre}. Stock anterior: ${stockAnterior}, Ajuste: ${signo}${cantidad}, Stock resultante: ${stockNuevo}. Motivo: ${motivo}`

      const { error: auditError } = await supabase
        .from('eventos_auditoria')
        .insert({
          transferencia_id: null,
          usuario_id: auth.user ? auth.user.id : null,
          accion: 'ajuste_manual',
          descripcion: descripcion,
          fecha_evento: new Date().toISOString(),
        })

      if (auditError) throw auditError

      await refreshData()
    } catch (err) {
      console.error('Error al realizar ajuste de stock:', err)
      throw err
    }
  }

  const cancelReserveTransfer = async (transferId: string, motivo: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    // Validar estado de la transferencia
    if (t.estado !== 'APROBADA') {
      throw new Error(`No se puede cancelar: La transferencia debe estar en estado APROBADA. Estado actual: ${t.estado}`)
    }

    // Validar autorización para cancelar reserva
    if (!auth.user || (auth.user.rol !== 'operador_bodega' && auth.user.rol !== 'administrador')) {
      throw new Error('No autorizado: Solo los operadores de bodega o administradores pueden cancelar la reserva.')
    }
    if (auth.user.rol === 'operador_bodega' && Number(t.origen_id) !== Number(auth.user.bodegaId)) {
      throw new Error('No autorizado: Un operador solo puede cancelar la reserva de una transferencia en su propia bodega.')
    }

    // Actualizar observación JSON para agregar el motivo de cancelación
    const newObservacion = JSON.stringify({
      prioridad: t.prioridad,
      descripcion: t.descripcion,
      motivo_cancelacion_reserva: motivo,
    })

    const { error: updateError } = await supabase
      .from('transferencias')
      .update({
        estado: 'ERROR_RESERVA',
        observacion: newObservacion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.db_id)

    if (updateError) throw updateError

    // Registrar evento de auditoría
    await supabase.from('eventos_auditoria').insert({
      transferencia_id: t.db_id,
      usuario_id: auth.user.id,
      accion: 'error_reserva',
      descripcion: `Reserva cancelada por operador: ${motivo}.`,
    })

    await refreshData()
  }

  const getAvailableCarriers = async (): Promise<DbUser[]> => {
    try {
      const { data: dbUsersData, error: usersError } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          email,
          bodega_id,
          roles!rol_id (
            nombre
          )
        `)
        .eq('activo', true)

      if (usersError || !dbUsersData) {
        console.error('Error al obtener transportistas:', usersError)
        return []
      }

      const { data: activeTransfers, error: transError } = await supabase
        .from('transferencias')
        .select('transportista_id')
        .in('estado', ['RESERVADA', 'EN_TRANSITO', 'EN_TRANSITO_CON_INCIDENTE'])
        .not('transportista_id', 'is', null)

      if (transError) {
        console.error('Error al obtener transferencias activas:', transError)
        return []
      }

      const busyCarrierIds = new Set((activeTransfers || []).map((t) => Number(t.transportista_id)))

      return dbUsersData
        .map((u: any) => {
          const rawRole = u.roles ? (Array.isArray(u.roles) ? u.roles[0]?.nombre : u.roles.nombre) : ''
          return {
            id: Number(u.id),
            nombre: u.nombre,
            rol: normalizeRole(rawRole),
            email: u.email,
            bodegaId: u.bodega_id ? Number(u.bodega_id) : null,
          } as DbUser
        })
        .filter((u) => u.rol === 'transportista' && !busyCarrierIds.has(u.id))
    } catch (err) {
      console.error('Error en getAvailableCarriers:', err)
      return []
    }
  }

  const assignCarrier = async (transferId: string, carrierId: number): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    if (!auth.user || (auth.user.rol !== 'operador_bodega' && auth.user.rol !== 'administrador')) {
      throw new Error('No autorizado: Solo los operadores de bodega o administradores pueden asignar transportistas.')
    }
    if (auth.user.rol === 'operador_bodega' && Number(t.origen_id) !== Number(auth.user.bodegaId)) {
      throw new Error('No autorizado: Un operador solo puede asignar transportistas en transferencias de su propia bodega de origen.')
    }

    try {
      const available = await getAvailableCarriers()
      if (!available.some((c) => c.id === carrierId)) {
        throw new Error('El transportista seleccionado no está disponible o no existe.')
      }

      const carrier = available.find((c) => c.id === carrierId)
      const carrierName = carrier ? carrier.nombre : `ID ${carrierId}`

      const { error: updateError } = await supabase
        .from('transferencias')
        .update({
          transportista_id: carrierId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', t.db_id)

      if (updateError) throw updateError

      await supabase.from('eventos_auditoria').insert({
        transferencia_id: t.db_id,
        usuario_id: auth.user.id,
        accion: 'asignar_transportista',
        descripcion: `Transportista ${carrierName} asignado por ${auth.user.nombre}.`,
      })

      await refreshData()
    } catch (err) {
      console.error('Error al asignar transportista:', err)
      throw err
    }
  }

  const reportIncident = async (transferId: string, descripcion: string): Promise<void> => {
    const t = transfers.find((x) => x.id === transferId)
    if (!t || !t.db_id) return

    if (!auth.user || auth.user.rol !== 'transportista') {
      throw new Error('No autorizado: Solo los transportistas pueden reportar incidentes.')
    }
    if (Number(t.transportista_id) !== Number(auth.user.id)) {
      throw new Error('No autorizado: Solo el transportista responsable asignado a esta transferencia puede reportar un incidente.')
    }
    if (!descripcion || !descripcion.trim()) {
      throw new Error('La descripción del incidente es obligatoria.')
    }

    try {
      const newObservacion = JSON.stringify({
        prioridad: t.prioridad,
        descripcion: t.descripcion,
        descripcion_incidente: descripcion.trim(),
      })

      const { error: updateError } = await supabase
        .from('transferencias')
        .update({
          estado: 'EN_TRANSITO_CON_INCIDENTE',
          observacion: newObservacion,
          updated_at: new Date().toISOString(),
        })
        .eq('id', t.db_id)

      if (updateError) throw updateError

      await supabase.from('eventos_auditoria').insert({
        transferencia_id: t.db_id,
        usuario_id: auth.user.id,
        accion: 'reportar_incidente',
        descripcion: `Incidente reportado durante el transporte. Detalle: ${descripcion.trim()}`,
      })

      await refreshData()
    } catch (err) {
      console.error('Error al reportar incidente:', err)
      throw err
    }
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
        adjustStock,
        cancelReserveTransfer,
        assignCarrier,
        getAvailableCarriers,
        reportIncident,
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