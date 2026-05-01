import { useState, useEffect } from 'react'
import { Phone, Plus, Trash2, AlertTriangle } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import { usePhonesQuery, useProfileMutations } from '../../hooks/useProfile'
import { Card, SectionTitle, StatusBanner, Toggle } from './ProfileUI'
import { formatDate, getErrorMessage } from './helpers'

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

export default function PhoneSection({ onNavigateToSecurity }) {
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

  const handleSetPrimary = async () => {
    if (is2faEnabled) {
      setW({ tfaGuardModal: true })
      return
    }

    clearMessages()
    try {
      await mutations.setPrimaryPhone.mutateAsync()
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
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
              SMS OTP is simulated due to Twilio free tier limitations — enter the last 6 digits of your phone number to verify.
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
      <ConfirmModal
        isOpen={wizard.tfaGuardModal}
        onClose={() => setW({ tfaGuardModal: false })}
        onConfirm={() => {
          setW({ tfaGuardModal: false })
          if (onNavigateToSecurity) onNavigateToSecurity()
        }}
        title="Two-Factor Authentication is Active"
        message="Your primary number is used for two-factor authentication. Disable 2FA first before making changes to your primary number."
        confirmText="Go to Security Settings"
        variant="amber"
      />
    </Card>
  )
}
