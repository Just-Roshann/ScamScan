import React from "react"
import {
  BookOpen,
  Link,
  KeyRound,
  ShieldAlert,
  MailCheck,
  Gift,
  Clock,
  ExternalLink,
} from "lucide-react"
import QuizCard from "../components/QuizCard"

const AWARENESS_CARDS = [
  {
    icon: Link,
    title: "How to Read a URL",
    summary: "Always check the domain immediately before the TLD suffix (.com, .in).",
    detail: "In 'sbi.bank-login.xyz', the registered domain is 'bank-login.xyz', not 'sbi'. Attackers place legitimate brand names in subdomains to trick inattentive eyes.",
  },
  {
    icon: KeyRound,
    title: "OTP is Never Asked by Banks",
    summary: "No genuine bank employee or customer support agent will ever ask for your OTP.",
    detail: "OTP stands for One-Time Password. Entering it authorizes a debit or change of credentials. If someone asks for it over phone or chat, it is 100% a fraud.",
  },
  {
    icon: ShieldAlert,
    title: "Digital Arrest is Not Real",
    summary: "Indian law and law enforcement agencies have no concept called 'Digital Arrest'.",
    detail: "Police, CBI, Customs, and ED never conduct interrogations or issue arrest warrants via WhatsApp or Skype video calls. Disconnect immediately and call 1930.",
  },
  {
    icon: MailCheck,
    title: "Always Check the Sender Domain",
    summary: "Scammers spoof display names like 'PayPal Support' using generic Gmail addresses.",
    detail: "Expand the email sender info. If an official company email comes from '@gmail.com', '@yahoo.com', or has a mismatched Reply-To header, it is an impersonation attempt.",
  },
  {
    icon: Gift,
    title: "Too Good to be True",
    summary: "Unearned lottery prizes, guaranteed stock tips, and video-like jobs are lures.",
    detail: "If you did not enter a contest, you cannot win it. If a job offers thousands of rupees daily for liking YouTube videos or completing Telegram tasks, it will end in extortion.",
  },
  {
    icon: Clock,
    title: "Urgency is an Emotional Trick",
    summary: "Time pressure is engineered to disable your rational thinking.",
    detail: "'Power cut tonight', 'Account blocked in 24 hours', 'Immediate legal action' are all designed to induce panic so you click before verifying with official channels.",
  },
]

export default function Learn() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-cyan-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CYBER DEFENSE KNOWLEDGE BASE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Security Awareness & Quiz
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Learn how threat actors construct deception campaigns and test your skills with our interactive quiz.
        </p>
      </div>

      <section className="space-y-4">
        <div className="text-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Interactive Challenge
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test your ability to distinguish legitimate alerts from malicious scams
          </p>
        </div>
        <QuizCard />
      </section>

      <section className="space-y-6 pt-4">
        <div className="border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            6 Fundamental Rules of Online Defense
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Crucial mental models every citizen should know to stay protected against modern financial cybercrime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AWARENESS_CARDS.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-3 hover:border-blue-400 transition-colors"
              >
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{card.title}</h4>
                    <p className="text-xs font-semibold text-blue-600 dark:text-cyan-300 mt-1">
                      {card.summary}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-sm text-center max-w-3xl mx-auto space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Fallen Victim to Cyber Fraud?
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Report financial fraud within the golden hour (first 2 hours) to maximize the chances of freezing stolen funds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="tel:1930"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Dial 1930 Helpline
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Visit cybercrime.gov.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  )
}
