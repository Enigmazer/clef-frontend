import api from './axios'

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const logout = () =>
  api.post('/auth/logout')

export const logoutAll = () =>
  api.post('/auth/logout-all')

export const refresh = () =>
  api.post('/auth/refresh')

export const setPassword = (password) =>
  api.post('/auth/password/set', { password })

export const updatePassword = (currentPassword, newPassword) =>
  api.patch('/auth/password/update', { currentPassword, newPassword })

export const send2FAOtp = () =>
  api.post('/auth/2fa/send-otp')

export const enable2FA = (otpCode) =>
  api.patch('/auth/2fa/enable', { otpCode })

export const disable2FA = (otpCode) =>
  api.patch('/auth/2fa/disable', { otpCode })

export const verify2FA = (otpCode) =>
  api.post('/auth/2fa/verify', { otpCode })
