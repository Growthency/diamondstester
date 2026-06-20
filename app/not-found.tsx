import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-indigo)/0.35),transparent_62%)] blur-2xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,hsl(var(--brilliant-violet)/0.25),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-grid opacity-[0.18] mask-fade-b" />
      </div>

      <div className="text-center">
        <div className="flex justify-center">
          <Logo className="scale-110" />
        </div>
        <p className="mt-10 font-display text-7xl font-extrabold leading-none text-gradient sm:text-8xl">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">This page slipped through the facets</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you back to something brilliant.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="sheen">
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/#tester">Test a diamond</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
