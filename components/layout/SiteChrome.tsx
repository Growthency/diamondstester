import { AuroraBackground } from '@/components/layout/AuroraBackground'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/widgets/ScrollProgress'
import { FloatingWidgets } from '@/components/widgets/FloatingWidgets'
import { HashScroll } from '@/components/widgets/HashScroll'
import { SiteSettingsHead } from '@/components/layout/SiteSettingsHead'

/** Shared public-site chrome (header, footer, background, widgets). Used by the
 *  (site) route-group layout and by the homepage at app/page.tsx. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteSettingsHead />
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
