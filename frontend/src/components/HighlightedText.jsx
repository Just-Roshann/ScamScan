import React from "react"

const CATEGORY_STYLES = {
  urgency: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40",
  threat: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40",
  credentials: "bg-red-100 text-red-900 border-red-300 dark:bg-red-500/25 dark:text-red-300 dark:border-red-500/50",
  money: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40",
  impersonation: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40",
  link: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40",
  technical: "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40",
  sender: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40",
  language: "bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40",
  general: "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600/40",
}

function buildTextSegments(content, highlights) {
  if (!highlights || highlights.length === 0) {
    return [{ text: content, isHighlight: false }]
  }

  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start)
  const segments = []
  let cursor = 0

  for (const hl of sortedHighlights) {
    if (hl.start < cursor) {
      continue
    }
    if (hl.start > cursor) {
      segments.push({
        text: content.slice(cursor, hl.start),
        isHighlight: false,
      })
    }
    segments.push({
      text: content.slice(hl.start, hl.end),
      isHighlight: true,
      category: hl.category,
    })
    cursor = hl.end
  }

  if (cursor < content.length) {
    segments.push({
      text: content.slice(cursor),
      isHighlight: false,
    })
  }

  return segments
}

export default function HighlightedText({ content, highlights }) {
  const segments = buildTextSegments(content || "", highlights || [])

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 dark:border-white/5 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Suspicious Text Highlights
        </h4>
        <span className="text-xs text-slate-500">
          Hover marked phrases to view trigger category
        </span>
      </div>

      <div className="font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
        {segments.map((seg, idx) => {
          if (!seg.isHighlight) {
            return <span key={idx}>{seg.text}</span>
          }
          const style = CATEGORY_STYLES[seg.category] || CATEGORY_STYLES.general
          return (
            <span
              key={idx}
              title={`Flagged category: ${seg.category}`}
              className={`px-1.5 py-0.5 rounded border text-xs font-semibold cursor-help transition-all ${style}`}
            >
              {seg.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
