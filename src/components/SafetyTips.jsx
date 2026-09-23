import React, { useState } from "react"
import {
  ShieldAlert,
  PhoneCall,
  Globe,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  X,
  PhoneForwarded,
} from "lucide-react"

export default function SafetyTips({ safeActions, result, originalContent }) {
  const [copied, setCopied] = useState(false)
  const [showHelplineModal, setShowHelplineModal] = useState(false)
  const [numberCopied, setNumberCopied] = useState(false)

  const handleCopyReport = () => {
    if (!result) return
    const textReport = `🚨 SCAMSCAN REPORT
Verdict: ${result.verdict} (Risk Score: ${result.score}/100)
Category: ${result.scam_type === "none" ? "Safe / Clean" : result.scam_type.replace("_", " ")}
Summary: ${result.summary}

Top Reasons:
${result.reasons.map((r) => `- ${r.title}: ${r.detail}`).join("\n")}

Recommended Actions:
${(safeActions || []).map((a, i) => `${i + 1}. ${a}`).join("\n")}

Official India Helplines:
- National Cyber Crime Helpline: 1930
- Official Portal: https://cybercrime.gov.in
- Report SMS Spam: 7726
- Telecom Fraud Portal: Sanchar Saathi Chakshu (sancharsaathi.gov.in)
`
    navigator.clipboard.writeText(textReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("1930")
    setNumberCopied(true)
    setTimeout(() => setNumberCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            What Should I Do Now?
          </h4>
        </div>

        <button
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Report Copied!" : "Copy Report for Family"}</span>
        </button>
      </div>

      <div className="space-y-2">
        {(safeActions || []).map((action, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] border border-blue-200 dark:border-blue-800">
              {idx + 1}
            </span>
            <span className="leading-relaxed mt-0.5">{action}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200/60 dark:border-white/5">
        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Official India Cybercrime Resources
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setShowHelplineModal(true)}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-800/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 hover:border-emerald-300 dark:border-white/10 dark:hover:border-emerald-600 text-left transition-all shadow-sm group"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Call 1930 Helpline</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">National Cyber Crime Reporting</div>
            </div>
          </button>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">cybercrime.gov.in</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">File an official police complaint</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-sm">
            <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Forward SMS to 7726</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Spam reporting on supported Indian carriers</div>
            </div>
          </div>

          <a
            href="https://sancharsaathi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Chakshu Portal</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Report suspect calls/SMS on Sanchar Saathi</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {showHelplineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200/80 dark:border-white/15 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowHelplineModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner flex-shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  National Cyber Crime Helpline
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Toll-Free • 24x7 India Citizen Support
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-center space-y-1.5">
              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Official Emergency Dial Number
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-wider font-mono">
                1930
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have lost money or entered credentials on a fraudulent page, call <strong>1930</strong> immediately. Reporting within the first 2 hours allows Indian cybercrime cells to freeze transactions and recover funds.
            </p>

            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyNumber}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-white/10"
                >
                  {numberCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{numberCopied ? "Copied 1930!" : "Copy 1930"}</span>
                </button>

                <a
                  href="tel:1930"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <PhoneForwarded className="w-4 h-4" />
                  <span>Dial 1930 Now</span>
                </a>
              </div>

              <button
                onClick={() => setShowHelplineModal(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
