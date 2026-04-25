import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

function NavAvatar({ user }) {
  const [imgError, setImgError] = useState(false)
  const initial = user?.fullName?.[0]?.toUpperCase() ?? '?'
  const cls = 'w-8 h-8 rounded-full'

  if (user?.avatarUrl && !imgError) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className={`${cls} object-cover`}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className={`${cls} bg-green-100 dark:bg-[#052e16] flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-semibold`}>
      {initial}
    </div>
  )
}

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/enrollments', label: 'Enrollments' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const showNavTabs = !user?.hideTeacherSection && !user?.hideStudentSection;
  const visibleLinks = showNavTabs ? navLinks : [];

  return (
    <>
    <nav className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#2a2a2a] px-4 sm:px-6 py-3 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-3 sm:gap-8">
        {visibleLinks.length > 0 && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-1.5 -ml-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <Link to="/dashboard" className="shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
          <Logo size="sm" />
        </Link>
        <div className="hidden sm:flex items-center gap-1">
          {visibleLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                  ? 'bg-green-50 dark:bg-[#052e16] text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <ThemeToggle />
        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
          <NavAvatar user={user} />
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium hidden sm:block">
            {user?.fullName}
          </span>
        </Link>
        <div
          onClick={() => { setIsMobileMenuOpen(false); logout(); }}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          Sign out
        </div>
      </div>
    </nav>

    {/* Mobile Menu Open State */}
    {isMobileMenuOpen && (
      <div className="sm:hidden bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#2a2a2a] absolute w-full z-10 shadow-lg px-4 py-3">
        <div className="flex flex-col gap-1">
          {visibleLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                  ? 'bg-green-50 dark:bg-[#052e16] text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    )}
    </>
  )
}
