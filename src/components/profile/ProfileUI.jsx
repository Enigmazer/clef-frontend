import { useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export function Avatar({ user, size = 80 }) {
  const [imgError, setImgError] = useState(false)
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  if (user?.avatarUrl && !imgError) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-4 ring-green-100 dark:ring-green-950/50"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="rounded-full bg-green-100 dark:bg-[#052e16] text-green-700 dark:text-green-400 font-bold flex items-center justify-center ring-4 ring-green-100 dark:ring-green-950/50 shrink-0"
    >
      {initials}
    </div>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{children}</h2>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function StatusBanner({ type, message, onClose }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm mb-4 animate-slide-up ${isError
      ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
      : 'bg-green-50 dark:bg-[#052e16]/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50'
      }`}>
      {isError
        ? <AlertCircle size={15} className="shrink-0 mt-0.5" />
        : <CheckCircle2 size={15} className="shrink-0 mt-0.5" />}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <X size={13} />
        </button>
      )}
    </div>
  )
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer disabled:cursor-not-allowed items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] transition-colors ${checked ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#2a2a2a]'
          } ${disabled ? 'opacity-50' : ''}`}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-2' : '-translate-x-2'
            }`}
        />
      </button>
    </div>
  )
}
