import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createSubject,
  listTeacherSubjects,
  listArchivedTeacherSubjects,
  listStudentSubjects,
  getTeacherSubjectDetails,
  getStudentSubjectDetails,
  updateSubject,
  bulkAddUnits,
  lockUnlockSubject,
  archiveUnarchiveSubject,
  uploadSyllabus,
  deleteSyllabus,
  setCurrentTopic,
  setNextTopic,
  deleteSubject,
  joinSubject,
  listEnrolledStudents,
  parseSyllabus,
  getSyllabusUrl,
  getTeacherProfile,
  createHomework,
  getHomeworkPage,
  updateHomework,
  deleteHomework,
} from '../api/subjects'
import { useUploads } from '../context/UploadContext'

// Captured once at module load — safe to use during render (not impure)
const MODULE_NOW = Date.now()

// ─── Teacher subject queries ──────────────────────────────────────────────────
export function useTeacherSubjects() {
  return useQuery({
    queryKey: ['subjects', 'teacher'],
    queryFn: listTeacherSubjects,
  })
}

export function useArchivedTeacherSubjects() {
  return useQuery({
    queryKey: ['subjects', 'teacher', 'archived'],
    queryFn: listArchivedTeacherSubjects,
  })
}

export function useTeacherSubjectDetail(id) {
  return useQuery({
    queryKey: ['subjects', id, 'teacher'],
    queryFn: () => getTeacherSubjectDetails(id),
    enabled: !!id,
  })
}

export function useEnrolledStudents(subjectId) {
  return useQuery({
    queryKey: ['subjects', subjectId, 'students'],
    queryFn: () => listEnrolledStudents(subjectId),
    enabled: !!subjectId,
  })
}

// ─── Student subject queries ──────────────────────────────────────────────────
export function useStudentSubjects() {
  return useQuery({
    queryKey: ['subjects', 'student'],
    queryFn: listStudentSubjects,
  })
}

export function useStudentSubjectDetail(id) {
  return useQuery({
    queryKey: ['subjects', id, 'student'],
    queryFn: () => getStudentSubjectDetails(id),
    enabled: !!id,
  })
}

// ─── Shared queries ──────────────────────────────────────────────────────────
export function useSyllabusUrl(id, enabled = true) {
  return useQuery({
    queryKey: ['subjects', id, 'syllabus'],
    queryFn: () => getSyllabusUrl(id),
    enabled: !!id && enabled,
    retry: false, // Don't retry if it returns an error (e.g., 404 meaning no syllabus)
  })
}

export function useTeacherProfile(id, enabled = true) {
  return useQuery({
    queryKey: ['subjects', id, 'teacherProfile'],
    queryFn: () => getTeacherProfile(id),
    enabled: !!id && enabled,
  })
}

// ─── Teacher mutations ────────────────────────────────────────────────────────
export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', 'teacher'] }),
  })
}

export function useUpdateSubject(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => updateSubject(subjectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
  })
}

export function useBulkAddUnits(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (units) => bulkAddUnits(subjectId, units),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useLockUnlockSubject(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => lockUnlockSubject(subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
  })
}

export function useArchiveUnarchiveSubject(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => archiveUnarchiveSubject(subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', 'teacher', 'archived'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
  })
}

export function useUploadSyllabus(subjectId) {
  const qc = useQueryClient()
  const { startUpload, updateProgress, completeUpload, failUpload } = useUploads()
  return useMutation({
    mutationFn: async (file) => {
      const uploadId = `syllabus-${subjectId}-${Date.now()}`
      startUpload(uploadId, file.name || 'Syllabus')
      try {
        const result = await uploadSyllabus(subjectId, file, (progress) => {
          updateProgress(uploadId, progress)
        })
        completeUpload(uploadId)
        return result
      } catch (error) {
        failUpload(uploadId, error?.response?.data?.message || error.message || 'Upload failed')
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'syllabus'] })
    },
  })
}

export function useDeleteSyllabus(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteSyllabus(subjectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'syllabus'] })
    },
  })
}

export function useSetCurrentTopic(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ topicId, unitId }) => setCurrentTopic(subjectId, topicId, unitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useSetNextTopic(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ topicId, unitId }) => setNextTopic(subjectId, topicId, unitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useDeleteSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', 'teacher'] }),
  })
}

// ─── Syllabus parsing ─────────────────────────────────────────────────────────
export function useParseSyllabus(subjectId) {
  return useMutation({
    mutationFn: () => parseSyllabus(subjectId),
  })
}

// ─── Student mutations ────────────────────────────────────────────────────────
export function useJoinSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (joinCode) => joinSubject(joinCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', 'student'] }),
  })
}

// ─── Homework mutations & queries ─────────────────────────────────────────────
export function useCreateHomework(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createHomework(subjectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'homework'] }),
  })
}

export function useUpdateHomework(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ homeWorkId, data }) => updateHomework(subjectId, homeWorkId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'homework'] }),
  })
}

export function useDeleteHomework(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (homeWorkId) => deleteHomework(subjectId, homeWorkId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'homework'] }),
  })
}

export function useHomeworkPage(subjectId, page = 0, filter = 'upcoming') {
  return useQuery({
    queryKey: ['subjects', subjectId, 'homework', filter, page],
    queryFn: () => getHomeworkPage(subjectId, page, filter),
    enabled: !!subjectId,
  })
}

export function useActiveHomeworkTopicIds(subjectId) {
  const { data: homeworkPage } = useHomeworkPage(subjectId, 0, 'upcoming')

  return useMemo(() => {
    const ids = new Set()
    if (!homeworkPage?.content?.length) return ids

    const nowMs = MODULE_NOW
    const nowDate = new Date(nowMs)

    for (const hw of homeworkPage.content) {
      const dueMs = new Date(hw.dueDate).getTime()
      const dueDateObj = new Date(hw.dueDate)
      
      const isDueToday = dueDateObj.toDateString() === nowDate.toDateString()
      const isFuture = dueMs > nowMs
      
      if (isDueToday || isFuture) {
        for (const topic of hw.topics ?? []) {
          ids.add(topic.id)
        }
      }
    }
    return ids
  }, [homeworkPage])
}
