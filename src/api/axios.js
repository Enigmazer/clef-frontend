import axios from 'axios'
import { tokenStore } from './tokenStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the refreshToken cookie (SameSite=Strict) via Vercel proxy (same-origin)
})

// Request interceptor — inject Bearer token if available in memory
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const url = originalRequest.url ?? ''
    let skipRefresh = false
    try {
      const pathname = new URL(url, import.meta.env.VITE_API_URL).pathname
      skipRefresh = pathname.endsWith('/auth/refresh') || pathname.endsWith('/auth/login')
    } catch {
      skipRefresh = url.includes('/auth/refresh') || url.includes('/auth/login')
    }

    if (error.response?.status === 401 && !originalRequest._retry && !skipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // withCredentials sends the Strict refreshToken cookie via the Vercel proxy (same-origin)
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        // New access token is in the response body (not a cookie)
        const newToken = res.data.accessToken
        tokenStore.set(newToken)
        processQueue(null, newToken)
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        tokenStore.clear()
        processQueue(refreshError)
        if (window.location.pathname !== '/login' && !url.includes('/users/me')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
