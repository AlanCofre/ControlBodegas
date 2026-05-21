export interface Transfer {
  id: string
  origin: string
  destination: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  date: string
  items: TransferItem[]
}

export interface TransferItem {
  sku: string
  name: string
  quantity: number
  unit: string
}

export interface TransferFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}
