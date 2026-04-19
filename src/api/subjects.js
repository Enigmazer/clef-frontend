import api from './axios'

export const createSubject = (data) =>
  api.post('/subjects', data).then((res) => res.data)

export const listTeacherSubjects = () =>
  api.get('/subjects/teacher').then((res) => res.data)

export const listArchivedTeacherSubjects = () =>
  api.get('/subjects/archived/teacher').then((res) => res.data)

export const listStudentSubjects = () =>
  api.get('/subjects/student').then((res) => res.data)

export const getTeacherSubjectDetails = (id) =>
  api.get(`/subjects/${id}/teacher`).then((res) => res.data)

export const getStudentSubjectDetails = (id) =>
  api.get(`/subjects/${id}/student`).then((res) => res.data)

export const joinSubject = (joinCode) =>
  api.post('/subjects/join', { joinCode }).then((res) => res.data)

export const updateSubject = (id, data) =>
  api.patch(`/subjects/${id}`, data).then((res) => res.data)

export const lockUnlockSubject = (id) =>
  api.patch(`/subjects/${id}/preferences/lock/toggle`).then((res) => res.data)

export const archiveUnarchiveSubject = (id) =>
  api.patch(`/subjects/${id}/preferences/archive/toggle`).then((res) => res.data)

export const uploadSyllabus = (id, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.patch(`/subjects/${id}/syllabus`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((res) => res.data)
}

export const deleteSyllabus = (id) =>
  api.delete(`/subjects/${id}/syllabus`)

export const setCurrentTopic = (id, topicId, unitId) =>
  api.patch(`/subjects/${id}/current-topic`, { id: topicId, unitId }).then((res) => res.data)

export const setNextTopic = (id, topicId, unitId) =>
  api.patch(`/subjects/${id}/next-topic`, { id: topicId, unitId }).then((res) => res.data)

export const deleteSubject = (id) =>
  api.delete(`/subjects/${id}`)

export const bulkAddUnits = (id, units) =>
  api.post(`/subjects/${id}/units/bulk`, units).then((res) => res.data)

export const listEnrolledStudents = (id) =>
  api.get(`/subjects/${id}/enrolled/students`).then((res) => res.data)
