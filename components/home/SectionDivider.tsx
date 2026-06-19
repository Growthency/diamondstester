/** Soft "akabaka" (wavy) divider between sections — pure CSS/SVG, no images. */
export function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none -my-px w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-[60px] w-full sm:h-[90px]">
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--brilliant-cyan))" stopOpacity="0.12" />
            <stop offset="50%" stopColor="hsl(var(--brilliant-indigo))" stopOpacity="0.14" />
            <stop offset="100%" stopColor="hsl(var(--brilliant-violet))" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          d="M0,64 C240,112 480,16 720,48 C960,80 1200,128 1440,72 L1440,120 L0,120 Z"
          fill="url(#wave-grad)"
        />
        <path
          d="M0,80 C320,32 560,120 840,80 C1120,40 1280,96 1440,64"
          fill="none"
          stroke="hsl(var(--brilliant-indigo))"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
