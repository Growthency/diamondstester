'use server'

import { redirect } from 'next/navigation'
import { verifyCredentials } from '@/lib/auth/credentials'
import { createSession, deleteSession } from '@/lib/auth/session'

export interface LoginState {
  error?: string
  email?: string
  ok?: boolean
}

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter your email and password.', email }
  }

  if (!verifyCredentials(email, password)) {
    return { error: 'Invalid email or password.', email }
  }

  // Set the signed session cookie, then let the client navigate. (Calling
  // redirect() here throws NEXT_REDIRECT, which gets swallowed when the action
  // is awaited imperatively from the client — so the login appeared to do
  // nothing on success. Returning ok + client-side router.push is reliable.)
  await createSession({ userId: 'admin', email })
  return { ok: true }
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect('/admin')
}
