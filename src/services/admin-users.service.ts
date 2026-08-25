import { supabase } from '../lib/supabase'

export type AppUserRole = 'admin' | 'auditor' | 'viewer'

export interface AdminUser {
  id: string
  email: string
  role: AppUserRole
  createdAt: string
  lastSignInAt: string | null
}

async function getAccessToken(): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  if (!session?.access_token) {
    throw new Error(
      'No existe una sesión autenticada. Cierra sesión y vuelve a iniciar.'
    )
  }

  return session.access_token
}

async function parseFunctionError(
  error: unknown
): Promise<Error> {
  if (
    error &&
    typeof error === 'object' &&
    'context' in error
  ) {
    try {
      const context = (
        error as {
          context?: Response
        }
      ).context

      if (context) {
        const status = context.status

        const body = await context
          .clone()
          .text()

        return new Error(
          `Edge Function ${status}: ${body || 'Sin detalle'}`
        )
      }
    } catch {
      // continuar con mensaje genérico
    }
  }

  if (error instanceof Error) {
    return error
  }

  return new Error(
    'Error desconocido invocando Edge Function.'
  )
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const token = await getAccessToken()

  const { data, error } =
    await supabase.functions.invoke(
      'smooth-function',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

  if (error) {
    throw await parseFunctionError(error)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return (data?.users ?? []) as AdminUser[]
}

export async function changeUserRole(
  userId: string,
  role: AppUserRole
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const token = await getAccessToken()

  const { data, error } =
    await supabase.functions.invoke(
      'swift-task',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          userId,
          role,
        },
      }
    )

  if (error) {
    throw await parseFunctionError(error)
  }

  if (data?.error) {
    throw new Error(data.error)
  }
}
