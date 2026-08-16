export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  reference?: string
  status: 'pending' | 'reviewed' | 'flagged'
}
