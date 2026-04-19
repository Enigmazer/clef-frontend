import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone, Plus, X, Shield, LogOut, Globe,
  CheckCircle2, AlertCircle, Eye, EyeOff, Trash2, AlertTriangle
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { logout as logoutApi, logoutAll as logoutAllApi } from '../api/auth'
import { usePhonesQuery, useProfileMutations } from '../hooks/useProfile'

// ─── helpers ────────────────────────────────────────────────────────────────
function formatDate(instant) {
  if (!instant) return ''
  return new Date(instant).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getErrorMessage(err, fallbackMsg) {
  const data = err.response?.data
  if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
    return Object.values(data.fieldErrors)[0]
  }
  return data?.message || fallbackMsg
}

// ─── sub-components ──────────────────────────────────────────────────────────
function Avatar({ user, size = 80 }) {
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

function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{children}</h2>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBanner({ type, message, onClose }) {
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

function Toggle({ checked, onChange, label, description, disabled }) {
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

const COUNTRIES = [
  { code: 'US', dial: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', dial: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'GB', dial: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', dial: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dial: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dial: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dial: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'IT', dial: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', dial: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', dial: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', dial: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'JP', dial: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', dial: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'ZA', dial: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'SG', dial: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', dial: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'EG', dial: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: 'NG', dial: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', dial: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: 'RU', dial: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'TR', dial: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: 'AR', dial: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', dial: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PK', dial: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', dial: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'ID', dial: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', dial: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'PH', dial: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', dial: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', dial: '+66', name: 'Thailand', flag: '🇹🇭' },
]

// ─── Phone Numbers section ────────────────────────────────────────────────────
function PhoneSection() {
  const { user } = useAuth()
  const { data: phonesData, isLoading: loading } = usePhonesQuery()
  const phones = Array.isArray(phonesData) ? phonesData : []
  const mutations = useProfileMutations()

  // add-phone wizard state
  const [wizard, setWizard] = useState({
    step: 'idle',       // 'idle' | 'enter_number' | 'enter_otp'
    countryCode: '+1',
    newPhone: '',
    sentPhone: '',
    otpCode: '',
    submitting: false,
    deleting: null,     // phoneNumber string being deleted
    error: '',
    success: '',
    tfaGuardModal: false,
  })

  const setW = (patch) => setWizard(prev => ({ ...prev, ...patch }))
  const clearMessages = () => setW({ error: '', success: '' })

  const is2faEnabled = user?.twoFactorEnabled ?? false

  useEffect(() => {
    try {
      if (navigator.language) {
        const parts = navigator.language.split('-')
        const region = parts.length > 1 ? parts[1].toUpperCase() : navigator.language.toUpperCase()
        const found = COUNTRIES.find((c) => c.code === region)
        if (found) setW({ countryCode: found.dial })
      }
    } catch {
      // safely ignore if parsing fails
    }
  }, [])

  const handleSendOtp = async () => {
    if (!wizard.newPhone.trim()) { setW({ error: 'Enter a phone number.' }); return }
    const fullNumber = `${wizard.countryCode}${wizard.newPhone.trim().replace(/[\s-]/g, '')}`
    if (fullNumber.length > 20) { setW({ error: 'Phone number is too long.' }); return }

    clearMessages()
    setW({ submitting: true })
    try {
      await mutations.addPhoneOtp.mutateAsync(fullNumber)
      setW({ sentPhone: fullNumber, step: 'enter_otp' })
    } catch (err) {
      setW({ error: getErrorMessage(err, 'Failed to send OTP. Check the number and try again.') })
    } finally {
      setW({ submitting: false })
    }
  }

  const handleVerifyOtp = async () => {
    if (wizard.otpCode.length !== 6) { setW({ error: 'Enter the 6-digit code.' }); return }
    clearMessages()
    setW({ submitting: true })
    try {
      await mutations.verifyPhone.mutateAsync({ phone: wizard.sentPhone, code: wizard.otpCode.trim() })
      setW({ success: 'Phone number added successfully.', step: 'idle', newPhone: '', sentPhone: '', otpCode: '' })
    } catch (err) {
      setW({ error: getErrorMessage(err, 'Invalid or expired code. Try again.') })
    } finally {
      setW({ submitting: false })
    }
  }

  const handleDelete = async (phoneNumber) => {
    const phoneObj = phones.find(p => p.phoneNumber === phoneNumber)
    const isThisPrimary = phoneObj?.primary === true || phoneObj?.isPrimary === true
    if (is2faEnabled && isThisPrimary) {
      setW({ tfaGuardModal: true })
      return
    }

    clearMessages()
    setW({ deleting: phoneNumber })
    try {
      await mutations.deletePhone.mutateAsync(phoneNumber)
      setW({ success: 'Phone number removed.' })
    } catch (err) {
      setW({ error: getErrorMessage(err, 'Could not remove phone number.') })
    } finally {
      setW({ deleting: null })
    }
  }

  const handleSetPrimary = async (phoneNumber) => {
    if (is2faEnabled) {
      setW({ tfaGuardModal: true })
      return
    }

    clearMessages()
    try {
      await mutations.setPrimaryPhone.mutateAsync(phoneNumber)
      setW({ success: 'Primary phone updated.' })
    } catch (err) {
      setW({ error: getErrorMessage(err, 'Could not set primary phone.') })
    }
  }

  const cancelAdd = () => {
    setW({ step: 'idle', newPhone: '', sentPhone: '', otpCode: '', error: '', success: '' })
  }

  const canAdd = phones.length < 2

  return (
    <Card>
      <SectionTitle
        sub={`Up to 2 numbers per account · ${phones.length}/2 added`}
      >
        <span className="flex items-center gap-2">
          <Phone size={15} className="text-green-500" />
          Phone numbers
        </span>
      </SectionTitle>

      {loading ? (
        <div className="h-10 flex items-center">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {phones.length === 0 && wizard.step === 'idle' && (
            <p className="text-sm text-gray-400 dark:text-gray-500">No phone numbers added yet.</p>
          )}
          {phones.map((p) => {
            const isThisPrimary = p.isPrimary === true || p.primary === true
            return (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-[#2a2a2a] rounded-xl px-4 py-3 animate-slide-up"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white tracking-wide">{p.phoneNumber}</span>
                  {isThisPrimary && (
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-[#052e16] text-green-700 dark:text-green-400 rounded-md">Primary</span>
                  )}
                  <span className="ml-3 text-xs text-gray-400 dark:text-gray-500">Added {formatDate(p.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!isThisPrimary && phones.length > 1 && (
                    <button
                      onClick={() => handleSetPrimary(p.phoneNumber)}
                      className="text-xs text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-medium px-2 py-1 rounded-md hover:bg-green-50 dark:hover:bg-[#052e16] transition-colors"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.phoneNumber)}
                    disabled={wizard.deleting === p.phoneNumber}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Remove"
                  >
                    {wizard.deleting === p.phoneNumber
                      ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-3">
        <StatusBanner type="error" message={wizard.error} onClose={() => setW({ error: '' })} />
        <StatusBanner type="success" message={wizard.success} onClose={() => setW({ success: '' })} />

        {phones.length > 0 && (
          <div className="mb-2">
            <div className="h-px bg-gray-100 dark:bg-[#2a2a2a] my-4" />
            <Toggle
              checked={user?.showPhoneToStudents ?? false}
              onChange={async () => {
                clearMessages()
                try {
                  await mutations.toggleVisibility.mutateAsync()
                } catch (err) {
                  setW({ error: getErrorMessage(err, 'Failed to update visibility.') })
                }
              }}
              label="Show phone number to students"
              description="Students enrolled in your subjects will be able to see your phone number(s)"
            />
            <div className="h-px bg-gray-100 dark:bg-[#2a2a2a] my-4" />
          </div>
        )}

        {wizard.step === 'idle' && canAdd && (
          <button
            onClick={() => setW({ step: 'enter_number', error: '', success: '' })}
            className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <Plus size={15} />
            Add a number
          </button>
        )}

        {wizard.step === 'idle' && !canAdd && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Maximum of 2 phone numbers reached.</p>
        )}

        {wizard.step === 'enter_number' && (
          <div className="space-y-2.5 pt-1 mt-3 animate-fade-in">
            <div className="flex bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#2a2a2a] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-shadow">
              <select
                value={wizard.countryCode}
                onChange={(e) => setW({ countryCode: e.target.value })}
                className="bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white pl-3 pr-8 py-2.5 text-sm outline-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="0000000000"
                value={wizard.newPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d\s-]/g, '')
                  const cleanLength = (wizard.countryCode + val.replace(/[\s-]/g, '')).length
                  if (cleanLength <= 20) setW({ newPhone: val })
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-3.5 py-2.5 text-sm outline-none w-full"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendOtp}
                disabled={wizard.submitting}
                className="flex-1 bg-green-500 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {wizard.submitting ? 'Sending…' : 'Send OTP'}
              </button>
              <button onClick={cancelAdd} className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border border-gray-200 dark:border-[#2a2a2a] rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        )}

        {wizard.step === 'enter_otp' && (
          <div className="space-y-2.5 pt-1 mt-3 animate-fade-in">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A 6-digit code was sent to <span className="font-medium text-gray-700 dark:text-gray-300">{wizard.sentPhone}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={wizard.otpCode}
              onChange={(e) => setW({ otpCode: e.target.value.replace(/\D/g, '') })}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              className="w-full border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest text-center font-mono"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleVerifyOtp}
                disabled={wizard.submitting}
                className="flex-1 bg-green-500 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {wizard.submitting ? 'Verifying…' : 'Verify'}
              </button>
              <button
                onClick={() => setW({ step: 'enter_number', otpCode: '', sentPhone: '', error: '', success: '' })}
                className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border border-gray-200 dark:border-[#2a2a2a] rounded-xl"
              >
                Back
              </button>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={wizard.submitting}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              Resend code
            </button>
          </div>
        )}
      </div>

      {/* 2FA Guard Modal */}
      <Modal isOpen={wizard.tfaGuardModal} onClose={() => setW({ tfaGuardModal: false })}>
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="text-amber-600 dark:text-amber-500" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Two-Factor Authentication is Active</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 px-2">
            Your primary number is used for two-factor authentication. Disable 2FA first before making changes to your primary number.
          </p>
          <div className="w-full space-y-2.5 flex flex-col items-stretch">
            <button
              onClick={() => {
                setW({ tfaGuardModal: false })
                document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              Go to Security Settings
            </button>
            <button
              onClick={() => setW({ tfaGuardModal: false })}
              className="w-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 text-sm font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}

// ─── Security section ─────────────────────────────────────────────────────────
function SecuritySection({ user }) {
  const mutations = useProfileMutations()
  const { data: phonesData } = usePhonesQuery()
  const phones = Array.isArray(phonesData) ? phonesData : []
  const hasPrimary = phones.some(p => p.isPrimary === true || p.primary === true) || phones.length > 0
  const hasPassword = user?.hasPassword ?? false
  const is2faEnabled = user?.twoFactorEnabled ?? false

  const [pwValue, setPwValue] = useState('')
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

  // Must match backend: any printable ASCII character, 8–64 chars
  const PW_REGEX = /^[\x20-\x7E]{8,64}$/

  const handlePasswordSubmit = async () => {
    if (pwValue.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (pwValue.length > 64) {
      setError('Password must be at most 64 characters.')
      return
    }
    setError(''); setSuccess('')
    setLoading(true)
    try {
      await mutations.setPassword.mutateAsync(pwValue)
      setSuccess(hasPassword ? 'Password updated.' : 'Password set. You can now sign in with email.')
      setPwValue('')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to set password. Please try again.'))
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
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={hasPassword ? 'New password' : 'Set a password'}
            value={pwValue}
            onChange={(e) => setPwValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
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
        {pwValue.length > 64 && (
          <p className="text-xs text-red-500 dark:text-red-400">Password must be at most 64 characters.</p>
        )}

        <StatusBanner type="error" message={error} onClose={() => setError('')} />
        <StatusBanner type="success" message={success} onClose={() => setSuccess('')} />

        <button
          onClick={handlePasswordSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving…' : hasPassword ? 'Update password' : 'Set password'}
        </button>

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

// ─── Dashboard Visibility section ─────────────────────────────────────────────
function DashboardVisibilitySection({ user }) {
  const mutations = useProfileMutations()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isTeacherHidden = user?.hideTeacherSection ?? false
  const isStudentHidden = user?.hideStudentSection ?? false

  return (
    <Card>
      <SectionTitle sub="Customize your dashboard by hiding sections you don't use">
        <span className="flex items-center gap-2">
          <Eye size={15} className="text-green-500" />
          Dashboard Visibility
        </span>
      </SectionTitle>

      <div className="space-y-3">
        <StatusBanner type="error" message={error} onClose={() => setError('')} />

        <Toggle
          checked={isTeacherHidden}
          disabled={isStudentHidden || loading}
          onChange={async () => {
            setError('')
            setLoading(true)
            try {
              await mutations.toggleTeacherSectionVis.mutateAsync()
            } catch (err) {
              setError(getErrorMessage(err, 'Failed to update visibility.'))
            } finally {
              setLoading(false)
            }
          }}
          label="Hide Teacher Dashboard"
          description="Removes 'My Subjects' and teaching controls from your dashboard."
        />
        <div className="h-px bg-gray-100 dark:bg-[#2a2a2a] my-4" />
        <Toggle
          checked={isStudentHidden}
          disabled={isTeacherHidden || loading}
          onChange={async () => {
            setError('')
            setLoading(true)
            try {
              await mutations.toggleStudentSectionVis.mutateAsync()
            } catch (err) {
              setError(getErrorMessage(err, 'Failed to update visibility.'))
            } finally {
              setLoading(false)
            }
          }}
          label="Hide Student Dashboard"
          description="Removes 'Enrolled Subjects' and student view from your dashboard."
        />
      </div>
    </Card>
  )
}

// ─── Sessions section ─────────────────────────────────────────────────────────
function SessionSection() {
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth()
  const mutations = useProfileMutations()
  const fileInputRef = useRef(null)
  const [avatarError, setAvatarError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError('Only JPEG and PNG formats are supported.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setAvatarError('Avatar size must be less than 3MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setAvatarError('')
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmUpload = async () => {
    if (!previewFile) return
    setAvatarUploading(true)
    setAvatarError('')
    try {
      await mutations.uploadAvatar.mutateAsync(previewFile)
      closePreviewModal()
    } catch (err) {
      setAvatarError(getErrorMessage(err, 'Failed to upload avatar.'))
      setAvatarUploading(false)
    }
  }

  const closePreviewModal = () => {
    setPreviewFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setAvatarUploading(false)
  }

  const handleDeleteAvatar = async () => {
    setAvatarError('')
    setAvatarUploading(true)
    try {
      await mutations.deleteAvatar.mutateAsync()
    } catch (err) {
      setAvatarError(getErrorMessage(err, 'Failed to delete avatar.'))
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-5">

        {/* ── Profile header card ── */}
        <Card>
          {avatarError && <StatusBanner type="error" message={avatarError} onClose={() => setAvatarError('')} />}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative isolate shrink-0">
              <Avatar user={user} size={80} />
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-10 transition-opacity">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {user?.fullName ?? '—'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Member since {formatDate(user?.createdAt)}
                  </p>
                </div>
                {user?.role === 'ADMIN' && (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                    Admin
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png" onChange={handleAvatarSelect} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="text-xs font-medium px-3 py-1.5 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Change Avatar
                </button>
                {user?.avatarUrl && (
                  <button 
                    onClick={handleDeleteAvatar}
                    disabled={avatarUploading}
                    className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Remaining sections ── */}
        <PhoneSection />
        <DashboardVisibilitySection user={user} />
        <SecuritySection user={user} />
        <SessionSection />
      </div>

      {/* Avatar Preview Modal */}
      <Modal isOpen={!!previewFile} onClose={closePreviewModal} title="Preview Avatar">
        <div className="flex flex-col items-center pt-2 pb-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
            This is how your avatar will look.
          </p>
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-green-100 dark:ring-green-950/50 bg-gray-100 dark:bg-[#1a1a1a]">
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          
          <div className="w-full space-y-2.5 flex flex-col items-stretch">
            <button
              onClick={handleConfirmUpload}
              disabled={avatarUploading}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {avatarUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {avatarUploading ? 'Uploading…' : 'Upload'}
            </button>
            <button
              onClick={closePreviewModal}
              disabled={avatarUploading}
              className="w-full bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 text-sm font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
