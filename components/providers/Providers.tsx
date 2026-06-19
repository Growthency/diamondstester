'use client'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(222 34% 13%)',
            border: '1px solid hsl(217 30% 17%)',
            color: 'hsl(216 47% 94%)',
          },
        }}
      />
    </>
  )
}
