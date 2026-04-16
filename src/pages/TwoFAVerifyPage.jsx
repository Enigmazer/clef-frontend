import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verify2FA } from '../api/auth'
import { getMe } from '../api/users'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { ShieldCheck, Phone } from 'lucide-react'

export default function TwoFAVerifyPage() {
  const { onLoginSuccess } = useAuth()
  const navigate = useNavigate()

  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await verify2FA(otpCode)
      const user = await getMe()
      onLoginSuccess(res.data.accessToken, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid or expired code. Please try again.')
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
              Two-Factor Verification
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your account has two-factor authentication enabled.
              A 6-digit code has been sent to your registered phone number.
            </p>
          </div>

          {/* OTP Info Banner */}
          <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-3.5 py-3 mb-4">
            <Phone size={14} className="text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Check your primary phone for the verification code. It expires shortly.
            </p>
          </div>

          {/* OTP Input */}
          <input
            type="text"
            inputMode="numeric"
            placeholder="0 0 0 0 0 0"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-3.5 text-xl text-center tracking-[0.6em] font-mono outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow mb-3"
            autoFocus
          />

          {/* Error */}
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 mb-3 animate-slide-up">
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl px-4 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying…' : 'Verify & Sign In'}
          </button>

          {/* Back link */}
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
