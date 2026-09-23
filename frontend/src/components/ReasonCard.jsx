import React from "react"
import {
  Clock,
  KeyRound,
  Coins,
  ShieldAlert,
  Link,
  Cpu,
  MailWarning,
  AlertTriangle,
  Sparkles,
} from "lucide-react"

function getCategoryIcon(category) {
  switch (category) {
    case "urgency":
      return Clock
    case "credentials":
      return KeyRound
    case "money":
      return Coins
    case "impersonation":
      return ShieldAlert
    case "link":
      return Link
    case "technical":
      return Cpu
    case "sender":
      return MailWarning
    case "ai":
      return Sparkles
    default:
      return AlertTriangle
  }
}

export default function ReasonCard({ reason }) {
  const Icon = getCategoryIcon(reason.category)
  const isAi = reason.source === "ai"

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between gap-3 hover:border-blue-400 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              {reason.title}
            </h5>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              {reason.category}
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isAi
              ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          }`}
        >
          {isAi ? "AI Engine" : "Rule Engine"}
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {reason.detail}
      </p>

      {reason.evidence && (
        <div className="mt-1">
          <div className="text-[11px] text-slate-700 dark:text-cyan-300 font-mono bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg break-words leading-relaxed select-text">
            <span className="text-slate-400 dark:text-slate-500 font-sans font-medium select-none mr-1.5">
              evidence:
            </span>
            <span className="font-semibold">"{reason.evidence}"</span>
          </div>
        </div>
      )}
    </div>
  )
}
