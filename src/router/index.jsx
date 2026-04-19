import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '../components/RootLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import RouteFallback from './RouteFallback'
import {
  LandingPage,
  LoginPage,
  CreateSubjectPage,
  UnitsPage,
  EnrollmentsPage,
  ProfilePage,
  TwoFAVerifyPage,
  NotFoundPage,
  PrivacyPage,
  TermsPage,
  SupportPage,
} from './lazyPages'

import DashboardPage from '../pages/DashboardPage'
import SubjectsPage from '../pages/SubjectsPage'
import SubjectDetailPage from '../pages/SubjectDetailPage'
import StudentSubjectDetailPage from '../pages/StudentSubjectDetailPage'

function withSuspense(Component) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: withSuspense(LandingPage) },
      { path: '/login', element: withSuspense(LoginPage) },
      { path: '/2fa-verify', element: withSuspense(TwoFAVerifyPage) },
      { path: '/privacy', element: withSuspense(PrivacyPage) },
      { path: '/terms', element: withSuspense(TermsPage) },
      { path: '/support', element: withSuspense(SupportPage) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/subjects/new', element: withSuspense(CreateSubjectPage) },
          { path: '/subjects', element: <SubjectsPage /> },
          { path: '/subjects/:id', element: <SubjectDetailPage /> },
          { path: '/subjects/:id/units', element: withSuspense(UnitsPage) },
          { path: '/enrollments', element: withSuspense(EnrollmentsPage) },
          { path: '/enrollments/:id', element: <StudentSubjectDetailPage /> },
          { path: '/profile', element: withSuspense(ProfilePage) },
        ],
      },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
])

export default router
