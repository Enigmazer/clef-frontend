import React from 'react'
import { useRouteError, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function ErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center p-6 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-8 max-w-lg w-full text-center shadow-xl mx-auto">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          We encountered an unexpected error. Don't worry, it's not your fault. You can refresh the page or head back safely.
        </p>
        
        {error && (
          <div className="bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-[#222222] rounded-xl p-4 mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-gray-600 dark:text-gray-400">
            {error.statusText || error.message || "Unknown Application Error"}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
          >
            <RefreshCw size={16} />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}
