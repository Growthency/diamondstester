"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Heading4,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Minus,
  Upload,
  Undo2,
  Redo2,
  Pilcrow,
  Table as TableIcon,
  FileCode2,
  Eye,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { RichEditorProps } from "./types"

const IMG_STYLE = "max-width:100%;height:auto;border-radius:8px;margin:16px 0;"

export default function RichEditor({
  value,
  onChange,
  resetKey,
  onUploadImage,
  className,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  const savedSelectionRef = useRef<Range | null>(null)

  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual")
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  // Keep the latest onChange without re-binding effects.
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Seed the contentEditable DOM on mount and whenever resetKey changes.
  // We deliberately DO NOT re-seed on every `value` change — that would reset
  // the caret on each keystroke. External callers bump `resetKey` when they
  // mutate `value` out-of-band and want the editor to reflect it.
  useEffect(() => {
    if (typeof document === "undefined") return
    if (viewMode !== "visual") return
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== (value ?? "")) {
      el.innerHTML = value ?? ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, viewMode])

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML)
    }
  }, [])

  const saveSelection = useCallback(() => {
    if (typeof window === "undefined") return
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange()
      }
    }
  }, [])

  const restoreSelection = useCallback(() => {
    if (typeof window === "undefined") return
    const sel = window.getSelection()
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }, [])

  const detectFormats = useCallback(() => {
    if (typeof document === "undefined") return
    const formats = new Set<string>()
    if (document.queryCommandState("bold")) formats.add("bold")
    if (document.queryCommandState("italic")) formats.add("italic")
    if (document.queryCommandState("underline")) formats.add("underline")
    if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough")
    if (document.queryCommandState("insertUnorderedList")) formats.add("insertUnorderedList")
    if (document.queryCommandState("insertOrderedList")) formats.add("insertOrderedList")
    const block = document.queryCommandValue("formatBlock")
    if (block) formats.add(block.toLowerCase())
    setActiveFormats(formats)
  }, [])

  const exec = useCallback(
    (command: string, val?: string) => {
      if (typeof document === "undefined") return
      editorRef.current?.focus()
      document.execCommand(command, false, val)
      syncContent()
      detectFormats()
    },
    [syncContent, detectFormats],
  )

  const handleInput = useCallback(() => {
    syncContent()
    detectFormats()
  }, [syncContent, detectFormats])

  const handleKeyUp = useCallback(() => detectFormats(), [detectFormats])
  const handleMouseUp = useCallback(() => detectFormats(), [detectFormats])

  // ── Visual ⇄ HTML toggle ──
  const toggleViewMode = useCallback(() => {
    if (viewMode === "visual") {
      // Flush latest DOM into parent state before showing the textarea.
      if (editorRef.current) onChangeRef.current(editorRef.current.innerHTML)
      setViewMode("html")
    } else {
      // Re-enter visual: seed the contentEditable from the (possibly edited)
      // value once it's rendered again.
      setViewMode("visual")
      requestAnimationFrame(() => {
        if (editorRef.current) editorRef.current.innerHTML = value ?? ""
      })
    }
  }, [viewMode, value])

  // ── Block / heading helpers ──
  const toggleBlock = useCallback(
    (tag: string) => {
      if (typeof document === "undefined") return
      const current = document.queryCommandValue("formatBlock").toLowerCase()
      exec("formatBlock", current === tag ? "p" : tag)
    },
    [exec],
  )

  // ── Insert helpers ──
  const insertLink = useCallback(() => {
    saveSelection()
    const url = window.prompt("Enter the URL for the link:")
    if (!url) return
    editorRef.current?.focus()
    restoreSelection()
    exec("createLink", url)
  }, [exec, saveSelection, restoreSelection])

  const insertImageUrl = useCallback(() => {
    saveSelection()
    const url = window.prompt("Enter the image URL:")
    if (!url) return
    const alt = window.prompt("Alt text (for SEO & accessibility):") || "Article image"
    editorRef.current?.focus()
    restoreSelection()
    exec(
      "insertHTML",
      `<img src="${url}" alt="${alt.replace(/"/g, "&quot;")}" style="${IMG_STYLE}" />`,
    )
  }, [exec, saveSelection, restoreSelection])

  const insertHR = useCallback(() => exec("insertHTML", "<hr />"), [exec])

  const insertTable = useCallback(() => {
    saveSelection()
    const rowsRaw = window.prompt("Number of rows:", "3")
    if (!rowsRaw) return
    const colsRaw = window.prompt("Number of columns:", "3")
    if (!colsRaw) return
    const r = Math.max(1, parseInt(rowsRaw, 10) || 3)
    const c = Math.max(1, parseInt(colsRaw, 10) || 3)

    let html =
      '<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;"><thead><tr>'
    for (let j = 0; j < c; j++) {
      html +=
        '<th style="border:1px solid #334155;padding:8px 12px;text-align:left;background:#1e293b;color:#e2e8f0;font-weight:600;">Header</th>'
    }
    html += "</tr></thead><tbody>"
    for (let i = 0; i < r - 1; i++) {
      html += "<tr>"
      for (let j = 0; j < c; j++) {
        html +=
          '<td style="border:1px solid #334155;padding:8px 12px;color:#cbd5e1;">Cell</td>'
      }
      html += "</tr>"
    }
    html += "</tbody></table></div><p><br /></p>"

    editorRef.current?.focus()
    restoreSelection()
    exec("insertHTML", html)
  }, [exec, saveSelection, restoreSelection])

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const alt =
        window.prompt(
          "Alt text for this image (for SEO & accessibility):",
          file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        ) || file.name

      setUploading(true)
      try {
        let url: string | null = null
        if (onUploadImage) {
          url = await onUploadImage(file)
        } else {
          const formData = new FormData()
          formData.append("file", file)
          const res = await fetch("/api/admin/media", { method: "POST", body: formData })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "Upload failed")
          url = data.url
        }
        if (!url) throw new Error("Upload failed")

        const imgHtml = `<img src="${url}" alt="${alt.replace(/"/g, "&quot;")}" style="${IMG_STYLE}" /><p><br /></p>`
        editorRef.current?.focus()
        restoreSelection()
        const ok = document.execCommand("insertHTML", false, imgHtml)
        if (!ok && editorRef.current) editorRef.current.innerHTML += imgHtml
        syncContent()
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    },
    [onUploadImage, restoreSelection, syncContent],
  )

  const isActive = (fmt: string) => activeFormats.has(fmt)

  // ── Toolbar primitives ──
  const ToolBtn = ({
    onClick,
    title,
    children,
    active,
  }: {
    onClick: () => void
    title: string
    children: React.ReactNode
    active?: boolean
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        saveSelection()
        onClick()
      }}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors hover:bg-secondary/60",
        active
          ? "bg-brilliant/15 text-brilliant-cyan ring-1 ring-brilliant/30"
          : "text-platinum-muted hover:text-platinum",
      )}
    >
      {children}
    </button>
  )

  const ToolDivider = () => <div className="mx-1 h-6 w-px bg-border" />

  return (
    <div
      className={cn(
        "relative max-h-[75vh] overflow-y-auto rounded-xl border border-border bg-card",
        className,
      )}
    >
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-border bg-ink/80 px-3 py-2 backdrop-blur">
        {/* Formatting controls — inert in HTML mode (they act on contentEditable). */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-0.5",
            viewMode === "html" && "pointer-events-none opacity-40",
          )}
        >
          <ToolBtn onClick={() => exec("undo")} title="Undo">
            <Undo2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => exec("redo")} title="Redo">
            <Redo2 className="h-4 w-4" />
          </ToolBtn>

          <ToolDivider />

          <ToolBtn onClick={() => toggleBlock("h2")} title="Heading 2" active={isActive("h2")}>
            <Heading2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => toggleBlock("h3")} title="Heading 3" active={isActive("h3")}>
            <Heading3 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => toggleBlock("h4")} title="Heading 4" active={isActive("h4")}>
            <Heading4 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => exec("formatBlock", "p")} title="Paragraph" active={isActive("p")}>
            <Pilcrow className="h-4 w-4" />
          </ToolBtn>

          <ToolDivider />

          <ToolBtn onClick={() => exec("bold")} title="Bold" active={isActive("bold")}>
            <Bold className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => exec("italic")} title="Italic" active={isActive("italic")}>
            <Italic className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => exec("underline")} title="Underline" active={isActive("underline")}>
            <Underline className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => exec("strikeThrough")}
            title="Strikethrough"
            active={isActive("strikeThrough")}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolBtn>

          <ToolDivider />

          <ToolBtn
            onClick={() => exec("insertUnorderedList")}
            title="Bullet List"
            active={isActive("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => exec("insertOrderedList")}
            title="Numbered List"
            active={isActive("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolBtn>

          <ToolDivider />

          <ToolBtn onClick={() => exec("justifyLeft")} title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => exec("justifyCenter")} title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => exec("justifyRight")} title="Align Right">
            <AlignRight className="h-4 w-4" />
          </ToolBtn>

          <ToolDivider />

          <ToolBtn
            onClick={() => toggleBlock("blockquote")}
            title="Quote"
            active={isActive("blockquote")}
          >
            <Quote className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={() => toggleBlock("pre")} title="Code Block" active={isActive("pre")}>
            <Code className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={insertHR} title="Horizontal Line">
            <Minus className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={insertTable} title="Insert Table">
            <TableIcon className="h-4 w-4" />
          </ToolBtn>

          <ToolDivider />

          <ToolBtn onClick={insertLink} title="Insert Link">
            <LinkIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn onClick={insertImageUrl} title="Image URL">
            <ImageIcon className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => {
              saveSelection()
              fileInputRef.current?.click()
            }}
            title="Upload Image"
          >
            {uploading ? (
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-brilliant-cyan border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </ToolBtn>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="flex-1" />

        {/* HTML / Visual toggle — far right */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            toggleViewMode()
          }}
          title={viewMode === "visual" ? "Switch to HTML view" : "Switch to Visual view"}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
            viewMode === "html"
              ? "bg-brilliant/15 text-brilliant-cyan ring-1 ring-brilliant/30"
              : "text-platinum-muted hover:bg-secondary/60 hover:text-platinum",
          )}
        >
          {viewMode === "visual" ? (
            <>
              <FileCode2 className="h-3.5 w-3.5" /> HTML
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Visual
            </>
          )}
        </button>
      </div>

      {/* HTML raw view */}
      {viewMode === "html" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{ tabSize: 2 }}
          className="min-h-[420px] w-full resize-y bg-ink px-6 py-5 font-mono text-xs leading-relaxed text-platinum-muted outline-none"
          placeholder="<!-- Paste or edit raw HTML here. Switch back to Visual to preview. -->"
        />
      )}

      {/* Visual editor — hidden (not unmounted) in HTML mode so the ref stays alive */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        hidden={viewMode === "html"}
        onInput={handleInput}
        onBlur={() => {
          saveSelection()
          syncContent()
        }}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        className="rich-content min-h-[420px] max-w-none px-6 py-5 text-sm leading-relaxed text-platinum outline-none"
      />

      <style jsx global>{`
        .rich-content :where(h1) {
          font-size: 1.6rem;
          font-weight: 700;
          color: hsl(var(--platinum));
          margin: 1.5rem 0 0.75rem;
        }
        .rich-content :where(h2) {
          font-size: 1.35rem;
          font-weight: 700;
          color: hsl(var(--platinum));
          margin: 1.25rem 0 0.5rem;
        }
        .rich-content :where(h3) {
          font-size: 1.15rem;
          font-weight: 600;
          color: hsl(var(--platinum));
          margin: 1rem 0 0.5rem;
        }
        .rich-content :where(h4) {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--platinum));
          margin: 0.75rem 0 0.5rem;
        }
        .rich-content :where(p) {
          margin: 0 0 0.75rem;
          line-height: 1.7;
        }
        .rich-content :where(ul) {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0 0 0.75rem;
        }
        .rich-content :where(ol) {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0 0 0.75rem;
        }
        .rich-content :where(li) {
          margin-bottom: 0.25rem;
        }
        .rich-content :where(a) {
          color: hsl(var(--brilliant-cyan));
          text-decoration: underline;
        }
        .rich-content :where(strong, b) {
          color: hsl(var(--platinum));
          font-weight: 700;
        }
        .rich-content :where(em, i) {
          font-style: italic;
        }
        .rich-content :where(blockquote) {
          border-left: 4px solid hsl(var(--brilliant-cyan));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--platinum-muted));
        }
        .rich-content :where(pre) {
          background: rgba(15, 23, 42, 0.6);
          color: hsl(var(--brilliant-cyan));
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.85rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .rich-content :where(code) {
          background: rgba(15, 23, 42, 0.6);
          color: hsl(var(--brilliant-cyan));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
        }
        .rich-content :where(pre) code {
          background: transparent;
          padding: 0;
        }
        .rich-content :where(hr) {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 1.5rem 0;
        }
        .rich-content :where(img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .rich-content :where(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .rich-content :where(th) {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-weight: 600;
          background: rgba(30, 41, 59, 0.6);
          color: hsl(var(--platinum));
        }
        .rich-content :where(td) {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem 0.75rem;
          color: hsl(var(--platinum-muted));
        }
        .rich-content:empty::before {
          content: "Start writing…";
          color: hsl(var(--platinum-muted));
          opacity: 0.6;
        }
      `}</style>
    </div>
  )
}
