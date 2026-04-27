import api from './axios'

export const updateUnit = (subjectId, unitId, data) =>
  api.patch(`/subjects/${subjectId}/units/${unitId}`, data).then((res) => res.data)

export const deleteUnit = (subjectId, unitId) =>
  api.delete(`/subjects/${subjectId}/units/${unitId}`).then((res) => res.data)

export const reorderUnits = (subjectId, data) =>
  api.patch(`/subjects/${subjectId}/units/reorder`, data).then((res) => res.data)
