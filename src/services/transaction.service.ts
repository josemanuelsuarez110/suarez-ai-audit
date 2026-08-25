import { supabase } from '../lib/supabase'

export type TransactionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'flagged'
  | 'reviewed'

export interface Transaction {
  id: string
  transactionCode: string
  auditId: string | null
  organizationId: string | null
  transactionDate: string
  reference: string
  description: string
  accountCode: string
  counterparty: string
  amount: number
  currency: string
  status: TransactionStatus
  anomalyScore: number | null
  isAnomaly: boolean
  aiExplanation: string
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  auditId?: string | null
  organizationId?: string | null
  transactionDate: string
  reference?: string
  description: string
  accountCode?: string
  counterparty?: string
  amount: number
  currency?: string
  status?: TransactionStatus
}

export interface UpdateTransactionInput {
  id: string
  auditId?: string | null
  organizationId?: string | null
  transactionDate?: string
  reference?: string
  description?: string
  accountCode?: string
  counterparty?: string
  amount?: number
  currency?: string
  status?: TransactionStatus
  anomalyScore?: number | null
  isAnomaly?: boolean
  aiExplanation?: string
  reviewedBy?: string | null
  reviewedAt?: string | null
}

interface TransactionRow {
  id: string
  transaction_code: string
  audit_id: string | null
  organization_id: string | null
  transaction_date: string
  reference: string | null
  description: string | null
  account_code: string | null
  counterparty: string | null
  amount: number | string
  currency: string
  status: TransactionStatus
  anomaly_score: number | string | null
  is_anomaly: boolean
  ai_explanation: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

function mapTransaction(
  row: TransactionRow
): Transaction {
  return {
    id: row.id,
    transactionCode: row.transaction_code,
    auditId: row.audit_id,
    organizationId: row.organization_id,
    transactionDate: row.transaction_date,
    reference: row.reference ?? '',
    description: row.description ?? '',
    accountCode: row.account_code ?? '',
    counterparty: row.counterparty ?? '',
    amount: Number(row.amount),
    currency: row.currency.trim(),
    status: row.status,
    anomalyScore:
      row.anomaly_score === null
        ? null
        : Number(row.anomaly_score),
    isAnomaly: row.is_anomaly,
    aiExplanation: row.ai_explanation ?? '',
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getTransactions():
Promise<Transaction[]> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return ((data ?? []) as TransactionRow[])
    .map(mapTransaction)
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const payload = {
    transaction_code: '',
    audit_id: input.auditId || null,
    organization_id: input.organizationId || null,
    transaction_date: input.transactionDate,
    reference: input.reference?.trim() || null,
    description: input.description.trim(),
    account_code: input.accountCode?.trim() || null,
    counterparty: input.counterparty?.trim() || null,
    amount: input.amount,
    currency: input.currency ?? 'DOP',
    status: input.status ?? 'pending',
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  }

  return mapTransaction(data as TransactionRow)
}

export async function updateTransaction(
  input: UpdateTransactionInput
): Promise<Transaction> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.auditId !== undefined)
    payload.audit_id = input.auditId

  if (input.organizationId !== undefined)
    payload.organization_id = input.organizationId

  if (input.transactionDate !== undefined)
    payload.transaction_date = input.transactionDate

  if (input.reference !== undefined)
    payload.reference = input.reference.trim() || null

  if (input.description !== undefined)
    payload.description = input.description.trim()

  if (input.accountCode !== undefined)
    payload.account_code =
      input.accountCode.trim() || null

  if (input.counterparty !== undefined)
    payload.counterparty =
      input.counterparty.trim() || null

  if (input.amount !== undefined)
    payload.amount = input.amount

  if (input.currency !== undefined)
    payload.currency = input.currency

  if (input.status !== undefined)
    payload.status = input.status

  if (input.anomalyScore !== undefined)
    payload.anomaly_score = input.anomalyScore

  if (input.isAnomaly !== undefined)
    payload.is_anomaly = input.isAnomaly

  if (input.aiExplanation !== undefined)
    payload.ai_explanation =
      input.aiExplanation.trim() || null

  if (input.reviewedBy !== undefined)
    payload.reviewed_by = input.reviewedBy

  if (input.reviewedAt !== undefined)
    payload.reviewed_at = input.reviewedAt

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  }

  return mapTransaction(data as TransactionRow)
}

export async function deleteTransaction(
  id: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function markTransactionReviewed(
  id: string,
  userId: string
): Promise<Transaction> {
  return updateTransaction({
    id,
    status: 'reviewed',
    reviewedBy: userId,
    reviewedAt: new Date().toISOString(),
  })
}

export function getTransactionTotal(
  transactions: Transaction[]
): number {
  return transactions.reduce(
    (total, transaction) =>
      total + transaction.amount,
    0
  )
}

export function getFlaggedTransactions(
  transactions: Transaction[]
): Transaction[] {
  return transactions.filter(
    (transaction) =>
      transaction.isAnomaly ||
      transaction.status === 'flagged'
  )
}

export async function flagTransaction(
  id: string
): Promise<Transaction> {
  return updateTransaction({
    id,
    status: 'flagged',
    isAnomaly: true,
  })
}

export async function approveTransaction(
  id: string,
  _userId: string,
  comment?: string
): Promise<Transaction> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase.rpc(
    'finalize_transaction_review',
    {
      p_transaction_id: id,
      p_decision: 'approved',
      p_comment: comment?.trim() || null,
    }
  )

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  }

  return mapTransaction(
    data as TransactionRow
  )
}

export async function rejectTransaction(
  id: string,
  _userId: string,
  comment: string
): Promise<Transaction> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const normalizedComment = comment.trim()

  if (!normalizedComment) {
    throw new Error(
      'El motivo del rechazo es obligatorio.'
    )
  }

  const { data, error } = await supabase.rpc(
    'finalize_transaction_review',
    {
      p_transaction_id: id,
      p_decision: 'rejected',
      p_comment: normalizedComment,
    }
  )

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  }

  return mapTransaction(
    data as TransactionRow
  )
}

export function getPendingAlerts(
  transactions: Transaction[]
): Transaction[] {
  return transactions
    .filter(
      (transaction) =>
        transaction.status === 'flagged' ||
        transaction.status === 'reviewed'
    )
    .sort(
      (a, b) =>
        (b.anomalyScore ?? 0) -
        (a.anomalyScore ?? 0)
    )
}


export interface TransactionReview {
  id: string
  transactionId: string
  fromStatus: TransactionStatus | null
  toStatus: TransactionStatus
  reviewedBy: string | null
  comment: string
  createdAt: string
}

interface TransactionReviewRow {
  id: string
  transaction_id: string
  from_status: TransactionStatus | null
  to_status: TransactionStatus
  reviewed_by: string | null
  comment: string | null
  created_at: string
}

export async function getTransactionReviews(
  transactionId: string
): Promise<TransactionReview[]> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('transaction_reviews')
    .select(
      'id, transaction_id, from_status, to_status, reviewed_by, comment, created_at'
    )
    .eq('transaction_id', transactionId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw new Error(
      [
        error.code,
        error.message,
        error.details,
        error.hint,
      ]
        .filter(Boolean)
        .join(' | ')
    )
  }

  return (
    (data ?? []) as TransactionReviewRow[]
  ).map((row) => ({
    id: row.id,
    transactionId: row.transaction_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    reviewedBy: row.reviewed_by,
    comment: row.comment ?? '',
    createdAt: row.created_at,
  }))
}
