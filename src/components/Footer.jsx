import React, { useState } from "react"
import { createPortal } from "react-dom"
import { Shield, Github, Linkedin, PhoneCall, Copy, Check, ExternalLink, X } from "lucide-react"

export default function Footer({ setActivePage }) {
  const [showHelplineModal, setShowHelplineModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText("1930")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToSection = (id) => {
    setActivePage("scanner")
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }, 50)
  }

  return (
    <footer className="mt-20 border-t border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-[#070b14]/70 backdrop-blur-md pt-12 pb-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <img
              src="/logo.png"
              alt="ScamScan"
              className="h-8 w-auto object-contain dark:invert dark:hue-rotate-180 transition-all"
            />
            <div className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">
              Detect. Prevent. Stay Safe.
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => {
                setActivePage("scanner")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("scanner-card")}
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              Scan
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => setActivePage("learn")}
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              Resources
            </button>
            <button
              onClick={() => scrollToSection("about-mission")}
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Just-Roshann/ScamScan"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/roshansajnani-26-02-08-1166-seltos/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-500">
          <div>
            &copy; 2026 ScamScan. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              Terms
            </span>
            <button
              onClick={() => setShowHelplineModal(true)}
              className="hover:text-blue-600 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-emerald-500" />
              <span>Cyber Helpline 1930</span>
            </button>
          </div>

          <div className="text-[10px] tracking-wider uppercase text-slate-400/80">
            SAFER PEOPLE. BRIGHTER TOMORROWS. —
          </div>
        </div>
      </div>

      {showHelplineModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowHelplineModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">National Cyber Helpline</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Citizen Financial Cyber Fraud Reporting</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Toll-Free Helpline</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">1930</div>
              </div>
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dial 1930 immediately in case of online banking, UPI, or financial fraud to request rapid fund freeze and transaction interception.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Visit cybercrime.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowHelplineModal(false)}
                className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </footer>
  )
}
