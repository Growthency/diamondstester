'use server'

import { redirect } from 'next/navigation'
import { verifyCredentials } from '@/lib/auth/credentials'
import { createSession, deleteSession } from '@/lib/auth/session'

export interface LoginState {
  error?: string
  email?: string
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

  await createSession({ userId: 'admin', email })
  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect('/admin')
}
