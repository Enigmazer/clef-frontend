import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function PublicFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-[#2a2a2a] py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:grid md:grid-cols-3 items-center gap-6 md:gap-4 text-sm text-gray-400 dark:text-gray-500">
        {/* Col 1 — logo */}
        <Link to="/" aria-label="Back to home" className="w-full flex justify-center md:block">
          <Logo size="sm" />
        </Link>

        {/* Col 2 — copyright, centered */}
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center order-last md:order-none">
          © {year} Clef. All rights reserved.
        </p>

        {/* Col 3 — nav links, right-aligned */}
        <div className="flex items-center gap-6 justify-center md:justify-end w-full">
          <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Terms
          </Link>
          <Link to="/support" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Support
          </Link>
        </div>
      </div>
    </footer>
  )
}
