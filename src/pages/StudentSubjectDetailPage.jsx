import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, ChevronRight, Layers, CircleDot, Circle, CheckCircle2, AlertCircle, Link2, Phone
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useStudentSubjectDetail } from '../hooks/useSubjects'

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDate(instant) {
  if (!instant) return '—'
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Unit accordion ────────────────────────────────────────────────────────────
function UnitAccordion({ unit, currentTopicId, nextTopicId }) {
  const [open, setOpen] = useState(true)
  const completedCount = unit.topics.filter(t => t.completedAt).length

  return (
    <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden mb-3 last:mb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Layers size={15} className="text-green-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{unit.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">{completedCount}/{unit.topics.length} done</span>
          {open ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a] bg-gray-50 dark:bg-[#111] animate-fade-in">
          {unit.topics.length === 0 && (
            <p className="px-10 py-3 text-xs text-gray-400 italic">No topics in this unit.</p>
          )}
          {unit.topics.map(topic => {
            const isCurrent = topic.id === currentTopicId
            const isNext = topic.id === nextTopicId
            const isDone = !!topic.completedAt
            return (
              <div
                key={topic.id}
                className={`flex items-center gap-3 px-10 py-3 ${
                  isCurrent ? 'bg-green-50 dark:bg-[#052e16]/50'
                  : isNext ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                {isDone
                  ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                  : isCurrent
                  ? <CircleDot size={15} className="text-green-500 shrink-0 animate-pulse" />
                  : <Circle size={15} className="text-gray-300 dark:text-gray-600 shrink-0" />}

                <span className={`text-sm flex-1 ${
                  isDone ? 'text-gray-400 dark:text-gray-500 line-through'
                  : isCurrent ? 'text-green-700 dark:text-green-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300'
                }`}>{topic.title}</span>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md">Current</span>}
                  {isNext && !isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md">Next</span>}
                  {isDone && <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(topic.completedAt)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function StudentSubjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const subjectId = Number(id)
  
  // Directly hit the student's read-only endpoint
  const { data: subject, isLoading, isError } = useStudentSubjectDetail(subjectId)

  const currentTopicId = subject?.currentTopic?.id ?? null
  const nextTopicId    = subject?.nextTopic?.id ?? null
  const totalTopics    = subject?.units?.reduce((a, u) => a + u.topics.length, 0) ?? 0
  const completedTopics = subject?.units?.reduce((a, u) => a + u.topics.filter(t => t.completedAt).length, 0) ?? 0
  const progressPct    = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const lastTopic = subject?.units?.flatMap(u =>
    u.topics.filter(t => t.completedAt).map(t => ({ ...t, unitTitle: u.title }))
  ).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0] ?? null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        <button
          onClick={() => navigate('/enrollments')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center gap-1 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          My enrollments
        </button>

        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-100 dark:bg-[#222] rounded w-3/4" />
            <div className="h-32 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl mt-6" />
            <div className="h-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={15} />
            Failed to load subject. Your teacher may have archived or locked it.
          </div>
        )}

        {subject && (
          <div className="space-y-6 animate-slide-up">
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{subject.name}</h1>
                {subject.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{subject.description}</p>
                )}
                {subject.syllabusFileUrl && (
                  <div className="mt-4">
                    <a href={subject.syllabusFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">
                      <Link2 size={15} />
                      View Syllabus
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Card */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl w-full sm:w-fit mt-2">
              <img
                src={subject.teacherAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.teacherName || 'Teacher')}&background=random&color=fff`}
                alt="Teacher avatar"
                className="w-12 h-12 rounded-full object-cover shrink-0"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.teacherName || 'T')}&background=6ee7b7&color=065f46` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Instructor</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{subject.teacherName}</p>
                {subject.teacherPhoneNumbers?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {subject.teacherPhoneNumbers.map((phone, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Phone size={11} className="text-gray-400" />
                        {phone.phoneNumber}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {totalTopics > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{completedTopics} of {totalTopics} topics completed</p>
              </div>
            )}

            {/* Topic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Last */}
              <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/40 rounded-xl px-4 py-3.5 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">Last Taught</p>
                {lastTopic ? (
                  <>
                    <p className="text-sm font-semibold text-violet-800 dark:text-violet-300 line-clamp-1">{lastTopic.title}</p>
                    <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      <p className="text-[11px] text-violet-600/70 dark:text-violet-500/70 truncate">{lastTopic.unitTitle}</p>
                      <span className="text-violet-300 dark:text-violet-700">·</span>
                      <p className="text-[11px] text-violet-600/70 dark:text-violet-500/70">{formatDate(lastTopic.completedAt)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-violet-700/50 dark:text-violet-400/50 italic">No last topic</p>
                )}
              </div>

              {/* Current */}
              <div className="bg-green-50 dark:bg-[#052e16]/60 border border-green-200 dark:border-green-900/50 rounded-xl px-4 py-3.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">Currently Teaching</p>
                </div>
                {subject.currentTopic
                  ? <>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300 line-clamp-1">{subject.currentTopic.title}</p>
                      <p className="text-[11px] text-green-600/70 dark:text-green-500/70 mt-0.5 truncate">{subject.currentTopic.unit?.title}</p>
                    </>
                  : <p className="text-sm text-green-700/50 dark:text-green-500/50 italic">Not set</p>}
              </div>

              {/* Next */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl px-4 py-3.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Up Next</p>
                </div>
                {subject.nextTopic
                  ? <>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 line-clamp-1">{subject.nextTopic.title}</p>
                      <p className="text-[11px] text-blue-600/70 dark:text-blue-500/70 mt-0.5 truncate">{subject.nextTopic.unit?.title}</p>
                    </>
                  : <p className="text-sm text-blue-700/50 dark:text-blue-500/50 italic">Not set</p>}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Curriculum</h2>
              </div>
              {(!subject.units || subject.units.length === 0) ? (
                <div className="bg-white dark:bg-[#1a1a1a] border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl px-6 py-8 text-center">
                  <Layers size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No units added yet</p>
                </div>
              ) : (
                <div>
                  {subject.units.map(unit => (
                    <UnitAccordion key={unit.id} unit={unit} currentTopicId={currentTopicId} nextTopicId={nextTopicId} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
