import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, Users, BookOpen, User } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const actionCards = [
  {
    icon: Plus,
    title: 'Create a subject',
    description: 'Set up a new subject, add units and topics, and share the join code with students.',
    to: '/subjects/new',
  },
  {
    icon: Users,
    title: 'Join a subject',
    description: 'Enter a 6-character join code to enroll in a subject and follow along.',
    to: '/enrollments',
  },
  {
    icon: BookOpen,
    title: 'My subjects',
    description: "View and manage all subjects you've created.",
    to: '/subjects',
  },
  {
    icon: User,
    title: 'Profile',
    description: 'Manage your account and set a password for email login.',
    to: '/profile',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect to full pages directly if user hides a dashboard section
  if (user?.hideTeacherSection) {
    return <Navigate to="/enrollments" replace />
  }
  if (user?.hideStudentSection) {
    return <Navigate to="/subjects" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            What would you like to do today?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actionCards.map(({ icon: Icon, title, description, to }) => (
            <div
              key={to}
              onClick={() => navigate(to)}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 cursor-pointer hover:border-green-300 dark:hover:border-green-800 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 bg-green-50 dark:bg-[#052e16] rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 dark:group-hover:bg-green-950/50 transition-colors">
                <Icon size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
