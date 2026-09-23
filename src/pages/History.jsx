import React, { useState, useEffect } from "react"
import { History as HistoryIcon, BarChart3, RefreshCw, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react"
import { fetchHistory, fetchStats } from "../api"

function renderSimplePieChart(scamTypeCounts) {
  const entries = Object.entries(scamTypeCounts || {})
  const total = entries.reduce((acc, [, val]) => acc + val, 0)
  if (total === 0) return null

  const colors = ["#2563eb", "#ef4444", "#f59e0b", "#8b5cf6", "#10b981", "#ec4899", "#06b6d4"]
  let accumulatedAngle = 0
  const radius = 40
  const center = 50

  const slices = entries.map(([type, count], index) => {
    const fraction = count / total
    const sliceAngle = fraction * 2 * Math.PI
    const startX = center + radius * Math.cos(accumulatedAngle)
    const startY = center + radius * Math.sin(accumulatedAngle)
    accumulatedAngle += sliceAngle
    const endX = center + radius * Math.cos(accumulatedAngle)
    const endY = center + radius * Math.sin(accumulatedAngle)
    const largeArcFlag = fraction > 0.5 ? 1 : 0
    const pathData = `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`

    return {
      type,
      count,
      fraction,
      color: colors[index % colors.length],
      pathData,
    }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg className="w-32 h-32 flex-shrink-0" viewBox="0 0 100 100">
        {slices.map((slice, idx) => (
          <path key={idx} d={slice.pathData} fill={slice.color} stroke="transparent" strokeWidth="1" />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-2 text-xs w-full">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: slice.color }} />
            <span className="text-slate-600 dark:text-slate-300 truncate">
              {slice.type.replace("_", " ")}: <span className="text-slate-900 dark:text-white font-mono font-bold">{slice.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [historyData, statsData] = await Promise.all([fetchHistory(), fetchStats()])
      setHistoryItems(historyData)
      setStats(statsData)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
            <span>Scan History & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Privacy-preserving logs (only cryptographic hashes and first 120 chars stored).
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scans by Verdict
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Looks Safe
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.verdict_counts["Looks Safe"] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Suspicious
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.verdict_counts["Suspicious"] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Dangerous
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.verdict_counts["Dangerous"] || 0}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Total Scans Logged</span>
                <span className="font-mono text-blue-600 dark:text-cyan-400 text-sm">{stats.total_scans}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Scam Type Distribution
            </h4>
            {renderSimplePieChart(stats.scam_type_counts)}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Scans ({historyItems.length})
          </h4>
        </div>

        {historyItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No scans recorded yet. Go to the Scanner tab to run an analysis.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {historyItems.map((item) => {
              const isDanger = item.verdict === "Dangerous"
              const isSusp = item.verdict === "Suspicious"
              const badgeClass = isDanger
                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : isSusp
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"

              return (
                <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-300 font-mono">
                        {item.input_type}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-xs truncate">
                      "{item.content_preview}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      Score: {item.score}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                      {item.verdict}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
