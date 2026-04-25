import api from './axios'

export const createSubject = (data) =>
  api.post('/subjects', data).then((res) => res.data)

export const listTeacherSubjects = () =>
  api.get('/subjects/teacher').then((res) => res.data)

export const listArchivedTeacherSubjects = () =>
  api.get('/subjects/teacher/archived').then((res) => res.data)

export const listStudentSubjects = () =>
  api.get('/subjects/student').then((res) => res.data)

export const getTeacherSubjectDetails = (id) =>
  api.get(`/subjects/${id}/teacher`).then((res) => res.data)

export const getStudentSubjectDetails = (id) =>
  api.get(`/subjects/${id}/student`).then((res) => res.data)

export const getSubjectUpdatedAt = (id) =>
  api.get(`/subjects/${id}/updated-at`).then((res) => res.data)

export const getSyllabusUrl = (id) =>
  api.get(`/subjects/${id}/syllabus`).then((res) => res.data)

export const getTeacherProfile = (id) =>
  api.get(`/subjects/${id}/teacher/profile`).then((res) => res.data)

export const joinSubject = (joinCode) =>
  api.post('/subjects/join', { joinCode }).then((res) => res.data)

export const updateSubject = (id, data) =>
  api.patch(`/subjects/${id}`, data).then((res) => res.data)

export const lockUnlockSubject = (id) =>
  api.patch(`/subjects/${id}/preferences/lock/toggle`).then((res) => res.data)

export const archiveUnarchiveSubject = (id) =>
  api.patch(`/subjects/${id}/preferences/archive/toggle`).then((res) => res.data)

export const uploadSyllabus = (id, file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.put(`/subjects/${id}/syllabus`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  }).then((res) => res.data)
}

export const deleteSyllabus = (id) =>
  api.delete(`/subjects/${id}/syllabus`).then((res) => res.data)

export const setCurrentTopic = (id, topicId, unitId) =>
  api.patch(`/subjects/${id}/current-topic`, { topicId, unitId }).then((res) => res.data)

export const setNextTopic = (id, topicId, unitId) =>
  api.patch(`/subjects/${id}/next-topic`, { topicId, unitId }).then((res) => res.data)

export const deleteSubject = (id) =>
  api.delete(`/subjects/${id}`)

export const bulkAddUnits = (id, units) =>
  api.post(`/subjects/${id}/units/bulk`, units)

export const listEnrolledStudents = (id) =>
  api.get(`/subjects/${id}/enrollments`).then((res) => res.data)

export const parseSyllabus = (id) =>
  api.get(`/subjects/${id}/syllabus/parse`).then((res) => res.data)

export const createHomework = (id, data) =>
  api.post(`/subjects/${id}/homework`, data).then((res) => res.data)

export const getHomeworkPage = (id, page = 0, filter = 'upcoming') =>
  api.get(`/subjects/${id}/homework`, { params: { filter, page } }).then((res) => res.data)

export const updateHomework = (subjectId, homeWorkId, data) =>
  api.patch(`/subjects/${subjectId}/homework/${homeWorkId}`, data).then((res) => res.data)

export const deleteHomework = (subjectId, homeWorkId) =>
  api.delete(`/subjects/${subjectId}/homework/${homeWorkId}`)

export const removeEnrollment = (subjectId, studentId) =>
  api.delete(`/subjects/${subjectId}/enrollments/${studentId}`)

export const removeYourEnrollment = (subjectId) =>
  api.delete(`/subjects/${subjectId}/enrollments`)
