import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '../components/RootLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import CreateSubjectPage from '../pages/CreateSubjectPage'
import SubjectsPage from '../pages/SubjectsPage'
import SubjectDetailPage from '../pages/SubjectDetailPage'
import UnitsPage from '../pages/UnitsPage'
import EnrollmentsPage from '../pages/EnrollmentsPage'
import StudentSubjectDetailPage from '../pages/StudentSubjectDetailPage'
import ProfilePage from '../pages/ProfilePage'
import TwoFAVerifyPage from '../pages/TwoFAVerifyPage'
import NotFoundPage from '../pages/NotFoundPage'
import PrivacyPage from '../pages/PrivacyPage'
import TermsPage from '../pages/TermsPage'
import SupportPage from '../pages/SupportPage'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/2fa-verify', element: <TwoFAVerifyPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/support', element: <SupportPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/subjects/new', element: <CreateSubjectPage /> },
          { path: '/subjects', element: <SubjectsPage /> },
          { path: '/subjects/:id', element: <SubjectDetailPage /> },
          { path: '/subjects/:id/units', element: <UnitsPage /> },
          { path: '/enrollments', element: <EnrollmentsPage /> },
          { path: '/enrollments/:id', element: <StudentSubjectDetailPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router
