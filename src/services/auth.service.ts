import { supabase } from '../lib/supabase'

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase no configurado')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data.user
}

export async function signOut() {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  if (!supabase) return null

  const { data } = await supabase.auth.getSession()
  return data.session
}
