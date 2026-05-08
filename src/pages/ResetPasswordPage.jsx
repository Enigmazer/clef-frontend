import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import api from '../api/axios'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return false
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      // The browser automatically sends the httpOnly "passwordReset" cookie —
      // no Authorization header needed.
      await api.patch('/auth/password/reset', { password })

      navigate('/login?reset=success', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center justify-end px-6 py-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-8 w-full max-w-sm shadow-sm">

          {/* Header */}
          <div className="flex justify-center mb-5">
            <Logo size="md" />
          </div>

          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-[#052e16] flex items-center justify-center mb-4">
              <ShieldCheck size={26} className="text-green-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              You've been verified. Choose a strong password for your account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {/* Password fields */}
          <div className="flex flex-col gap-3 mb-5">
            {/* New password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !password || !confirm}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl px-4 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Set Password'}
          </button>

          <div className="mt-5 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to login
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
