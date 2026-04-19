import api from './axios'

export const updateTopics = (subjectId, unitId, topics) =>
  api.patch(`/subjects/${subjectId}/units/${unitId}/topics/update`, topics).then((res) => res.data)

export const deleteTopics = (subjectId, unitId, topicIds) =>
  api.delete(`/subjects/${subjectId}/units/${unitId}/topics/delete`, { data: topicIds }).then((res) => res.data)

export const toggleTopicComplete = (subjectId, unitId, topicId) =>
  api.patch(`/subjects/${subjectId}/units/${unitId}/topics/${topicId}/complete/toggle`).then((res) => res.data)

export const getTopicMaterialUrl = (subjectId, unitId, topicId, materialId) =>
  api.get(`/subjects/${subjectId}/units/${unitId}/topics/${topicId}/topic-materials/${materialId}`).then((res) => res.data)

export const uploadTopicMaterial = (subjectId, unitId, topicId, file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/subjects/${subjectId}/units/${unitId}/topics/${topicId}/topic-materials`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
       if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
       }
    }
  }).then((res) => res.data)
}

export const deleteTopicMaterials = (subjectId, unitId, topicId, materialIds) =>
  api.delete(`/subjects/${subjectId}/units/${unitId}/topics/${topicId}/topic-materials`, {
    data: materialIds
  }).then((res) => res.data)
