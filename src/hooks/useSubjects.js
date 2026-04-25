import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logger } from '../utils/logger'
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
  removeEnrollment,
  getSubjectUpdatedAt,
} from '../api/subjects'
import { useUploads } from '../context/UploadContext'

// Captured once at module load — safe to use during render (not impure)
const MODULE_NOW = Date.now()

// ─── Local Storage Cache Helpers ──────────────────────────────────────────────
const CACHE_KEY_UPDATED_AT = 'subjects_updated_at'
const CACHE_KEY_DATA = 'subjects_detail_cache'

export function getSubjectCacheTimestamp(id) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY_UPDATED_AT) || '{}')
    return cache[String(id)] || null
  } catch (error) {
    // Log cache read failure for debugging - app will fetch fresh data from server
    logger.cacheError('read (timestamp)', id, error)
    return null // Graceful fallback: treat as cache miss
  }
}

export function getSubjectCacheData(id) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY_DATA) || '{}')
    return cache[String(id)] || null
  } catch (error) {
    // Log cache read failure - app will fetch fresh data from server
    logger.cacheError('read (data)', id, error)
    return null // Graceful fallback: treat as cache miss
  }
}

export function updateSubjectCache(id, data) {
  try {
    const updatedAts = JSON.parse(localStorage.getItem(CACHE_KEY_UPDATED_AT) || '{}')
    const details = JSON.parse(localStorage.getItem(CACHE_KEY_DATA) || '{}')
    
    updatedAts[String(id)] = data.updatedAt
    details[String(id)] = data
    
    localStorage.setItem(CACHE_KEY_UPDATED_AT, JSON.stringify(updatedAts))
    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(details))
    window.dispatchEvent(new Event('subjects_cache_updated'))
  } catch (error) {
    // Log cache write failure - data won't be cached but app continues to function
    // Next load will fetch from server: not ideal but recoverable
    logger.cacheError('write (update)', id, error)
  }
}

export function updateSubjectCachePartial(id, partialData) {
  try {
    const updatedAts = JSON.parse(localStorage.getItem(CACHE_KEY_UPDATED_AT) || '{}')
    const details = JSON.parse(localStorage.getItem(CACHE_KEY_DATA) || '{}')
    
    if (partialData?.updatedAt) {
      updatedAts[String(id)] = partialData.updatedAt
    }
    if (details[String(id)]) {
      details[String(id)] = { ...details[String(id)], ...partialData }
    }
    
    localStorage.setItem(CACHE_KEY_UPDATED_AT, JSON.stringify(updatedAts))
    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(details))
    window.dispatchEvent(new Event('subjects_cache_updated'))
  } catch (error) {
    // Log cache write failure - partial update won't persist but doesn't break app
    logger.cacheError('write (partial)', id, error)
  }
}

export function clearSubjectCache() {
  try {
    localStorage.removeItem(CACHE_KEY_UPDATED_AT)
    localStorage.removeItem(CACHE_KEY_DATA)
    localStorage.removeItem(CACHE_KEY_HOMEWORK_SNAPSHOT)
    window.dispatchEvent(new Event('subjects_cache_updated'))
  } catch (error) {
    logger.cacheError('clear (all)', null, error)
  }
}

// ─── Teacher subject queries ──────────────────────────────────────────────────
export function useTeacherSubjects() {
  return useQuery({
    queryKey: ['subjects', 'teacher'],
    queryFn: listTeacherSubjects,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useArchivedTeacherSubjects() {
  return useQuery({
    queryKey: ['subjects', 'teacher', 'archived'],
    queryFn: listArchivedTeacherSubjects,
  })
}

export function useTeacherSubjectDetail(id) {
  const query = useQuery({
    queryKey: ['subjects', id, 'teacher'],
    queryFn: async () => {
      const localTimestamp = getSubjectCacheTimestamp(id)
      const localData = getSubjectCacheData(id)

      if (!localTimestamp || !localData) {
        return getTeacherSubjectDetails(id)
      }

      try {
        const { updatedAt } = await getSubjectUpdatedAt(id)
        if (updatedAt === localTimestamp) {
          return localData
        } else {
          return getTeacherSubjectDetails(id)
        }
      } catch (error) {
        // Fallback: serve cached data even if freshness check fails
        logger.debug('Cache freshness check failed for teacher subject', { id, error: error?.message })
        return getTeacherSubjectDetails(id)
      }
    },
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })

  // When data is loaded (from cache or fresh fetch), update localStorage so the dot disappears.
  // Use useEffect instead of useMemo to avoid updating other components during render.
  // dataRef is a stable serialized string of query.data — avoids redundant effect runs from
  // object identity changes while still reacting to real data changes.
  const dataRef = query.data ? JSON.stringify(query.data) : null
  useEffect(() => {
    if (query.data?.updatedAt) {
      updateSubjectCache(id, query.data)
    }
  // dataRef is a stable serialized proxy for query.data to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRef])

  return query
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
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useStudentSubjectDetail(id) {
  const query = useQuery({
    queryKey: ['subjects', id, 'student'],
    queryFn: async () => {
      const localTimestamp = getSubjectCacheTimestamp(id)
      const localData = getSubjectCacheData(id)

      if (!localTimestamp || !localData) {
        return getStudentSubjectDetails(id)
      }

      try {
        const { updatedAt } = await getSubjectUpdatedAt(id)
        if (updatedAt === localTimestamp) {
          return localData
        } else {
          return getStudentSubjectDetails(id)
        }
      } catch (error) {
        // Fallback: serve cached data even if freshness check fails
        logger.debug('Cache freshness check failed for student subject', { id, error: error?.message })
        return getStudentSubjectDetails(id)
      }
    },
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  })

  // When data is loaded (from cache or fresh fetch), update localStorage so the dot disappears.
  // dataRef is a stable serialized string of query.data — avoids redundant effect runs from
  // object identity changes while still reacting to real data changes.
  const dataRef = query.data ? JSON.stringify(query.data) : null
  useEffect(() => {
    if (query.data?.updatedAt) {
      updateSubjectCache(id, query.data)
    }
  // dataRef is a stable serialized proxy for query.data to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRef])

  return query
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
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
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
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
      qc.invalidateQueries({ queryKey: ['subjects', 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
  })
}

export function useArchiveUnarchiveSubject(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => archiveUnarchiveSubject(subjectId),
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
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
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'syllabus'] })
    },
  })
}

export function useDeleteSyllabus(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteSyllabus(subjectId),
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'syllabus'] })
    },
  })
}

