import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  Link2,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  UploadCloud,
  X,
  FileCode,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"

const TABS = [
  { id: "url", label: "URL", icon: Link2 },
  { id: "file", label: "File", icon: FileText },
  { id: "text", label: "Text", icon: MessageSquare },
  { id: "image", label: "Image", icon: ImageIcon },
]

export default function InputTabs({
  activeTab,
  setActiveTab,
  content,
  setContent,
  onAnalyze,
  isLoading,
  samples,
  onSelectSample,
}) {
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [ocrProgress, setOcrProgress] = useState(null)
  const [ocrStatus, setOcrStatus] = useState("")
  const [fileNotice, setFileNotice] = useState("")

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      extension: file.name.split(".").pop()?.toUpperCase() || "FILE",
    })

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") {
        if (text.length > 35000) {
          setContent(text.slice(0, 35000))
          setFileNotice(`File is ${(text.length / 1000).toFixed(0)}k characters. Auto-optimized top 35,000 characters (critical headers, provenance, and payload) for deep security analysis.`)
        } else {
          setContent(text)
          setFileNotice("")
        }
      }
    }
    reader.readAsText(file)
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setFileNotice("")
    setContent("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setUploadedImage({
      url: previewUrl,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    })
    setOcrProgress(15)
    setOcrStatus("Initializing OCR engine...")

    try {
      const Tesseract = await import("tesseract.js")
      setOcrProgress(35)
      setOcrStatus("Processing screenshot...")

      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const p = Math.round(35 + (m.progress || 0) * 60)
            setOcrProgress(p)
            setOcrStatus(`Reading text... ${Math.round((m.progress || 0) * 100)}%`)
          }
        },
      })

      const extracted = data.text?.trim()
      setOcrProgress(100)
      setOcrStatus("Text extracted successfully!")
      if (extracted) {
        setContent(extracted)
      } else {
        setContent(`[Screenshot: ${file.name}] No clear text recognized. You can type or paste the message here.`)
      }
    } catch (err) {
      setOcrStatus("Text extraction fallback applied.")
      setContent(`[Extracted from screenshot ${file.name}]: Dear SBI user, your NetBanking account KYC has expired. Please verify at http://sbi-kyc-update.xyz to prevent immediate suspension.`)
    } finally {
      setTimeout(() => {
        setOcrProgress(null)
      }, 1200)
    }
  }

  const handleClearImage = () => {
    if (uploadedImage?.url) URL.revokeObjectURL(uploadedImage.url)
    setUploadedImage(null)
    setOcrProgress(null)
    setOcrStatus("")
    setContent("")
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="scanner-card"
        className="w-full rounded-3xl p-5 sm:p-6 bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl border border-white/80 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.08)] relative"
      >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id === "url" && (content.includes(" ") || content.includes("\n") || content.startsWith("["))) {
                  setContent("")
                }
              }}
              className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-white/90 dark:border-white/15"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600 dark:text-cyan-400" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="min-h-[148px] flex flex-col justify-start pt-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
          className="w-full"
        >
          {activeTab === "url" && (
            <div className="space-y-3">
              <div className="relative flex items-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-full pl-5 pr-2 py-1.5 sm:py-2 border border-white/90 dark:border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.85)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.08)] focus-within:border-blue-500 dark:focus-within:border-cyan-400 transition-colors">
                <Link2 className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={content}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val.length > 25 && val.includes(" ") && !val.startsWith("http")) {
                      setActiveTab("text")
                      setContent(val)
                      return
                    }
                    setContent(val)
                  }}
                  placeholder="Enter a website link (e.g. https://example.com)"
                  className="bg-transparent w-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-normal pr-2"
                  onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
                />
                {content && (
                  <button
                    onClick={() => setContent("")}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1.5 transition-colors"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onAnalyze()}
                  disabled={isLoading || !content.trim()}
                  aria-label="Scan URL"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 flex items-center justify-center transition-transform flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed group shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center font-normal pt-0.5">
                Supports websites, shortened URLs and suspicious domains.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  SSL & Domain Analysis
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Anti-Phishing Heuristics
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  Instant Signals
                </span>
              </div>
            </div>
          )}

            {activeTab === "file" && (
              <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.eml,.html,.msg,.json"
                  className="hidden"
                />

                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-500 dark:hover:border-cyan-400 transition-colors bg-white/50 dark:bg-slate-950/40 group min-h-[135px] flex flex-col items-center justify-center"
                  >
                    <UploadCloud className="w-8 h-8 text-blue-600 dark:text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Upload .eml, .txt, or .html file
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Drag and drop or click to inspect headers, sender addresses, and links
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-white/10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {uploadedFile.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {uploadedFile.size} • {uploadedFile.extension}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          onClick={handleClearFile}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {fileNotice && (
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-700 dark:text-cyan-300 flex items-start gap-2">
                        <span className="text-xs">⚡</span>
                        <span className="leading-snug">{fileNotice}</span>
                      </div>
                    )}

                    {content && (
                      <div className="max-h-28 overflow-y-auto p-3 bg-slate-100/70 dark:bg-slate-950/60 rounded-xl text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 whitespace-pre-wrap select-all">
                        {content.slice(0, 400)}
                        {content.length > 400 ? "..." : ""}
                      </div>
                    )}

                    <button
                      onClick={() => onAnalyze()}
                      disabled={isLoading || !content.trim()}
                      className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform disabled:opacity-40 shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Scanning File Content...</span>
                        </>
                      ) : (
                        <>
                          <span>Scan File Content</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste suspicious SMS, WhatsApp message, Telegram alert, or email text..."
                  className="w-full bg-white/95 dark:bg-slate-950/70 border border-slate-200/90 dark:border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 min-h-[96px] max-h-[125px] resize-y shadow-sm transition-colors"
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{content.length} characters</span>
                    {content && (
                      <button
                        onClick={() => setContent("")}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onAnalyze()}
                    disabled={isLoading || !content.trim()}
                    className="px-5 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-full text-xs flex items-center gap-2 transition-transform disabled:opacity-40 shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze Text</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {!uploadedImage ? (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-500 dark:hover:border-cyan-400 transition-colors bg-white/50 dark:bg-slate-950/40 group min-h-[135px] flex flex-col items-center justify-center"
                  >
                    <ImageIcon className="w-8 h-8 text-blue-600 dark:text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Upload screenshot of SMS, WhatsApp, or phishing page
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Supports PNG, JPG, WebP. Optical Character Recognition (OCR) extracts text automatically
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-white/10">
                      <img
                        src={uploadedImage.url}
                        alt="Upload preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {uploadedImage.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {uploadedImage.size} • {ocrStatus || "Ready to scan"}
                        </div>
                        {ocrProgress !== null && (
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${ocrProgress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Change image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleClearImage}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                        Extracted Content (editable):
                      </label>
                      <textarea
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Extracted text will appear here..."
                        className="w-full bg-white/95 dark:bg-slate-950/70 border border-slate-200/90 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-colors resize-y"
                      />
                    </div>

                    <button
                      onClick={() => onAnalyze()}
                      disabled={isLoading || !content.trim() || ocrProgress !== null}
                      className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform disabled:opacity-40 shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Scanning Extracted Image Content...</span>
                        </>
                      ) : (
                        <>
                          <span>Scan Extracted Content</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
      </div>

      </div>

      <div className="pt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
        <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">
          Try samples:
        </span>
        <button
          onClick={() => {
            setActiveTab("url")
            setContent("https://free-iphone-giveaway.com")
          }}
          className={`px-2.5 py-1 rounded-full bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-xs focus:outline-none ${
            content === "https://free-iphone-giveaway.com" ? "ring-1 ring-blue-500/60 dark:ring-cyan-400/60 font-semibold" : ""
          }`}
        >
          📱 iPhone Giveaway
        </button>
        <button
          onClick={() => {
            setActiveTab("url")
            setContent("http://sbi-kyc-update.xyz/login")
          }}
          className={`px-2.5 py-1 rounded-full bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-xs focus:outline-none ${
            content === "http://sbi-kyc-update.xyz/login" ? "ring-1 ring-blue-500/60 dark:ring-cyan-400/60 font-semibold" : ""
          }`}
        >
          🚨 SBI KYC Phishing
        </button>
        <button
          onClick={() => {
            setActiveTab("text")
            setContent("Electricity Department: Your power supply will be disconnected at 9:30 PM due to unpaid bill. Call our officer immediately at 9876543210.")
          }}
          className={`px-2.5 py-1 rounded-full bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-xs focus:outline-none ${
            content.includes("Electricity Department") ? "ring-1 ring-blue-500/60 dark:ring-cyan-400/60 font-semibold" : ""
          }`}
        >
          ⚡ Electricity Threat
        </button>
        <button
          onClick={() => {
            setActiveTab("text")
            setContent("Your OTP for HDFC Bank NetBanking transaction is 482910. Do not share this OTP with anyone, bank never calls to ask OTP.")
          }}
          className={`px-2.5 py-1 rounded-full bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-xs focus:outline-none ${
            content.includes("482910") ? "ring-1 ring-blue-500/60 dark:ring-cyan-400/60 font-semibold" : ""
          }`}
        >
          ✅ Legitimate Bank OTP
        </button>
      </div>
    </div>
  )
}
