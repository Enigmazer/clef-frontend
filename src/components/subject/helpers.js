export function formatDate(instant) {
  if (!instant) return '—'
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getErrorMsg(err) {
  const data = err?.response?.data
  if (data?.fieldErrors) {
    const firstFieldError = Object.values(data.fieldErrors)[0]
    if (firstFieldError) return firstFieldError
  }
  return data?.message ?? 'Something went wrong.'
}
