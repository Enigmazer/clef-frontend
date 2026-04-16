import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/users'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const API_URL = import.meta.env.VITE_API_URL

export default function LoginPage() {
  const { onLoginSuccess, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('error') === 'oauth2_failed' ? 'OAuth sign-in failed. Please try again.' : ''
  })
  const [loading, setLoading] = useState(false)
  const [failCount, setFailCount] = useState(0)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  const handleOAuth = (provider) => {
    window.location.href = `${API_URL}/oauth2/authorization/${provider}`
  }

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      // 202 ACCEPTED means 2FA is required — backend has set a tempToken cookie
      if (res.status === 202 || res.data?.twoFactorRequired) {
        navigate('/2fa-verify', { replace: true })
        return
      }
      const user = await getMe()
      onLoginSuccess(res.data.accessToken, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const newCount = failCount + 1
      setFailCount(newCount)
      setError(err.response?.data?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <ThemeToggle />
      </div>

      {/* card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-8 w-full max-w-sm shadow-sm">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-1">
            Welcome to Clef
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Sign in or create an account
          </p>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3">
            <div
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-3 border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
            >
              <GoogleIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Continue with Google
              </span>
            </div>

            <div
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-3 border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
            >
              <GitHubIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Continue with GitHub
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
            New here? These buttons create your account too.
          </p>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
          </div>

          {!showEmail ? (
            <div
              onClick={() => setShowEmail(true)}
              className="text-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 cursor-pointer font-medium"
            >
              Sign in with email &amp; password
            </div>
          ) : (
            /* ── email/password step ── */
            <div className="flex flex-col gap-3">
              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 space-y-1">
                  <p>{error}</p>
                  {failCount > 2 && (
                    <p className="text-red-500 dark:text-red-400 mt-1">
                      Tip: you may have signed up with Google or GitHub — try those buttons above.
                    </p>
                  )}
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                className="border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div
                onClick={handleEmailLogin}
                className={`bg-green-500 text-white text-sm font-medium rounded-lg px-4 py-2.5 text-center cursor-pointer hover:bg-green-600 transition-colors ${loading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800 dark:text-gray-200">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
