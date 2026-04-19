import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label="Toggle dark mode"
      className={`relative flex h-7 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111827] ${dark ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <Sun
        size={11}
        className={`absolute left-1.5 text-yellow-400 transition-opacity duration-200 ease-in-out ${dark ? 'opacity-0' : 'opacity-100'}`}
      />
      <Moon
        size={11}
        className={`absolute right-1.5 text-green-100 transition-opacity duration-200 ease-in-out ${dark ? 'opacity-100' : 'opacity-0'}`}
      />
      <span
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${dark ? 'translate-x-7' : 'translate-x-0.5'}`}
      >
        {dark
          ? <Moon size={11} className="text-green-600" />
          : <Sun size={11} className="text-yellow-500" />
        }
      </span>
    </button>
  )
}
