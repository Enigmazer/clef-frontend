import { Clock } from 'lucide-react'
import Navbar from './Navbar'

export default function PlaceholderPage({ featureName }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-10 text-center max-w-sm w-full mx-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-[#052e16] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-green-500 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{featureName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">This feature is coming soon.</p>
        </div>
      </div>
    </div>
  )
}
