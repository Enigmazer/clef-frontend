import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function JoinCodePill({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 bg-green-50 dark:bg-[#052e16] border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors group"
    >
      <span className="tracking-widest">{code}</span>
      {copied
        ? <Check size={13} className="text-green-500" />
        : <Copy size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
    </button>
  )
}
