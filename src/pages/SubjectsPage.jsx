import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Lock, ChevronRight, Calendar, Archive } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useTeacherSubjects, useArchivedTeacherSubjects } from '../hooks/useSubjects'
import { logger } from '../utils/logger'

function formatDate(instant) {
  if (!instant) return ''
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded w-2/5" />
        <div className="h-5 bg-gray-100 dark:bg-[#222] rounded w-12" />
      </div>
      <div className="h-3.5 bg-gray-100 dark:bg-[#222] rounded w-3/4 mb-2" />
      <div className="h-3.5 bg-gray-100 dark:bg-[#222] rounded w-1/2 mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-100 dark:bg-[#222] rounded w-24" />
        <div className="h-3 bg-gray-100 dark:bg-[#222] rounded w-16" />
      </div>
    </div>
  )
}

export default function SubjectsPage() {
  const navigate = useNavigate()
  const { data: subjects = [], isLoading, isError } = useTeacherSubjects()
  const { data: archived = [], isLoading: isArchivedLoading } = useArchivedTeacherSubjects()

  const [localUpdatedAts, setLocalUpdatedAts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('subjects_updated_at') || '{}')
    } catch (error) {
      logger.warn('Failed to load cached subject timestamps on initial render', { error: error?.message })
      return {}
    }
  })

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setLocalUpdatedAts(JSON.parse(localStorage.getItem('subjects_updated_at') || '{}'))
      } catch (error) {
        // Log cache update listener failure - UI won't reflect cache updates but core functionality works
        logger.debug('Failed to sync cached subject timestamps on update event', { error: error?.message })
      }
    }
    window.addEventListener('subjects_cache_updated', handleUpdate)
    return () => window.removeEventListener('subjects_cache_updated', handleUpdate)
  }, [])


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Subjects</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLoading ? 'Loading…' : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects/new')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            New subject
          </button>
        </div>

        {/* Error */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-6">
            Failed to load subjects. Please refresh.
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-green-50 dark:bg-[#052e16] rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={26} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No subjects yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Create your first subject and share the join code with your students.
            </p>
            <button
              onClick={() => navigate('/subjects/new')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={16} />
              Create a subject
            </button>
          </div>
        )}

        {/* Subject cards */}
        {!isLoading && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => navigate(`/subjects/${subject.id}`)}
                className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 cursor-pointer hover:border-green-300 dark:hover:border-green-800 hover:shadow-sm transition-all animate-slide-up"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1 flex items-center gap-2">
                    {subject.name}
                    {localUpdatedAts[String(subject.id)] !== subject.updatedAt && (
                      <span className="relative flex h-2 w-2 shrink-0" title="Updates available">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {subject.locked && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 px-2 py-0.5 rounded-md">
                        <Lock size={9} />
                        Locked
                      </span>
                    )}
                  </div>
                </div>

                {subject.description ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {subject.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic mb-4">No description</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(subject.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-semibold text-green-600 dark:text-green-500">
                    {subject.joinCode}
                    <ChevronRight size={13} className="text-gray-400 dark:text-gray-600 -mr-1 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archived Subjects */}
        {!isArchivedLoading && archived.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Archive size={18} className="text-gray-400" />
              Archived Subjects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-80 hover:opacity-100 transition-opacity duration-300">
              {archived.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                  className="group bg-gray-50/50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 cursor-pointer hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-sm transition-all animate-slide-up"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                      {subject.name}
                    </h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-500 px-2 py-0.5 rounded-md">
                        Archived
                      </span>
                    </div>
                  </div>

                  {subject.description ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-2 mb-4">
                      {subject.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-300 dark:text-gray-700 italic mb-4">No description</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(subject.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-semibold text-violet-600 dark:text-violet-500 opacity-60 group-hover:opacity-100 transition-opacity">
                      {subject.joinCode}
                      <ChevronRight size={13} className="text-gray-400 dark:text-gray-600 -mr-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
