import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTopics, toggleTopicComplete, deleteTopics, uploadTopicMaterial, deleteTopicMaterials } from '../api/topics'
import { useUploads } from '../context/UploadContext'

export function useUpdateTopics(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, topics }) => updateTopics(subjectId, unitId, topics),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useToggleTopicComplete(subjectId) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ unitId, topicId }) => toggleTopicComplete(subjectId, unitId, topicId),

    // ── Optimistic update ────────────────────────────────────────────────────
    onMutate: async ({ unitId, topicId }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic data
      await qc.cancelQueries({ queryKey: ['subjects', subjectId, 'teacher'] })

      // Snapshot previous data so we can rollback on error
      const previousData = qc.getQueryData(['subjects', subjectId, 'teacher'])

      // Immediately flip completedAt in the cache
      qc.setQueryData(['subjects', subjectId, 'teacher'], (old) => {
        if (!old) return old
        return {
          ...old,
          units: old.units.map((unit) => {
            if (unit.id !== unitId) return unit
            return {
              ...unit,
              topics: unit.topics.map((topic) => {
                if (topic.id !== topicId) return topic
                // Toggle: if currently done → clear it; if not done → set a timestamp now
                return {
                  ...topic,
                  completedAt: topic.completedAt ? null : new Date().toISOString(),
                }
              }),
            }
          }),
        }
      })

      // Return context for potential rollback
      return { previousData }
    },

    // ── Rollback on error ────────────────────────────────────────────────────
    onError: (_err, _vars, context) => {
      if (context?.previousData !== undefined) {
        qc.setQueryData(['subjects', subjectId, 'teacher'], context.previousData)
      }
    },

    // ── Always re-sync with the server after mutation settles ────────────────
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] })
    },
  })
}

export function useDeleteTopics(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, topicIds }) => deleteTopics(subjectId, unitId, topicIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useUploadTopicMaterial(subjectId) {
  const qc = useQueryClient()
  const { startUpload, updateProgress, completeUpload, failUpload } = useUploads()

  return useMutation({
    mutationFn: async ({ unitId, topicId, file }) => {
      const uploadId = `${topicId}-${Date.now()}`
      startUpload(uploadId, file.name)
      try {
        const result = await uploadTopicMaterial(subjectId, unitId, topicId, file, (progress) => {
          updateProgress(uploadId, progress)
        })
        completeUpload(uploadId)
        return result
      } catch (error) {
        failUpload(uploadId, error?.response?.data?.message || error.message || 'Upload failed')
        throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useDeleteTopicMaterials(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, topicId, materialIds }) => deleteTopicMaterials(subjectId, unitId, topicId, materialIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}
