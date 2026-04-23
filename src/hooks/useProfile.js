import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, togglePhoneVisibility, toggleStudentSectionVisibility, toggleTeacherSectionVisibility, uploadAvatar, deleteAvatar } from '../api/users'
import { getPhones, sendOtp as sendPhoneOtp, verifyOtp as verifyPhoneOtp, deletePhone, setPrimaryPhone } from '../api/phone'
import { password, send2FAOtp, enable2FA, disable2FA } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { useUploads } from '../context/UploadContext'

export function useUserQuery() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePhonesQuery() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['phones'],
    queryFn: getPhones,
    enabled: !!user,
  })
}

export function useProfileMutations() {
  const queryClient = useQueryClient()
  const { refreshUser } = useAuth()
  const { startUpload, updateProgress, completeUpload, failUpload } = useUploads()

  const invalidateUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
    try {
      const freshUser = await queryClient.fetchQuery({ queryKey: ['user', 'me'], queryFn: getMe })
      refreshUser(freshUser)
    } catch {
      // silently fail if user is unauthenticated
    }
  }

  const invalidatePhones = () => {
    queryClient.invalidateQueries({ queryKey: ['phones'] })
  }

  return {
    toggleVisibility: useMutation({
      mutationFn: togglePhoneVisibility,
      onSuccess: invalidateUser,
    }),

    toggleStudentSectionVis: useMutation({
      mutationFn: toggleStudentSectionVisibility,
      onSuccess: invalidateUser,
    }),

    toggleTeacherSectionVis: useMutation({
      mutationFn: toggleTeacherSectionVisibility,
      onSuccess: invalidateUser,
    }),

    addPhoneOtp: useMutation({
      mutationFn: sendPhoneOtp
    }),

    verifyPhone: useMutation({
      mutationFn: ({ phone, code }) => verifyPhoneOtp(phone, code),
      onSuccess: invalidatePhones,
    }),

    deletePhone: useMutation({
      mutationFn: deletePhone,
      onSuccess: invalidatePhones,
    }),

    setPrimaryPhone: useMutation({
      mutationFn: setPrimaryPhone,
      onSuccess: invalidatePhones,
    }),

    setPassword: useMutation({
      mutationFn: password,
      onSuccess: invalidateUser,
    }),

    send2faOtp: useMutation({
      mutationFn: send2FAOtp,
    }),

    enable2fa: useMutation({
      mutationFn: ({ otpCode }) => enable2FA(otpCode),
      onSuccess: invalidateUser,
    }),

    disable2fa: useMutation({
      mutationFn: ({ otpCode }) => disable2FA(otpCode),
      onSuccess: invalidateUser,
    }),

    uploadAvatar: useMutation({
      mutationFn: async (file) => {
        const uploadId = `avatar-${Date.now()}`
        startUpload(uploadId, file.name || 'Avatar')
        try {
          const result = await uploadAvatar(file, (progress) => {
            updateProgress(uploadId, progress)
          })
          completeUpload(uploadId)
          return result
        } catch (error) {
          failUpload(uploadId, error?.response?.data?.message || error.message || 'Upload failed')
          throw error
        }
      },
      onSuccess: invalidateUser,
    }),

    deleteAvatar: useMutation({
      mutationFn: deleteAvatar,
      onSuccess: invalidateUser,
    }),
  }
}
