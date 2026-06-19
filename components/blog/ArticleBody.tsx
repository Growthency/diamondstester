import { cn } from '@/lib/utils'

/**
 * Renders sanitized article HTML. Tailwind's typography plugin isn't installed,
 * so every element is styled here with arbitrary-variant selectors. The HTML is
 * produced and sanitized server-side by `renderMarkdown` (lib/markdown.ts).
 */
export function ArticleBody({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-none text-[1.0625rem] leading-relaxed',
        // Headings
        '[&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-platinum [&_h2]:mt-12 [&_h2]:mb-4 sm:[&_h2]:text-3xl',
        '[&_h3]:scroll-mt-28 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-platinum [&_h3]:mt-9 [&_h3]:mb-3',
        '[&_h4]:font-display [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-platinum [&_h4]:mt-7 [&_h4]:mb-2',
        // Paragraphs & inline
        '[&_p]:my-5 [&_p]:text-platinum-muted [&_p]:leading-[1.8]',
        '[&_strong]:font-semibold [&_strong]:text-platinum',
        '[&_em]:italic',
        '[&_a]:font-medium [&_a]:text-brilliant-cyan [&_a]:underline [&_a]:decoration-brilliant-cyan/30 [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-brilliant-cyan',
        // Lists
        '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-platinum-muted [&_ul]:marker:text-brilliant-cyan',
        '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-platinum-muted [&_ol]:marker:text-brilliant-cyan',
        '[&_li]:leading-relaxed [&_li]:pl-1.5',
        '[&_li>ul]:my-2 [&_li>ol]:my-2',
        // Blockquote
        '[&_blockquote]:my-7 [&_blockquote]:border-l-2 [&_blockquote]:border-brilliant-cyan [&_blockquote]:bg-brilliant-soft/40 [&_blockquote]:py-2 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:text-platinum',
        '[&_blockquote_p]:my-1 [&_blockquote_p]:text-platinum',
        // Code
        '[&_code]:rounded-md [&_code]:bg-ink-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-brilliant-cyan',
        '[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-ink-soft [&_pre]:p-4 [&_pre]:text-sm',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-platinum-muted',
        // Rule
        '[&_hr]:my-10 [&_hr]:border-border',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
