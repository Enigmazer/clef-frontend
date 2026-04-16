import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTopics, toggleTopicComplete, deleteTopics } from '../api/topics'

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
