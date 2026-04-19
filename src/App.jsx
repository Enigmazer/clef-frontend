import { Suspense, lazy } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { UploadProvider } from './context/UploadContext'
import router from './router'
import { PlayerProvider } from './context/PlayerContext'
import BackendReadyGate from './components/BackendReadyGate'

const UploadProgressIndicator = lazy(() => import('./components/UploadProgressIndicator'))
const MaterialPlayerModal = lazy(() => import('./components/MaterialPlayerModal'))
const MiniPlayer = lazy(() => import('./components/MiniPlayer'))
const PersistentAudio = lazy(() => import('./components/PersistentAudio'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // Treat cached data as fresh for 30 s — avoids redundant refetches
      // every time the user navigates between pages (default is 0).
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
          <UploadProvider>
            <AuthProvider>
              <BackendReadyGate>
                <RouterProvider router={router} />
                <Suspense fallback={null}>
                  <UploadProgressIndicator />
                  <PersistentAudio />
                  <MaterialPlayerModal />
                  <MiniPlayer />
                </Suspense>
              </BackendReadyGate>
            </AuthProvider>
          </UploadProvider>
        </PlayerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