export function useSetCurrentTopic(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ topicId, unitId }) => setCurrentTopic(subjectId, topicId, unitId),
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
  })
}

export function useSetNextTopic(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ topicId, unitId }) => setNextTopic(subjectId, topicId, unitId),
    onSuccess: (data) => {
      updateSubjectCachePartial(subjectId, data)
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
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
    onSuccess: (newSubject) => {
      // Backend now returns a single SubjectsSummaryStudentResponse.
      // Optimistically prepend it to the cached list before invalidating.
      qc.setQueryData(['subjects', 'student'], (prev) => {
        if (!Array.isArray(prev)) return prev
        const alreadyIn = prev.some((s) => s.id === newSubject.id)
        return alreadyIn ? prev : [newSubject, ...prev]
      })
      qc.invalidateQueries({ queryKey: ['subjects', 'student'] })
    },
  })
}

export function useRemoveEnrollment(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (studentId) => removeEnrollment(subjectId, studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'students'] }),
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

const CACHE_KEY_HOMEWORK_SNAPSHOT = 'subjects_homework_snapshot'

export function getHomeworkSnapshot(subjectId) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY_HOMEWORK_SNAPSHOT) || '{}')
    return cache[String(subjectId)] || null
  } catch (error) {
    // Log cache read failure - app will fetch fresh data
    logger.cacheError('read (homework snapshot)', subjectId, error)
    return null // Graceful fallback: treat as cache miss
  }
}

export function updateHomeworkSnapshot(subjectId, maxCreatedAt, maxUpdatedAt) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY_HOMEWORK_SNAPSHOT) || '{}')
    cache[String(subjectId)] = { maxCreatedAt, maxUpdatedAt }
    localStorage.setItem(CACHE_KEY_HOMEWORK_SNAPSHOT, JSON.stringify(cache))
    window.dispatchEvent(new Event('homework_snapshot_updated'))
  } catch (error) {
    // Log cache write failure - snapshot won't persist but doesn't break app
    logger.cacheError('write (homework snapshot)', subjectId, error)
  }
}

export function getHomeworkMaxDates(content) {
  if (!content || content.length === 0) return { maxCreatedAt: null, maxUpdatedAt: null }
  let maxCreatedAt = content[0].createdAt || null
  let maxUpdatedAt = content[0].updatedAt || null
  for (const hw of content) {
    if (hw.createdAt) {
      if (!maxCreatedAt || new Date(hw.createdAt) > new Date(maxCreatedAt)) maxCreatedAt = hw.createdAt
    }
    if (hw.updatedAt) {
      if (!maxUpdatedAt || new Date(hw.updatedAt) > new Date(maxUpdatedAt)) maxUpdatedAt = hw.updatedAt
    }
  }
  return { maxCreatedAt, maxUpdatedAt }
}

export function useHomeworkUpdateCheck(subjectId) {
  const { data: homeworkPage } = useHomeworkPage(subjectId, 0, 'upcoming')
  
  const [hasUpdate, setHasUpdate] = useState(false)
  
  const maxDates = useMemo(() => {
    return getHomeworkMaxDates(homeworkPage?.content)
  }, [homeworkPage])

  useEffect(() => {
    const checkUpdate = () => {
      if (!homeworkPage) return
      
      const { maxCreatedAt, maxUpdatedAt } = maxDates
      const snapshot = getHomeworkSnapshot(subjectId)
      
      if (!snapshot) {
        if (maxCreatedAt || maxUpdatedAt) {
           setHasUpdate(true)
        } else {
           setHasUpdate(false)
        }
        return
      }
      
      let updateFound = false
      if (maxCreatedAt && (!snapshot.maxCreatedAt || new Date(maxCreatedAt) > new Date(snapshot.maxCreatedAt))) {
        updateFound = true
      }
      if (maxUpdatedAt && (!snapshot.maxUpdatedAt || new Date(maxUpdatedAt) > new Date(snapshot.maxUpdatedAt))) {
        updateFound = true
      }
      
      setHasUpdate(updateFound)
    }

    checkUpdate()
    
    const handleSnapshotUpdated = () => checkUpdate()
    window.addEventListener('homework_snapshot_updated', handleSnapshotUpdated)
    return () => window.removeEventListener('homework_snapshot_updated', handleSnapshotUpdated)
  }, [subjectId, homeworkPage, maxDates])

  return { hasUpdate, ...maxDates }
}
