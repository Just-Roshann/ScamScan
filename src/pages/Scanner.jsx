import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Lock,
  Sparkles,
  Layers,
  MessageSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Eye,
  Link2,
  Users,
  BarChart3,
  FileText,
} from "lucide-react"
import InputTabs from "../components/InputTabs"
import RiskGauge from "../components/RiskGauge"
import HighlightedText from "../components/HighlightedText"
import ReasonCard from "../components/ReasonCard"
import UrlBreakdown from "../components/UrlBreakdown"
import SafetyTips from "../components/SafetyTips"
import SeeInAction from "../components/SeeInAction"
import OurMission from "../components/OurMission"
import { analyzeContent, fetchSamples } from "../api"

export default function Scanner({ setActivePage }) {
  const [activeTab, setActiveTab] = useState("url")
  const [content, setContent] = useState("")
  const [samples, setSamples] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchSamples()
      .then((data) => setSamples(data))
      .catch(() => {})
  }, [])

  const handleSelectSample = (sampleId) => {
    const selected = samples.find((s) => s.id === sampleId)
    if (selected) {
      const tabType = selected.type === "website" ? "url" : selected.type === "message" ? "text" : selected.type
      setActiveTab(tabType)
      setContent(selected.content)
      setErrorMessage("")
    }
  }

  const handleAnalyze = async (overrideContent, overrideTab) => {
    const textToAnalyze = (typeof overrideContent === "string" ? overrideContent : content).trim()
    if (!textToAnalyze) return
    setIsLoading(true)
    setErrorMessage("")
    try {
      let currentTab = overrideTab || activeTab
      if (currentTab === "url" && (textToAnalyze.includes(" ") || (!textToAnalyze.includes(".") && !textToAnalyze.startsWith("http")))) {
        currentTab = "text"
        setActiveTab("text")
      }
      const isEmail = currentTab === "file" && (textToAnalyze.includes("From:") || textToAnalyze.includes("Subject:") || textToAnalyze.includes("Received:"))
      const backendType = currentTab === "text" ? "message" : currentTab === "image" ? "message" : currentTab === "file" ? (isEmail ? "email" : "message") : "url"
      const response = await analyzeContent({ type: backendType, content: textToAnalyze })
      setResult(response)
      setTimeout(() => {
        const resultsEl = document.getElementById("results-panel")
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } catch (err) {
      setErrorMessage(err.message || "Failed to analyze content.")
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToScanner = () => {
    const el = document.getElementById("scanner-card")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-20">
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-20 overflow-hidden border-b border-slate-200/50 dark:border-white/5">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-right md:bg-center pointer-events-none opacity-95 dark:opacity-40"
          style={{
            backgroundImage: "url('/bg-img.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/75 via-slate-50/35 to-transparent dark:from-[#0b0f1a]/90 dark:via-[#0b0f1a]/50 dark:to-transparent pointer-events-none" />

        <div className="absolute top-14 right-8 lg:right-16 hidden lg:flex flex-col items-end text-right pointer-events-none select-none text-[12px] tracking-[0.26em] font-bold text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] leading-relaxed font-mono">
          <span>SAME</span>
          <span>CLICK.</span>
          <span>A SAFER</span>
          <span>YOU.</span>
          <span className="my-2.5 text-cyan-300 font-black">—</span>
          <span>CLEANER</span>
          <span>INTERNET.</span>
          <span>BRIGHTER</span>
          <span>TOMORROWS.</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-7">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>TRUSTED BY A SAFER INTERNET</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Scan Smarter. <br />
              Stay <span className="text-blue-600 dark:text-cyan-400">Safer.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-medium">
              Detect scams, phishing links, and malicious content instantly. Because a safer internet starts with you.
            </p>

            <div className="flex items-center gap-6 text-xs text-slate-700 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 fill-current" /> Fast
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> Private
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> AI-Powered
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col items-center pt-2">
            <InputTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              content={content}
              setContent={setContent}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              samples={samples}
              onSelectSample={handleSelectSample}
            />

            {errorMessage && (
              <div className="w-full max-w-2xl mt-4 p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="w-full max-w-7xl mx-auto pt-2">
            <div className="rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.85)] p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/50 dark:divide-white/10">
              <div className="flex items-center gap-4 pt-2 md:pt-0 md:px-4">
                <div className="w-10 h-10 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 flex-shrink-0 shadow-xs">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">14,250+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Links Scanned</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 md:pt-0 md:px-4">
                <div className="w-10 h-10 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 flex-shrink-0 shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">1,820+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Threats Detected</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 md:pt-0 md:px-4">
                <div className="w-10 h-10 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 flex-shrink-0 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">3,850+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Users Protected</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 md:pt-0 md:px-4">
                <div className="w-10 h-10 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">99.4%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Detection Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {result && (
          <motion.section
            id="results-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6"
          >
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-white/10 pb-6 md:pb-0 md:pr-6">
                  <RiskGauge score={result.score} verdict={result.verdict} />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                      Category: {result.scam_type === "none" ? "Safe / Clean" : result.scam_type.replace("_", " ")}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                      {result.elapsed_ms}ms
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {result.ai_used ? "Hybrid AI + Rules" : "Rule Engine Only"}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {result.summary}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Evaluated by transparent deterministic heuristics (urgency, lookalike domains, credentials, sender headers)
                    {result.ai_used ? " and contextualized by fast Groq AI intelligence." : "."}
                  </p>
                </div>
              </div>
            </div>

            {result.highlights && result.highlights.length > 0 && (
              <HighlightedText content={content} highlights={result.highlights} />
            )}

            {result.urls && result.urls.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  Extracted Links & Static Analysis
                </h4>
                {result.urls.map((urlItem, idx) => (
                  <UrlBreakdown key={idx} urlAnalysis={urlItem} />
                ))}
              </div>
            )}

            {result.reasons && result.reasons.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  Detected Warning Indicators ({result.reasons.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.reasons.map((reason, idx) => (
                    <ReasonCard key={idx} reason={reason} />
                  ))}
                </div>
              </div>
            )}

            <SafetyTips
              safeActions={result.safe_actions}
              result={result}
              originalContent={content}
            />
          </motion.section>
        )}
      </AnimatePresence>


      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1 rounded-md inline-block">
              WHY SCAMSCAN
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              More than a scanner. <br />
              A <span className="text-blue-600 dark:text-cyan-400">safer</span> you.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
              ScamScan combines advanced AI and global threat intelligence to help you detect and avoid online scams — before it's too late.
            </p>

            <button
              onClick={() => {
                if (setActivePage) {
                  setActivePage("learn")
                }
              }}
              className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 px-6 py-3 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-md transition-all group"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3 relative group hover:border-blue-400 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Analysis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Detect threats instantly using advanced AI.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3 relative group hover:border-blue-400 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multiple Input Types</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Scan URLs, files, text and images.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3 relative group hover:border-blue-400 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear Explanations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Get easy-to-understand results, not just labels.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3 relative group hover:border-blue-400 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy First</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your data is never stored or shared.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1 rounded-md inline-block">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Simple. Fast. Effective.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-4 hover:border-blue-400/60 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-cyan-400 font-black flex items-center justify-center text-base flex-shrink-0 shadow-xs">
              1
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enter or Upload</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Paste a link or upload a file, image or text.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-4 hover:border-blue-400/60 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-cyan-400 font-black flex items-center justify-center text-base flex-shrink-0 shadow-xs">
              2
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">We Analyze</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Our AI and threat intelligence scan for malicious patterns.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-4 hover:border-blue-400/60 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-cyan-400 font-black flex items-center justify-center text-base flex-shrink-0 shadow-xs">
              3
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Get Results</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                See a clear verdict with detailed information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SeeInAction />

      <OurMission onGetStarted={scrollToScanner} />
    </div>
  )
}
