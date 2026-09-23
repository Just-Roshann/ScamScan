import React from "react"
import { motion } from "framer-motion"

export default function RiskGauge({ score = 0, verdict = "Looks Safe" }) {
  const normalizedScore = Math.min(100, Math.max(0, score))
  const radius = 80
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  let strokeColor = "#10b981"
  let bgGlow = "rgba(16, 185, 129, 0.15)"
  let badgeBorder = "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"

  if (normalizedScore >= 60 || verdict === "Dangerous") {
    strokeColor = "#ef4444"
    bgGlow = "rgba(239, 68, 68, 0.2)"
    badgeBorder = "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300"
  } else if (normalizedScore >= 30 || verdict === "Suspicious") {
    strokeColor = "#f59e0b"
    bgGlow = "rgba(245, 158, 11, 0.15)"
    badgeBorder = "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-44 h-44 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
          style={{ background: bgGlow }}
        />
        <svg className="w-56 h-36" viewBox="0 0 200 120">
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <motion.path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        <div className="absolute top-14 flex flex-col items-center">
          <motion.span
            className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {normalizedScore}
          </motion.span>
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            / 100 Risk Score
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`mt-2 px-4 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${badgeBorder}`}
      >
        {verdict}
      </motion.div>
    </div>
  )
}
