import api from './axios'

export const getPhones = () =>
    api.get('/phone').then((res) => res.data)

export const sendOtp = (phoneNumber) =>
    api.post('/phone/send-otp', { phoneNumber })

export const verifyOtp = (phoneNumber, code) =>
    api.post('/phone/verify-otp', { phoneNumber, code })

export const deletePhone = (phoneNumber) =>
    api.delete('/phone/delete', { data: { phoneNumber } })

export const setPrimaryPhone = (phoneNumber) =>
    api.post('/phone/set-primary', { phoneNumber })
