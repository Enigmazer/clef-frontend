import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUnit, deleteUnit } from '../api/units'

export function useUpdateUnit(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ unitId, data }) => updateUnit(subjectId, unitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}

export function useDeleteUnit(subjectId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (unitId) => deleteUnit(subjectId, unitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects', subjectId, 'teacher'] }),
  })
}
