export function formatDate(instant) {
  if (!instant) return ''
  return new Date(instant).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getErrorMessage(err, fallbackMsg) {
  const data = err.response?.data
  if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
    return Object.values(data.fieldErrors)[0]
  }
  return data?.message || fallbackMsg
}
