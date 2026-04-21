export function formatDate(instant) {
  if (!instant) return '—'
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getErrorMsg(err) {
  return err?.response?.data?.message ?? 'Something went wrong.'
}
