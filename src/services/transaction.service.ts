import type { Transaction } from '../types/transaction'

export function calculateTransactionTotal(
  transactions: Transaction[],
): number {
  return transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  )
}

export function getFlaggedTransactions(
  transactions: Transaction[],
): Transaction[] {
  return transactions.filter(
    (transaction) => transaction.status === 'flagged',
  )
}
