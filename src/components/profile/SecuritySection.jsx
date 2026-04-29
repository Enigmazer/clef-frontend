import { useState } from 'react'
import { Shield, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import Modal from '../../components/Modal'
import { usePhonesQuery, useProfileMutations } from '../../hooks/useProfile'
import { Card, SectionTitle, StatusBanner } from './ProfileUI'
import { getErrorMessage } from './helpers'

export default function SecuritySection({ user }) {
  const mutations = useProfileMutations()
  const { data: phonesData } = usePhonesQuery()
  const phones = Array.isArray(phonesData) ? phonesData : []
  const hasPrimary = phones.some(p => p.isPrimary === true || p.primary === true) || phones.length > 0
  const hasPassword = user?.hasPassword ?? false
  const is2faEnabled = user?.twoFactorEnabled ?? false

  const [setPwValue, setSetPwValue] = useState('')
  const [setPwConfirm, setSetPwConfirm] = useState('')
  
  const [currentPwValue, setCurrentPwValue] = useState('')
  const [newPwValue, setNewPwValue] = useState('')
  const [newPwConfirm, setNewPwConfirm] = useState('')

  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 2FA state
  const [tfaModalState, setTfaModalState] = useState({ isOpen: false, type: 'enable', step: 'confirm' })
  const [tfaCode, setTfaCode] = useState('')
  const [tfaSubmitting, setTfaSubmitting] = useState(false)
  const [tfaError, setTfaError] = useState('')
  const [tfaSuccess, setTfaSuccess] = useState('')

  const openTfaModal = (type) => {
    setTfaModalState({ isOpen: true, type, step: 'confirm' })
    setTfaError(''); setTfaSuccess(''); setTfaCode('')
  }

  const closeTfaModal = () => {
    setTfaModalState(prev => ({ ...prev, isOpen: false }))
    setTfaCode('')
  }

  const handleSetPasswordSubmit = async () => {
    if (setPwValue !== setPwConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (setPwValue.length < 8 || setPwValue.length > 64) {
      setError('Password must be between 8 and 64 characters.')
      return
    }
    setError(''); setSuccess('')
    setLoading(true)
    try {
      await mutations.setPassword.mutateAsync({ password: setPwValue })
      setSuccess('Password set. You can now sign in with email.')
      setSetPwValue(''); setSetPwConfirm('')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to set password. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePasswordSubmit = async () => {
    if (!currentPwValue) {
      setError('Current password is required.')
      return
    }
    if (newPwValue !== newPwConfirm) {
      setError('New passwords do not match.')
      return
    }
    if (newPwValue.length < 8 || newPwValue.length > 64) {
      setError('New password must be between 8 and 64 characters.')
      return
    }
    setError(''); setSuccess('')
    setLoading(true)
    try {
      await mutations.updatePassword.mutateAsync({ currentPassword: currentPwValue, newPassword: newPwValue })
      setSuccess('Password updated successfully.')
      setCurrentPwValue(''); setNewPwValue(''); setNewPwConfirm('')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update password. Please check your current password and try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleTfaInit = async () => {
    setTfaError(''); setTfaSubmitting(true)
    try {
      await mutations.send2faOtp.mutateAsync()
      setTfaModalState(prev => ({ ...prev, step: 'otp' }))
    } catch (err) {
      setTfaError(getErrorMessage(err, 'Failed to send OTP.'))
    } finally {
      setTfaSubmitting(false)
    }
  }

  const handleTfaConfirm = async () => {
    if (tfaCode.length !== 6) { setTfaError('Enter the 6-digit code.'); return }
    setTfaError(''); setTfaSubmitting(true)
    try {
      if (tfaModalState.type === 'enable') {
        await mutations.enable2fa.mutateAsync({ otpCode: tfaCode })
        setTfaSuccess('Two-factor authentication enabled successfully.')
      } else {
        await mutations.disable2fa.mutateAsync({ otpCode: tfaCode })
        setTfaSuccess('Two-factor authentication disabled.')
      }
      closeTfaModal()
    } catch (err) {
      setTfaError(getErrorMessage(err, 'Invalid or expired code.'))
    } finally {
      setTfaSubmitting(false)
    }
  }

  return (
    <Card id="security-section">
      <SectionTitle sub="Add or update your email login password">
        <span className="flex items-center gap-2">
          <Shield size={15} className="text-green-500" />
          Security
        </span>
      </SectionTitle>

      {!hasPassword && (
        <div className="flex items-start gap-2.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl px-4 py-3 text-sm text-indigo-700 dark:text-indigo-400 mb-4">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          No password set — you currently sign in with Google or GitHub only.
        </div>
      )}

      <div className="space-y-3">
        <StatusBanner type="error" message={error} onClose={() => setError('')} />
        <StatusBanner type="success" message={success} onClose={() => setSuccess('')} />

        {!hasPassword ? (
          <>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Set a password"
                value={setPwValue}
                onChange={(e) => setSetPwValue(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm password"
                value={setPwConfirm}
                onChange={(e) => setSetPwConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetPasswordSubmit()}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSetPasswordSubmit}
              disabled={loading || !setPwValue || !setPwConfirm}
              className="w-full bg-green-500 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Saving…' : 'Set password'}
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Current password"
                value={currentPwValue}
                onChange={(e) => setCurrentPwValue(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="New password"
                value={newPwValue}
                onChange={(e) => setNewPwValue(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={newPwConfirm}
                onChange={(e) => setNewPwConfirm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdatePasswordSubmit()}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleUpdatePasswordSubmit}
              disabled={loading || !currentPwValue || !newPwValue || !newPwConfirm}
              className="w-full bg-green-500 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </>
        )}

        <div className="h-px bg-gray-100 dark:bg-[#2a2a2a] my-5" />

        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Two-Factor Authentication</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Add an extra layer of security to your account. You will receive an OTP on your primary phone when signing in.
          </p>

          <StatusBanner type="error" message={tfaError} onClose={() => setTfaError('')} />
          <StatusBanner type="success" message={tfaSuccess} onClose={() => setTfaSuccess('')} />

          <div className="mt-2">
            {!is2faEnabled ? (
              <button
                onClick={() => openTfaModal('enable')}
                disabled={!hasPrimary || tfaSubmitting}
                className="bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-white text-sm font-medium rounded-xl px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Enable 2FA
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-[#052e16] text-green-700 dark:text-green-400">
                  <CheckCircle2 size={13} />
                  Enabled
                </span>
                <button
                  onClick={() => openTfaModal('disable')}
                  disabled={tfaSubmitting}
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Disable
                </button>
              </div>
            )}
            {!hasPrimary && !is2faEnabled && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                Add a phone number to enable two-factor authentication.
              </p>
            )}
          </div>
        </div>

        {/* 2FA Flow Modal */}
        <Modal
          isOpen={tfaModalState.isOpen}
          onClose={closeTfaModal}
          title={tfaModalState.type === 'enable' ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}
        >
          {tfaModalState.step === 'confirm' ? (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {tfaModalState.type === 'enable'
                  ? "To enable two-factor authentication, we need to verify your primary phone number. We will send a 6-digit OTP to your primary number to confirm your identity."
                  : "To disable two-factor authentication, we will send a 6-digit OTP to your primary phone number to confirm your identity."}
              </p>
              <StatusBanner type="error" message={tfaError} onClose={() => setTfaError('')} />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={closeTfaModal}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl transition-colors font-medium border border-gray-200 dark:border-[#333]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTfaInit}
                  disabled={tfaSubmitting}
                  className={`flex-1 px-4 py-2 text-sm text-white font-medium rounded-xl transition-colors ${tfaModalState.type === 'enable' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {tfaSubmitting ? 'Sending…' : 'Send OTP'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter the 6-digit OTP sent to your primary phone number to continue.
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleTfaConfirm()}
                className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-3 text-lg text-center tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow font-medium"
                autoFocus
              />
              <StatusBanner type="error" message={tfaError} onClose={() => setTfaError('')} />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={closeTfaModal}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl transition-colors font-medium border border-gray-200 dark:border-[#333]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTfaConfirm}
                  disabled={tfaSubmitting || tfaCode.length !== 6}
                  className={`flex-1 px-4 py-2 text-sm text-white font-medium rounded-xl transition-colors ${tfaModalState.type === 'enable' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {tfaSubmitting ? 'Verifying…' : 'Verify'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Card>
  )
}
