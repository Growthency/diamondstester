import { AuroraBackground } from '@/components/layout/AuroraBackground'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/widgets/ScrollProgress'
import { FloatingWidgets } from '@/components/widgets/FloatingWidgets'
import { HashScroll } from '@/components/widgets/HashScroll'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraBackground />
      <ScrollProgress />
      <HashScroll />
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <FloatingWidgets />
    </>
  )
}
