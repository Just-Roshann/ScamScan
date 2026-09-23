import React, { useState } from "react"
import { Shield, Sun, Moon, ArrowRight, Menu, X } from "lucide-react"

export default function Navbar({
  activePage,
  setActivePage,
  isDarkMode,
  setIsDarkMode,
  onStartScanning,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id) => {
    setActivePage("scanner")
    setMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }, 50)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0b0f1a]/80 border-b border-slate-200/70 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div
          onClick={() => {
            setActivePage("scanner")
            setMobileMenuOpen(false)
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          className="flex items-center gap-2 cursor-pointer group py-1"
        >
          <img
            src="/logo.png"
            alt="ScamScan"
            className="h-8 w-auto object-contain dark:invert dark:hue-rotate-180 transition-all group-hover:scale-[1.02]"
          />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => {
              setActivePage("scanner")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`text-xs font-semibold tracking-wide transition-all relative py-1 ${
              activePage === "scanner"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Home
            {activePage === "scanner" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              if (onStartScanning) {
                onStartScanning()
              } else {
                scrollToSection("scanner-card")
              }
            }}
            className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Scan
          </button>

          <button
            onClick={() => scrollToSection("features")}
            className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Features
          </button>

          <button
            onClick={() => setActivePage("learn")}
            className={`text-xs font-semibold tracking-wide transition-all relative py-1 ${
              activePage === "learn"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Resources
            {activePage === "learn" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActivePage("history")}
            className={`text-xs font-semibold tracking-wide transition-all relative py-1 ${
              activePage === "history"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            History
            {activePage === "history" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => scrollToSection("about-mission")}
            className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={() => {
              if (onStartScanning) {
                onStartScanning()
              } else {
                scrollToSection("scanner-card")
              }
            }}
            className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 text-white rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all group"
          >
            <span>Start Scanning</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ml-0.5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0b0f1a]/95 backdrop-blur-2xl px-4 py-3 space-y-1">
          <button
            onClick={() => {
              setActivePage("scanner")
              setMobileMenuOpen(false)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activePage === "scanner"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              if (onStartScanning) {
                onStartScanning()
              } else {
                scrollToSection("scanner-card")
              }
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Scan
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              scrollToSection("features")
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => {
              setActivePage("learn")
              setMobileMenuOpen(false)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activePage === "learn"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => {
              setActivePage("history")
              setMobileMenuOpen(false)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activePage === "history"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            History
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              scrollToSection("about-mission")
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            About
          </button>
        </div>
      )}
    </header>
  )
}
