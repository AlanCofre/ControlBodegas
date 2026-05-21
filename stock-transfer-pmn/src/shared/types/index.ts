// Tipos compartidos en toda la aplicación

export interface NavLinkItem {
  name: string
  path: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
}

export interface TransferStatus {
  value: 'pending' | 'processing' | 'completed' | 'rejected'
  label: string
  color: 'yellow' | 'blue' | 'green' | 'red'
}
