import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const API_URL = import.meta.env.VITE_API_URL

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const handleProvider = (provider) => {
    window.location.href = `${API_URL}/auth/password/reset/oauth2/init/${provider}`
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
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-4">
              <KeyRound size={26} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Verify your identity with the account you used to sign up. We'll let you set a new password after.
            </p>
          </div>

          {/* Provider buttons */}
          <div className="flex flex-col gap-3">
            <div
              onClick={() => handleProvider('google')}
              className="flex items-center justify-center gap-3 border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
            >
              <GoogleIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Continue with Google
              </span>
            </div>

            <div
              onClick={() => handleProvider('github')}
              className="flex items-center justify-center gap-3 border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
            >
              <GitHubIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Continue with GitHub
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
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
