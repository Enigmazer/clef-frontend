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
      onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
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
