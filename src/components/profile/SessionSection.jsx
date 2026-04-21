import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { logout as logoutApi, logoutAll as logoutAllApi } from '../../api/auth'
import { Card, SectionTitle, StatusBanner } from './ProfileUI'
import { getErrorMessage } from './helpers'

export default function SessionSection() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [loadingThis, setLoadingThis] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setLoadingThis(true)
    setError('')
    try {
      await logoutApi()
      refreshUser(null)
      navigate('/login', { replace: true })
    } catch {
      refreshUser(null)
      navigate('/login', { replace: true })
    }
  }

  const handleLogoutAll = async () => {
    setLoadingAll(true)
    setError('')
    try {
      await logoutAllApi()
      refreshUser(null)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Something went wrong.'))
      setLoadingAll(false)
    }
  }

  return (
    <Card>
      <SectionTitle sub="Control where your account is signed in">
        <span className="flex items-center gap-2">
          <LogOut size={15} className="text-green-500" />
          Sessions
        </span>
      </SectionTitle>

      <div className="space-y-3">
        <StatusBanner type="error" message={error} onClose={() => setError('')} />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogout}
            disabled={loadingThis}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogOut size={14} />
            {loadingThis ? 'Signing out…' : 'Sign out'}
          </button>
          <button
            onClick={handleLogoutAll}
            disabled={loadingAll}
            className="flex-1 flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Globe size={14} />
            {loadingAll ? 'Signing out…' : 'Sign out of all devices'}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          "Sign out of all devices" will end every active session immediately.
        </p>
      </div>
    </Card>
  )
}
