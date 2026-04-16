import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, ChevronRight, Copy, Check,
  Lock, LockOpen, Layers, Archive, ArchiveRestore,
  CircleDot, Circle, CheckCircle2, AlertCircle, Settings,
  Pencil, Trash2, X, Save, CirclePlay, SkipForward,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import {
  useTeacherSubjectDetail, useEnrolledStudents,
  useLockUnlockSubject, useArchiveUnarchiveSubject,
  useUpdateSubject, useSetSyllabusUrl, useSetCurrentTopic,
  useSetNextTopic, useDeleteSubject,
} from '../hooks/useSubjects'
import { useToggleTopicComplete } from '../hooks/useTopics'

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDate(instant) {
  if (!instant) return '—'
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getErrorMsg(err) {
  return err?.response?.data?.message ?? 'Something went wrong.'
}

// ─── Join code copy pill ───────────────────────────────────────────────────────
function JoinCodePill({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 bg-green-50 dark:bg-[#052e16] border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors group"
    >
      <span className="tracking-widest">{code}</span>
      {copied
        ? <Check size={13} className="text-green-500" />
        : <Copy size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
    </button>
  )
}

// ─── Setting row ──────────────────────────────────────────────────────────────
function SettingRow({ title, description, action }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] sm:max-w-none">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

// ─── Topic picker modal ────────────────────────────────────────────────────────
function TopicPickerModal({ isOpen, onClose, units, mode, onPick, currentId, nextId }) {
  const otherId = mode === 'current' ? nextId : currentId

  const filteredUnits = units.map(unit => ({
    ...unit,
    topics: unit.topics.filter(t =>
      !t.completedAt && (t.id !== otherId || t.id === (mode === 'current' ? currentId : nextId))
    )
  })).filter(unit => unit.topics.length > 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'current' ? 'Set current topic' : 'Set next topic'}
    >
      <div className="space-y-1 max-h-80 overflow-y-auto pt-1 pr-1">
        {filteredUnits.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2 opacity-20" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No available topics to set.</p>
          </div>
        ) : (
          filteredUnits.map(unit => (
            <div key={unit.id} className="pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1 py-2 opacity-70">{unit.title}</p>
              {unit.topics.map(topic => {
                const isSelected = mode === 'current' ? topic.id === currentId : topic.id === nextId
                return (
                  <button
                    key={topic.id}
                    onClick={() => { onPick(topic, unit); onClose() }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isSelected
                      ? 'bg-green-50 dark:bg-[#052e16] text-green-700 dark:text-green-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e1e1e]'
                      }`}
                  >
                    {isSelected
                      ? <Check size={14} className="text-green-500 shrink-0" />
                      : <Circle size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />}
                    <span className="truncate">{topic.title}</span>
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}

// ─── Unit accordion ────────────────────────────────────────────────────────────
function UnitAccordion({ unit, currentTopicId, nextTopicId, onToggleComplete, isArchived }) {
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
                className={`flex items-center gap-3 px-10 py-3 ${isCurrent ? 'bg-green-50 dark:bg-[#052e16]/50'
                  : isNext ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
              >
                <button
                  onClick={() => !isArchived && onToggleComplete(unit.id, topic.id)}
                  disabled={isArchived}
                  title={isDone ? "Mark as incomplete" : "Mark as complete"}
                  className={`mt-0.5 shrink-0 transition-colors outline-none ${!isArchived ? 'cursor-pointer hover:opacity-75' : 'cursor-default'}`}
                >
                  {isDone
                    ? <CheckCircle2 size={15} className="text-green-500" />
                    : isCurrent
                      ? <CircleDot size={15} className="text-green-500 animate-pulse" />
                      : <Circle size={15} className={`text-gray-300 dark:text-gray-600 ${!isArchived ? 'hover:text-green-400 dark:hover:text-green-500' : ''}`} />}
                </button>

                <span className={`text-sm flex-1 ${isDone ? 'text-gray-400 dark:text-gray-500 line-through'
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
export default function SubjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const subjectId = Number(id)
  const { data: subject, isLoading, isError } = useTeacherSubjectDetail(subjectId)
  const { data: students = [], isLoading: studentsLoading } = useEnrolledStudents(subjectId)

  const lockMutation = useLockUnlockSubject(subjectId)
  const archiveMutation = useArchiveUnarchiveSubject(subjectId)
  const updateMutation = useUpdateSubject(subjectId)
  const syllabusMutation = useSetSyllabusUrl(subjectId)
  const currentMutation = useSetCurrentTopic(subjectId)
  const nextMutation = useSetNextTopic(subjectId)
  const deleteMutation = useDeleteSubject()
  const toggleCompleteMutation = useToggleTopicComplete(subjectId)

  // Edit mode
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Syllabus edit
  const [syllabusInput, setSyllabusInput] = useState('')
  const [showSyllabusEdit, setShowSyllabusEdit] = useState(false)

  // Modals & Overlays
  const [showSettings, setShowSettings] = useState(false)
  const [topicPicker, setTopicPicker] = useState(null) // 'current' | 'next' | null
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStudents, setShowStudents] = useState(false)

  // Inline errors
  const [actionError, setActionError] = useState('')

  const currentTopicId = subject?.currentTopic?.id ?? null
  const nextTopicId = subject?.nextTopic?.id ?? null
  const totalTopics = subject?.units?.reduce((a, u) => a + u.topics.length, 0) ?? 0
  const completedTopics = subject?.units?.reduce((a, u) => a + u.topics.filter(t => t.completedAt).length, 0) ?? 0
  const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
  const isSyllabusCompleted = totalTopics > 0 && completedTopics === totalTopics

  // Availability calculation for pickers
  const allUncompleted = subject?.units?.flatMap(u => u.topics.filter(t => !t.completedAt)) || []
  const availableForCurrent = allUncompleted.filter(t => t.id !== nextTopicId).length
  const availableForNext = allUncompleted.filter(t => t.id !== currentTopicId).length

  // Find the topic with the most recent completedAt across all units
  const lastTopic = subject?.units?.flatMap(u =>
    u.topics.filter(t => t.completedAt).map(t => ({ ...t, unitTitle: u.title }))
  ).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0] ?? null

  const openEdit = () => {
    setEditName(subject.name)
    setEditDesc(subject.description ?? '')
    setIsEditing(true)
    setActionError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) { setActionError('Name is required.'); return }
    setActionError('')
    try {
      await updateMutation.mutateAsync({ name: editName.trim(), description: editDesc.trim() || null })
      setIsEditing(false)
    } catch (err) { setActionError(getErrorMsg(err)) }
  }

  const handleLock = async () => {
    setActionError('')
    try { await lockMutation.mutateAsync() }
    catch (err) { setActionError(getErrorMsg(err)) }
  }

  const handleArchive = async () => {
    setActionError('')
    try { await archiveMutation.mutateAsync() }
    catch (err) { setActionError(getErrorMsg(err)) }
  }

  const handleSaveSyllabus = async () => {
    setActionError('')
    try {
      await syllabusMutation.mutateAsync(syllabusInput.trim() || null)
      setShowSyllabusEdit(false)
    } catch (err) { setActionError(getErrorMsg(err)) }
  }

  const handlePickTopic = async (topic, unit, mode) => {
    setActionError('')
    try {
      if (mode === 'current') await currentMutation.mutateAsync({ topicId: topic.id, unitId: unit.id })
      else await nextMutation.mutateAsync({ topicId: topic.id, unitId: unit.id })
    } catch (err) { setActionError(getErrorMsg(err)) }
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteMutation.mutateAsync(subjectId)
      navigate('/subjects', { replace: true })
    } catch (err) { setActionError(getErrorMsg(err)) }
  }

  const handleToggleComplete = async (unitId, topicId) => {
    setActionError('')
    try {
      await toggleCompleteMutation.mutateAsync({ unitId, topicId })
    } catch (err) { setActionError(getErrorMsg(err)) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        <button
          onClick={() => navigate('/subjects')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center gap-1 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          My subjects
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
            Failed to load subject. Please go back and try again.
          </div>
        )}

        {subject && (
          <div className="space-y-6 animate-slide-up">

            {/* Global action error */}
            {actionError && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-slide-up">
                <AlertCircle size={15} className="shrink-0" />
                <span className="flex-1">{actionError}</span>
                <button onClick={() => setActionError('')}><X size={13} className="opacity-50 hover:opacity-100" /></button>
              </div>
            )}

            {/* Title Block */}
            {isEditing ? (
              <div className="bg-white dark:bg-[#1a1a1a] border border-green-300 dark:border-green-800 rounded-xl p-5 space-y-3 animate-fade-in shadow-sm">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Subject name"
                  className="w-full text-lg font-bold bg-transparent text-gray-900 dark:text-white border-b border-gray-200 dark:border-[#2a2a2a] pb-2 outline-none focus:border-green-500 transition-colors"
                  autoFocus
                />
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full text-sm bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    <Save size={13} /> {updateMutation.isPending ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-[#2a2a2a] rounded-xl transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{subject.name}</h1>
                  {subject.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{subject.description}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {subject.locked && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/40">
                        <Lock size={11} /> Locked
                      </span>
                    )}
                    {subject.archived && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-gray-200 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700/50">
                        <Archive size={11} /> Archived
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#222] border border-gray-200 dark:border-[#2a2a2a] rounded-xl transition-colors shadow-sm"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            )}

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
                  {!subject.archived && subject.units?.length > 0 && (
                    <button
                      onClick={() => setTopicPicker('current')}
                      disabled={currentMutation.isPending || (availableForCurrent === 0 && !subject.currentTopic)}
                      className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CirclePlay size={11} />
                      {subject.currentTopic ? 'Change' : 'Set'}
                    </button>
                  )}
                </div>
                {subject.currentTopic
                  ? <>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300 line-clamp-1">{subject.currentTopic.title}</p>
                    <p className="text-[11px] text-green-600/70 dark:text-green-500/70 mt-0.5 truncate">{subject.currentTopic.unit?.title}</p>
                  </>
                  : <p className="text-sm text-green-700/50 dark:text-green-500/50 italic">
                    {isSyllabusCompleted ? "Syllabus Completed" : "Not set"}
                  </p>}
              </div>

              {/* Next */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl px-4 py-3.5 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Up Next</p>
                  {!subject.archived && subject.units?.length > 0 && (
                    <button
                      onClick={() => setTopicPicker('next')}
                      disabled={nextMutation.isPending || (availableForNext === 0 && !subject.nextTopic)}
                      className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward size={11} />
                      {subject.nextTopic ? 'Change' : 'Set'}
                    </button>
                  )}
                </div>
                {subject.nextTopic
                  ? <>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 line-clamp-1">{subject.nextTopic.title}</p>
                    <p className="text-[11px] text-blue-600/70 dark:text-blue-500/70 mt-0.5 truncate">{subject.nextTopic.unit?.title}</p>
                  </>
                  : <p className="text-sm text-blue-700/50 dark:text-blue-500/50 italic">
                    {isSyllabusCompleted ? "Syllabus Completed" : "Not set"}
                  </p>}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Curriculum</h2>
                {!subject.archived && (
                  <button
                    onClick={() => navigate(`/subjects/${id}/units`)}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                  >
                    Manage units
                  </button>
                )}
              </div>
              {(!subject.units || subject.units.length === 0) ? (
                <div className="bg-white dark:bg-[#1a1a1a] border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl px-6 py-8 text-center">
                  <Layers size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No units added yet</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {subject.units.map(unit => (
                    <UnitAccordion
                      key={unit.id}
                      unit={unit}
                      currentTopicId={currentTopicId}
                      nextTopicId={nextTopicId}
                      onToggleComplete={handleToggleComplete}
                      isArchived={subject.archived}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Settings Modal */}
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Subject Settings">
          <div className="pt-2">
            {subject?.archived ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ArchiveRestore size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Subject is archived</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Unarchive it to manage settings, edit curriculum, and set topics.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleArchive}
                    disabled={archiveMutation.isPending}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArchiveRestore size={14} />
                    {archiveMutation.isPending ? 'Unarchiving…' : 'Unarchive Subject'}
                  </button>
                  <button
                    onClick={() => { setShowSettings(false); setShowDeleteConfirm(true) }}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <SettingRow
                  title="Subject Details"
                  description="Rename the subject or update its description."
                  action={<button onClick={() => { setShowSettings(false); openEdit() }} className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-medium transition-colors">Edit details</button>}
                />

                <SettingRow
                  title="Join Code"
                  description="Share this 6-character code with your students so they can enroll in this subject."
                  action={<JoinCodePill code={subject?.joinCode} />}
                />

                <SettingRow
                  title="Enrollment"
                  description={subject?.locked ? 'Locked — new students cannot join.' : 'Open — students can join with the join code.'}
                  action={
                    <button
                      onClick={handleLock}
                      disabled={lockMutation.isPending}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {lockMutation.isPending
                        ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : subject?.locked ? <LockOpen size={12} /> : <Lock size={12} />}
                      {subject?.locked ? 'Unlock' : 'Lock'}
                    </button>
                  }
                />

                <SettingRow
                  title="Syllabus"
                  description="Link to an external syllabus file (Google Drive, PDF, etc)."
                  action={
                    showSyllabusEdit ? (
                      <div className="flex items-center justify-end gap-2">
                        <input type="url" value={syllabusInput} onChange={e => setSyllabusInput(e.target.value)} placeholder="https://..." className="w-32 text-xs bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" autoFocus />
                        <button onClick={handleSaveSyllabus} disabled={syllabusMutation.isPending} className="text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md px-2.5 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{syllabusMutation.isPending ? '…' : 'Save'}</button>
                        <button onClick={() => setShowSyllabusEdit(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={13} /></button>
                      </div>
                    ) : subject?.syllabusFileUrl ? (
                      <div className="flex items-center gap-2">
                        <a href={subject.syllabusFileUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline truncate max-w-[120px] text-xs font-medium">{subject.syllabusFileUrl}</a>
                        <button onClick={() => { setSyllabusInput(subject.syllabusFileUrl); setShowSyllabusEdit(true) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Pencil size={11} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setSyllabusInput(''); setShowSyllabusEdit(true) }} className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-medium transition-colors">+ Add link</button>
                    )
                  }
                />

                <SettingRow
                  title="Enrolled Students"
                  description={studentsLoading ? 'Loading…' : `${students.length} students have joined.`}
                  action={<button onClick={() => setShowStudents(v => !v)} className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 font-medium transition-colors">{showStudents ? 'Hide' : 'View list'}</button>}
                />

                {showStudents && (
                  <div className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 animate-fade-in mx-1 mt-1 mb-3">
                    {!studentsLoading && students.length === 0 && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center">No students enrolled yet.</p>
                    )}
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {students.map(s => (
                        <div key={s.id} className="flex items-center gap-3">
                          {s.avatarUrl
                            ? <img
                              src={s.avatarUrl}
                              alt={s.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                            />
                            : null}
                          <div
                            className="w-8 h-8 rounded-full bg-green-100 dark:bg-[#052e16] text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-bold"
                            style={{ display: s.avatarUrl ? 'none' : 'flex' }}
                          >
                            {s.fullName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.fullName}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto tabular-nums">Joined {formatDate(s.joinedAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-[#2a2a2a] mt-2">
                  <button
                    onClick={() => { setShowSettings(false); handleArchive() }}
                    disabled={archiveMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Archive size={12} />
                    {archiveMutation.isPending ? 'Archiving…' : 'Archive Subject'}
                  </button>
                  <button
                    onClick={() => { setShowSettings(false); setShowDeleteConfirm(true) }}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete Subject
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Topic picker modal */}
        {subject?.units && topicPicker && !subject.archived && (
          <TopicPickerModal
            isOpen={!!topicPicker}
            onClose={() => setTopicPicker(null)}
            units={subject.units}
            mode={topicPicker}
            currentId={currentTopicId}
            nextId={nextTopicId}
            onPick={(topic, unit) => handlePickTopic(topic, unit, topicPicker)}
          />
        )}

        {/* Delete confirm modal */}
        <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete subject">
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This will permanently delete <strong className="text-gray-900 dark:text-white">{subject?.name}</strong> and all its units and topics. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
