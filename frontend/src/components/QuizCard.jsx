import React, { useState } from "react"
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award } from "lucide-react"

const QUIZ_ITEMS = [
  {
    id: 1,
    message: "SBI Alert: Your netbanking account has been suspended due to pending KYC. Click http://sbi-kyc-service.top/update to reactivate within 12 hours.",
    isScam: true,
    explanation: "Scam! SBI never sends links ending with .top or asks for immediate account reactivation under threat of suspension.",
  },
  {
    id: 2,
    message: "492018 is your OTP for purchase of Rs 2,499 at Amazon Pay. Never share this OTP with anyone, even bank staff.",
    isScam: false,
    explanation: "Safe! This is a genuine transaction confirmation containing explicit security negation warning you never to share OTP.",
  },
  {
    id: 3,
    message: "Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Contact billing officer immediately: 9812345678.",
    isScam: true,
    explanation: "Scam! State electricity boards do not send disconnection threats from random phone numbers demanding same-night calls.",
  },
  {
    id: 4,
    message: "Congratulations! Your mobile number won 25 Lakh in Kaun Banega Crorepati Lottery. Deposit Rs 1,200 GST registration fee to claim prize.",
    isScam: true,
    explanation: "Scam! Genuine lotteries never demand advance processing fees or GST payments before disbursing winnings.",
  },
  {
    id: 5,
    message: "Your Swiggy order #82910 has been delivered. Rate your delivery partner in the official Swiggy mobile app.",
    isScam: false,
    explanation: "Safe! Regular order fulfillment update directing you to use the verified official app with no external links.",
  },
  {
    id: 6,
    message: "URGENT: CBI Cyber Crime Cell has issued a digital arrest warrant against your Aadhaar number. Call inspector on WhatsApp now.",
    isScam: true,
    explanation: "Scam! 'Digital arrest' does not exist in Indian law. Law enforcement agencies never arrest or conduct court hearings over WhatsApp.",
  },
  {
    id: 7,
    message: "Customer Care: Install AnyDesk app from play store and share the 9-digit code to fix your failed UPI refund.",
    isScam: true,
    explanation: "Scam! Scammers ask for AnyDesk or TeamViewer to view your screen and steal OTPs and bank credentials.",
  },
  {
    id: 8,
    message: "Hinglish chat: Bhai shaam ko 7 baje milte hain coffee shop pe. Rohit ko bhi bol dena.",
    isScam: false,
    explanation: "Safe! Casual conversational message with zero urgency or financial coercion.",
  },
]

export default function QuizCard() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)

  const currentQuestion = QUIZ_ITEMS[currentIndex]
  const currentAnswer = userAnswers[currentIndex]

  const handlePickAnswer = (pickedScam) => {
    if (hasAnsweredCurrent) return
    const isCorrect = pickedScam === currentQuestion.isScam
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: { pickedScam, isCorrect },
    }))
    setHasAnsweredCurrent(true)
  }

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_ITEMS.length) {
      setCurrentIndex((prev) => prev + 1)
      setHasAnsweredCurrent(false)
    } else {
      setQuizFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setUserAnswers({})
    setHasAnsweredCurrent(false)
    setQuizFinished(false)
  }

  const scoreCount = Object.values(userAnswers).filter((a) => a.isCorrect).length

  if (quizFinished) {
    return (
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-sm text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Completed!</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          You scored <span className="font-bold text-blue-600 dark:text-cyan-300 text-lg">{scoreCount}</span> out of{" "}
          <span className="font-bold text-slate-900 dark:text-white text-lg">{QUIZ_ITEMS.length}</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {scoreCount >= 7
            ? "Outstanding! You have strong instincts for spotting phishing and fraudulent tactics."
            : scoreCount >= 5
            ? "Good effort! Review the security cards below to sharpen your scam detection skills."
            : "Be careful! Scammers frequently exploit urgency and fear. Review our security tips."}
        </p>
        <button
          onClick={handleRestart}
          className="px-6 py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors inline-flex items-center gap-2 text-sm shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3">
        <span className="text-xs uppercase tracking-wider text-blue-600 dark:text-cyan-400 font-bold">
          Spot The Scam Quiz
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Question {currentIndex + 1} of {QUIZ_ITEMS.length}
        </span>
      </div>

      <div className="p-4 bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200/60 dark:border-white/5 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed break-words">
        "{currentQuestion.message}"
      </div>

      {!hasAnsweredCurrent ? (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handlePickAnswer(false)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Looks Safe</span>
          </button>
          <button
            onClick={() => handlePickAnswer(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>It's a Scam</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              currentAnswer.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            {currentAnswer.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            )}
            <div>
              <div className="font-bold text-sm">
                {currentAnswer.isCorrect ? "Correct!" : "Not quite!"}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>{currentIndex + 1 < QUIZ_ITEMS.length ? "Next Question" : "View Final Score"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
