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
} from '../api/subjects'

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
  return useMutation({
    mutationFn: (file) => uploadSyllabus(subjectId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useDeleteSyllabus(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteSyllabus(subjectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
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

// ─── Student mutations ────────────────────────────────────────────────────────
export function useJoinSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (joinCode) => joinSubject(joinCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', 'student'] }),
  })
}
