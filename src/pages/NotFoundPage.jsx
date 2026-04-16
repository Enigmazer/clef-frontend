import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col">
      <div className="flex justify-end px-6 py-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="sm" />
          </div>
          <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-2">404</h1>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">Page not found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <div
            onClick={() => navigate('/dashboard')}
            className="inline-block bg-green-500 text-white text-sm font-medium rounded-lg px-5 py-2.5 cursor-pointer hover:bg-green-600 transition-colors"
          >
            Go to Dashboard
          </div>
        </div>
      </div>
    </div>
  )
}
