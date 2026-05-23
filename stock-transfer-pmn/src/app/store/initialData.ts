import type { Transfer, AuditEvent } from '../../modules/transferencias/types'

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase()

const generateAuditEvent = (
  transferencia_id: string,
  actor: string,
  accion: string,
  estado_nuevo: string,
  descripcion: string,
  timestamp: string,
): AuditEvent => ({
  id: generateId(),
  transferencia_id,
  actor,
  rol: 'sistema',
  accion,
  estado_nuevo: estado_nuevo as any,
  descripcion,
  timestamp,
  datos_adicionales: {},
})

const baseTime = new Date('2026-05-23T08:00:00')

const getTime = (minutesOffset: number) => {
  const date = new Date(baseTime)
  date.setMinutes(date.getMinutes() + minutesOffset)
  return date.toISOString()
}

export const initialTransfers: Transfer[] = [
  {
    id: 'TRF-001',
    producto: 'Laptop DELL XPS 13',
    cantidad: 5,
    cantidad_recibida: 5,
    origen: 'Bodega Centro',
    destino: 'Bodega Sur',
    prioridad: 'alta',
    estado: 'CERRADA',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(0),
    fecha_actualizacion: getTime(120),
    descripcion: 'Transferencia de equipos de oficina - Cerrada exitosamente',
    eventos: [
      generateAuditEvent('TRF-001', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(0)),
      generateAuditEvent('TRF-001', 'Carlos S.', 'aprobar', 'APROBADA', 'Supervisor bodega aprobó', getTime(10)),
      generateAuditEvent('TRF-001', 'Pedro R.', 'reservar', 'RESERVADA', 'Producto reservado en origen', getTime(20)),
      generateAuditEvent('TRF-001', 'Pedro R.', 'despachar', 'EN_TRANSITO', 'Transferencia despachada', getTime(60)),
      generateAuditEvent('TRF-001', 'Sistema', 'recibir', 'RECIBIDA_SIN_DIFERENCIA', 'Recibido sin diferencia', getTime(120)),
      generateAuditEvent('TRF-001', 'Sistema', 'cerrar', 'CERRADA', 'Transferencia cerrada', getTime(120)),
    ],
  },
  {
    id: 'TRF-002',
    producto: 'Monitor LG 27"',
    cantidad: 10,
    cantidad_recibida: 10,
    origen: 'Bodega Centro',
    destino: 'Bodega Norte',
    prioridad: 'normal',
    estado: 'EN_TRANSITO',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(-30),
    fecha_actualizacion: getTime(15),
    descripcion: 'Stock de monitores en tránsito',
    eventos: [
      generateAuditEvent('TRF-002', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(-30)),
      generateAuditEvent('TRF-002', 'Carlos S.', 'aprobar', 'APROBADA', 'Supervisor bodega aprobó', getTime(-20)),
      generateAuditEvent('TRF-002', 'Pedro R.', 'reservar', 'RESERVADA', 'Producto reservado en origen', getTime(-10)),
      generateAuditEvent('TRF-002', 'Pedro R.', 'despachar', 'EN_TRANSITO', 'Transferencia despachada', getTime(15)),
    ],
  },
  {
    id: 'TRF-003',
    producto: 'Teclado Mecánico RGB',
    cantidad: 20,
    origen: 'Bodega Centro',
    destino: 'Bodega Este',
    prioridad: 'baja',
    estado: 'APROBADA',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(-10),
    fecha_actualizacion: getTime(-5),
    descripcion: 'Transferencia de accesorios periféricos',
    eventos: [
      generateAuditEvent('TRF-003', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(-10)),
      generateAuditEvent('TRF-003', 'Carlos S.', 'aprobar', 'APROBADA', 'Supervisor bodega aprobó', getTime(-5)),
    ],
  },
  {
    id: 'TRF-004',
    producto: 'Mouse Logitech MX Master',
    cantidad: 15,
    origen: 'Bodega Sur',
    destino: 'Bodega Centro',
    prioridad: 'urgente',
    estado: 'RECHAZADA',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(-60),
    fecha_actualizacion: getTime(-50),
    descripcion: 'Transferencia rechazada - Stock insuficiente en origen',
    eventos: [
      generateAuditEvent('TRF-004', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(-60)),
      generateAuditEvent('TRF-004', 'Carlos S.', 'rechazar', 'RECHAZADA', 'Stock insuficiente en bodega origen', getTime(-50)),
    ],
  },
  {
    id: 'TRF-005',
    producto: 'Monitor Samsung 32"',
    cantidad: 8,
    origen: 'Bodega Centro',
    destino: 'Bodega Oeste',
    prioridad: 'alta',
    estado: 'RESERVADA',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(-45),
    fecha_actualizacion: getTime(-15),
    descripcion: 'Equipo en proceso de reserva',
    eventos: [
      generateAuditEvent('TRF-005', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(-45)),
      generateAuditEvent('TRF-005', 'Carlos S.', 'aprobar', 'APROBADA', 'Supervisor bodega aprobó', getTime(-35)),
      generateAuditEvent('TRF-005', 'Pedro R.', 'reservar', 'RESERVADA', 'Producto reservado en origen', getTime(-15)),
    ],
  },
  {
    id: 'TRF-006',
    producto: 'Webcam Logitech HD',
    cantidad: 12,
    origen: 'Bodega Norte',
    destino: 'Bodega Centro',
    prioridad: 'normal',
    estado: 'CREADA',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(-5),
    fecha_actualizacion: getTime(-5),
    descripcion: 'Transferencia nueva - Aguardando aprobación',
    eventos: [
      generateAuditEvent('TRF-006', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(-5)),
    ],
  },
  {
    id: 'TRF-007',
    producto: 'Auriculares Sony WH-1000XM5',
    cantidad: 6,
    origen: 'Bodega Centro',
    destino: 'Bodega Sur',
    prioridad: 'normal',
    estado: 'ERROR_RESERVA',
    creada_por: 'Rodrigo M.',
    fecha_creacion: getTime(-90),
    fecha_actualizacion: getTime(-60),
    descripcion: 'Error al reservar stock - Referencia de producto inválida',
    eventos: [
      generateAuditEvent('TRF-007', 'Rodrigo M.', 'crear', 'CREADA', 'Transferencia creada', getTime(-90)),
      generateAuditEvent('TRF-007', 'Carlos S.', 'aprobar', 'APROBADA', 'Supervisor bodega aprobó', getTime(-80)),
      generateAuditEvent('TRF-007', 'Pedro R.', 'error_reserva', 'ERROR_RESERVA', 'Error: Referencia de producto no encontrada', getTime(-60)),
    ],
  },
]
