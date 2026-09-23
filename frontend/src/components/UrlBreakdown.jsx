import React from "react"
import { ExternalLink, AlertCircle } from "lucide-react"

export default function UrlBreakdown({ urlAnalysis }) {
  if (!urlAnalysis) {
    return null
  }

  const { url, score, breakdown, signals } = urlAnalysis
  const isDangerous = score >= 60
  const isSuspicious = score >= 30 && score < 60
  const hasSuspiciousPart = Boolean(breakdown.suspicious_part)

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            URL Structure Breakdown
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              isDangerous
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : isSuspicious
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            }`}
          >
            Risk Score: {score}/100
          </span>
        </div>
      </div>

      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto whitespace-nowrap">
        <span className="text-slate-500">{breakdown.scheme}://</span>
        {breakdown.subdomain && (
          <span
            className={`text-purple-400 ${
              breakdown.suspicious_part === breakdown.subdomain
                ? "underline decoration-rose-500 decoration-2 font-bold"
                : ""
            }`}
            title="Subdomain"
          >
            {breakdown.subdomain}.
          </span>
        )}
        <span
          className={`text-cyan-300 ${
            breakdown.suspicious_part === breakdown.registered_domain ||
            breakdown.registered_domain?.includes(breakdown.suspicious_part)
              ? "underline decoration-rose-500 decoration-2 font-bold"
              : ""
          }`}
          title="Registered Domain"
        >
          {breakdown.registered_domain}
        </span>
        {breakdown.path && (
          <span className="text-emerald-400" title="Path">
            {breakdown.path}
          </span>
        )}
        {breakdown.query && (
          <span className="text-slate-400" title="Query String">
            ?{breakdown.query}
          </span>
        )}
      </div>

      {hasSuspiciousPart && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold">Suspicious component: </span>
            <span className="font-mono bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-200">
              {breakdown.suspicious_part}
            </span>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300 text-[11px]">{breakdown.reason}</p>
          </div>
        </div>
      )}

      {signals && signals.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Detected Link Signals
          </div>
          <div className="flex flex-wrap gap-1.5">
            {signals.map((sig, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium"
              >
                {sig.title} (+{sig.weight})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
