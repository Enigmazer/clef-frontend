import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <div
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      className="relative flex items-center w-14 h-7 rounded-full cursor-pointer focus:outline-none"
      style={{
        backgroundColor: dark ? '#22c55e' : '#e5e7eb',
        transition: 'background-color 300ms ease-in-out',
      }}
    >
      <Sun
        size={11}
        className="absolute left-1.5 text-yellow-400"
        style={{ opacity: dark ? 0 : 1, transition: 'opacity 200ms ease' }}
      />
      <Moon
        size={11}
        className="absolute right-1.5 text-green-100"
        style={{ opacity: dark ? 1 : 0, transition: 'opacity 200ms ease' }}
      />
      <span
        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
        style={{
          transform: dark ? 'translateX(28px)' : 'translateX(2px)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        {dark
          ? <Moon size={11} className="text-green-600" />
          : <Sun size={11} className="text-yellow-500" />
        }
      </span>
    </div>
  )
}
