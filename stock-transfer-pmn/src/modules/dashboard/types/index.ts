export interface DashboardStats {
  totalTransfers: number
  pending: number
  completed: number
  rejected: number
}

export interface DashboardCard {
  title: string
  value: number | string
  subtitle: string
  color: 'blue' | 'yellow' | 'green' | 'red'
}
