// Tipos compartidos en toda la aplicación

export interface NavLinkItem {
  name: string
  path: string
  allowedRoles: UserRole[]
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  bodegaId?: number | null
}

export interface TransferStatus {
  value: TransferStatusValue
  label: string
  color: StatusColor
}


export type UserRole =
  | 'administrador'
  | 'supervisor_bodega'
  | 'operador_bodega'
  | 'transportista'


export type TransferStatusValue =
  | 'creada'
  | 'aprobada'
  | 'reservada'
  | 'en_transito'
  | 'en_transito_con_incidente'
  | 'recibida'
  | 'con_diferencia'
  | 'rechazada'
  | 'rechazada_en_destino'
  | 'escalada'
  | 'sin_origen_disponible'
  | 'error_reserva'
  | 'cerrada'

export type StatusColor =
  | 'gray'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'

export type AppAction =
  | 'ver_alertas'
  | 'consultar_inventario'
  | 'crear_solicitud'
  | 'seleccionar_bodega_origen'
  | 'aprobar_solicitud'
  | 'rechazar_solicitud'
  | 'validar_discrepancia'
  | 'registrar_despacho'
  | 'registrar_recepcion'
  | 'cerrar_transferencia'
  | 'configurar_parametros'
  | 'resolver_escalacion'