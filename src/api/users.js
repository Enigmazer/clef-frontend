import api from './axios'

export const getMe = () =>
  api.get('/users/me').then((res) => res.data)

export const togglePhoneVisibility = () =>
  api.patch('/users/preferences/phone-visibility/toggle').then((res) => res.data)

export const toggleStudentSectionVisibility = () =>
  api.patch('/users/preferences/student-section-visibility/toggle').then((res) => res.data)

export const toggleTeacherSectionVisibility = () =>
  api.patch('/users/preferences/teacher-section-visibility/toggle').then((res) => res.data)

export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.patch('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then((res) => res.data)
}

export const deleteAvatar = () =>
  api.delete('/users/avatar').then((res) => res.data)
