import 'server-only'
import { cache } from 'react'
import { readSession, type SessionData } from './session'

/** Returns the session or null. Admin pages render the login screen on null. */
export const getOptionalSession = cache(async (): Promise<SessionData | null> => {
  return readSession()
})

export const isAuthed = cache(async (): Promise<boolean> => {
  return Boolean(await readSession())
})
