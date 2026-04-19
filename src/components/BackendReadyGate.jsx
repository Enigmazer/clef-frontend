import { useState, useEffect } from 'react'
import api from '../api/axios'
import LoadingScreen from './LoadingScreen'

export default function BackendReadyGate({ children }) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let timeoutId
    let cancelled = false
    const startTime = Date.now()
    const SIX_MINUTES = 6 * 60 * 1000

    const checkHealth = async () => {
      try {
        const response = await api.get('/actuator/health')
        if (!cancelled && response.status === 200 && response.data.status === 'UP') {
          setIsReady(true)
          return
        }
      } catch (err) {
        if (!cancelled) console.warn('Backend pulse check failed:', err.message)
      }

      if (cancelled) return

      const elapsed = Date.now() - startTime
      if (elapsed > SIX_MINUTES) {
        setError(true)
      } else {
        // Poll every 6 seconds
        timeoutId = setTimeout(checkHealth, 6000)
      }
    }

    checkHealth()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  if (isReady) return children

  return (
    <LoadingScreen
      isBackendError={error}
      onRetry={() => window.location.reload()}
    />
  )
}
