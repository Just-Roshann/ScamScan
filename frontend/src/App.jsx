import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Scanner from "./pages/Scanner"
import HistoryPage from "./pages/History"
import Learn from "./pages/Learn"

export default function App() {
  const [activePage, setActivePage] = useState("scanner")
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleStartScanning = () => {
    setActivePage("scanner")
    setTimeout(() => {
      const el = document.getElementById("scanner-card")
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }, 50)
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isDarkMode ? "bg-[#0b0f1a] text-slate-100" : "bg-[#f8fafc] text-slate-900"
    }`}>
      <div>
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onStartScanning={handleStartScanning}
        />
        <main>
          {activePage === "scanner" && <Scanner setActivePage={setActivePage} />}
          {activePage === "history" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <HistoryPage />
            </div>
          )}
          {activePage === "learn" && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <Learn />
            </div>
          )}
        </main>
      </div>
      <Footer setActivePage={setActivePage} />
    </div>
  )
}
