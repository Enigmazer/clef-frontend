import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const LEGAL_PATHS = ['/privacy', '/terms', '/support']

export default function PublicPageNav() {
  const { pathname } = useLocation()
  const isLegalPage = LEGAL_PATHS.includes(pathname)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#111111]/90 backdrop-blur-md border-b border-gray-100 dark:border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {isLegalPage ? (
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        ) : (
          <Link to="/"><Logo size="sm" /></Link>
        )}

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
