import React, { useState } from "react"
import { AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, Lock, Link2 } from "lucide-react"

const DEMO_PREVIEWS = [
  {
    id: "iphone",
    label: "iPhone Giveaway",
    url: "https://free-iphone-giveaway.com",
    score: 92,
    verdict: "High Risk",
    title: "This website is likely a phishing site.",
    detail: "This website may be trying to steal your personal information such as passwords, credit card details or other sensitive data.",
    tags: ["Phishing", "Suspicious Domain", "High Risk"],
    threats: [
      "Phishing Indicators",
      "Suspicious Domain",
      "Fake Giveaway",
      "Low Trust Score",
    ],
  },
  {
    id: "sbi",
    label: "Fake SBI KYC",
    url: "http://sbi-kyc-verify.top/login",
    score: 96,
    verdict: "High Risk",
    title: "Critical credential harvester detected.",
    detail: "This site impersonates State Bank of India to steal netbanking passwords and OTP credentials via an unencrypted connection.",
    tags: ["Bank Impersonation", "Risky TLD", "Credential Theft"],
    threats: [
      "Bank Impersonation",
      "No HTTPS Security",
      "Lookalike Domain (.top)",
      "Requests OTP & Password",
    ],
  },
  {
    id: "amazon",
    label: "Amazon Official",
    url: "https://www.amazon.in",
    score: 8,
    verdict: "Looks Safe",
    title: "Verified genuine merchant domain.",
    detail: "Valid SSL certificate, registered to Amazon Technologies Inc., with strong DNS reputation and no impersonation heuristics.",
    tags: ["Legitimate", "Verified TLS", "Low Risk"],
    threats: [
      "Valid Domain Ownership",
      "Zero Blacklist Matches",
      "Standard HTTPS Encryption",
      "Verified Brand Identity",
    ],
  },
]

export default function SeeInAction() {
  const [selectedCase, setSelectedCase] = useState(DEMO_PREVIEWS[0])

  const circumference = 2 * Math.PI * 40
  const strokeOffset = circumference - (selectedCase.score / 100) * circumference
  const isSafe = selectedCase.score < 30
  const primaryColor = isSafe ? "#10b981" : "#ef4444"

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="rounded-3xl bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-white/5 px-2.5 py-1 rounded-md inline-block shadow-2xs">
            SEE IT IN ACTION
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Real Scans. <br />
            Real Protection.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Here's an example of how ScamScan analyzes a suspicious link and gives you a clear, easy-to-understand result.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {DEMO_PREVIEWS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedCase(item)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCase.id === item.id
                    ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                    : "bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="flex-1 ml-2">
                <div className="bg-slate-100/90 dark:bg-slate-800 rounded-full px-3 py-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <Link2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{selectedCase.url}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0 ml-1" />
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-center">
              <div
                className={`rounded-xl p-5 border ${
                  isSafe
                    ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100"
                    : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40 text-rose-950 dark:text-rose-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSafe ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    }`}
                  >
                    {isSafe ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1.5">
                    <h4
                      className={`text-sm font-bold ${
                        isSafe ? "text-emerald-900 dark:text-emerald-300" : "text-rose-900 dark:text-rose-300"
                      }`}
                    >
                      {selectedCase.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedCase.detail}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200/40 dark:border-white/10">
                  {selectedCase.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isSafe
                          ? "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/50"
                          : "bg-rose-100/60 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-300/50"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Risk Score
              </span>

              <div className="flex items-center gap-4 my-4">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={primaryColor}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono leading-none">
                      {selectedCase.score}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      /100
                    </span>
                  </div>
                </div>

                <div>
                  <div
                    className={`text-sm font-extrabold ${
                      isSafe ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {selectedCase.verdict}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    {isSafe
                      ? "Legitimate origin with verified trust indicators."
                      : "We strongly recommend avoiding this website."}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {isSafe ? "Verified Signals" : "Detected Threats"}
              </div>
              <div className="space-y-1.5">
                {selectedCase.threats.map((threat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isSafe ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    <span>{threat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
}
