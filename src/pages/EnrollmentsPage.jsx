import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useStudentSubjects, useJoinSubject } from '../hooks/useSubjects'
import { logger } from '../utils/logger'

function formatDate(instant) {
  if (!instant) return ''
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded w-2/5 mb-2" />
      <div className="h-3.5 bg-gray-100 dark:bg-[#222] rounded w-3/4 mb-1" />
      <div className="h-3 bg-gray-100 dark:bg-[#222] rounded w-1/3 mt-3" />
    </div>
  )
}

export default function EnrollmentsPage() {
  const navigate = useNavigate()
  const { data: subjects = [], isLoading, isError } = useStudentSubjects()
  const joinMutation = useJoinSubject()

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

  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) { setJoinError('Join code must be 6 characters.'); return }
    setJoinError('')
    setJoinSuccess('')
    try {
      await joinMutation.mutateAsync(code)
      setJoinSuccess('Joined successfully!')
      setJoinCode('')
      setTimeout(() => { setShowJoin(false); setJoinSuccess('') }, 1500)
    } catch (err) {
      setJoinError(err?.response?.data?.message ?? 'Invalid or expired join code.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Enrolled Subjects</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLoading ? 'Loading…' : `${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => { setShowJoin(v => !v); setJoinError(''); setJoinSuccess(''); setJoinCode('') }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Join a subject
          </button>
        </div>

        {/* Join form */}
        {showJoin && (
          <div className="bg-white dark:bg-[#1a1a1a] border border-green-300 dark:border-green-800 rounded-xl p-5 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Join a subject</h2>
              <button onClick={() => setShowJoin(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={15} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Enter the 6-character join code shared by your teacher.
            </p>

            {joinError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400 mb-3 animate-slide-up">
                <AlertCircle size={13} className="shrink-0" />
                {joinError}
              </div>
            )}
            {joinSuccess && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-[#052e16]/60 border border-green-200 dark:border-green-900/50 rounded-xl px-3 py-2.5 text-sm text-green-700 dark:text-green-400 mb-3 animate-slide-up">
                <CheckCircle2 size={13} className="shrink-0" />
                {joinSuccess}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ABC123"
                maxLength={6}
                className="flex-1 border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                autoFocus
              />
              <button
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {joinMutation.isPending ? 'Joining…' : 'Join'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-6">
            <AlertCircle size={15} />
            Failed to load subjects. Please refresh.
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && subjects.length === 0 && !showJoin && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-green-50 dark:bg-[#052e16] rounded-2xl flex items-center justify-center mb-4">
              <Users size={26} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Not enrolled anywhere yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Ask your teacher for a 6-character join code and enter it here.
            </p>
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={16} />
              Join a subject
            </button>
          </div>
        )}

        {/* Subject cards */}
        {!isLoading && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.map(subject => (
              <div
                key={subject.id}
                onClick={() => navigate(`/enrollments/${subject.id}`)}
                className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 cursor-pointer hover:border-green-300 dark:hover:border-green-800 hover:shadow-sm transition-all animate-slide-up"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1 flex items-center gap-2">
                    {subject.name}
                    {localUpdatedAts[String(subject.id)] !== subject.updatedAt && (
                      <span className="relative flex h-2 w-2 shrink-0" title="Updates available">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                    )}
                  </h2>
                  <ChevronRight size={15} className="text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
                </div>

                {subject.description
                  ? <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{subject.description}</p>
                  : <p className="text-sm text-gray-400 dark:text-gray-600 italic mb-3">No description</p>}

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <img
                      src={subject.teacherAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.teacherName || 'Teacher')}&background=random&color=fff`}
                      alt="Teacher avatar"
                      className="w-5 h-5 rounded-full object-cover"
                      onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.teacherName || 'T')}&background=6ee7b7&color=065f46` }}
                    />
                    {subject.teacherName}
                  </span>
                  <span>Joined {formatDate(subject.joinedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
