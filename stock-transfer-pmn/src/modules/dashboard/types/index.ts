export interface DashboardStats {
  total: number
  pending: number
  inTransit: number
  completed: number
  withDifference: number
  rejected: number
  errors: number
}

export interface DashboardCard {
  title: string
  value: number | string
  subtitle: string
  color: 'gray' | 'yellow' | 'purple' | 'green' | 'orange' | 'red' | 'blue'
}