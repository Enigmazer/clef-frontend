import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useProfileMutations } from '../hooks/useProfile'
import { getErrorMessage, formatDate } from '../components/profile/helpers'
import { Avatar, Card, StatusBanner } from '../components/profile/ProfileUI'
import PhoneSection from '../components/profile/PhoneSection'
import DashboardVisibilitySection from '../components/profile/DashboardVisibilitySection'
import SecuritySection from '../components/profile/SecuritySection'
import SessionSection from '../components/profile/SessionSection'

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
