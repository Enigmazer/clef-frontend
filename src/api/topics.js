import api from './axios'

export const updateTopics = (subjectId, unitId, topics) =>
  api.patch(`/subjects/${subjectId}/units/${unitId}/topics/update`, topics).then((res) => res.data)

export const deleteTopics = (subjectId, unitId, topicIds) =>
  api.delete(`/subjects/${subjectId}/units/${unitId}/topics/delete`, { data: topicIds }).then((res) => res.data)

export const toggleTopicComplete = (subjectId, unitId, topicId) =>
  api.patch(`/subjects/${subjectId}/units/${unitId}/topics/${topicId}/complete/toggle`).then((res) => res.data)
