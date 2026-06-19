import {
  Camera, BadgeCheck, Package, GraduationCap, ShieldCheck, FileCheck2, Lock,
  Sparkles, Gem, Search, Microscope, ScanLine, type LucideIcon,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  Camera, BadgeCheck, Package, GraduationCap, ShieldCheck, FileCheck2, Lock,
  Sparkles, Gem, Search, Microscope, ScanLine,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = map[name] ?? Gem
  return <Cmp className={className} />
}
