import React from "react"
import { ArrowRight } from "lucide-react"

export default function OurMission({ onGetStarted }) {
  return (
    <section id="about-mission" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative rounded-3xl overflow-hidden bg-[#0c1322] border border-white/10 shadow-2xl min-h-[220px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/banner-img.png')",
            backgroundPosition: "right center",
            backgroundSize: "contain",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1322] via-[#0c1322]/90 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
              OUR MISSION
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              A safer digital world <br className="hidden sm:inline" />
              for everyone.
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              We believe the internet should be a place of opportunity, not risk. ScamScan is built to empower individuals to make smarter, safer decisions online.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center w-full md:w-auto flex-shrink-0">
            <button
              onClick={onGetStarted}
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 py-3 rounded-full text-xs shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-[11px] text-slate-400 mt-2">
              Free to use. No account required.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
