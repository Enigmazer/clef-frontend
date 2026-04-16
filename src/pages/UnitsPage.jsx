import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Plus, Trash2, ChevronDown, ChevronRight,
  Layers, BookOpen, AlertCircle, CheckCircle2, X, Edit2, Save
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { useTeacherSubjectDetail, useBulkAddUnits } from '../hooks/useSubjects'
import { useUpdateUnit, useDeleteUnit } from '../hooks/useUnits'
import { useUpdateTopics, useDeleteTopics } from '../hooks/useTopics'

function buildDefaultUnits(count, existingCount) {
  return Array.from({ length: count }, (_, i) => {
    const unitNum = existingCount + i + 1
    return {
      _unitNum: unitNum,
      title: `Unit ${unitNum} - `,
      topics: [{ title: '' }],
    }
  })
}

// ─── Existing unit viewer and editor ──────────────────────────────────────────
function ExistingUnitRow({ subjectId, unit }) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit(subjectId)
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnit(subjectId)
  const { mutateAsync: updateTopics } = useUpdateTopics(subjectId)
  const { mutateAsync: deleteTopics } = useDeleteTopics(subjectId)
  
  // Unit edit state
  const [editTitle, setEditTitle] = useState(unit.title)
  const [oldTopics, setOldTopics] = useState([])
  const [newTopics, setNewTopics] = useState([])
  const [unitError, setUnitError] = useState('')

  const handleEditClick = () => {
    setEditTitle(unit.title)
    setOldTopics(unit.topics.map(t => ({ ...t })))
    setNewTopics([])
    setUnitError('')
    setIsEditing(true)
  }

  const handleUnitDelete = async (e) => {
    e.stopPropagation()
    try {
      await deleteUnit(unit.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUnitSave = async () => {
    if (!editTitle.trim()) {
      setUnitError('Unit title cannot be empty.')
      return
    }
    
    for (const t of oldTopics) {
      if (!t.title.trim()) {
        setUnitError('Topic titles cannot be empty.')
        return
      }
    }

    const changedOldTopics = oldTopics.filter(ot => {
       const original = unit.topics.find(ut => ut.id === ot.id)
       return original && original.title !== ot.title.trim()
    }).map(ot => ({ topicId: ot.id, title: ot.title.trim() }))
    
    const deletedTopicIds = unit.topics
      .map(ut => ut.id)
      .filter(id => !oldTopics.some(ot => ot.id === id))
    
    const cleanNewTopics = newTopics.filter(t => t.title.trim())
    
    try {
      setUnitError('')
      const promises = []
      
      if (changedOldTopics.length > 0) {
        promises.push(updateTopics({ unitId: unit.id, topics: changedOldTopics }))
      }
      
      if (deletedTopicIds.length > 0) {
        promises.push(deleteTopics({ unitId: unit.id, topicIds: deletedTopicIds }))
      }
      
      promises.push(updateUnit({
        unitId: unit.id,
        data: {
          title: editTitle.trim(),
          topics: cleanNewTopics.map(t => ({ title: t.title.trim() }))
        }
      }))
      
      await Promise.all(promises)
      
      setIsEditing(false)
      setNewTopics([])
    } catch (err) {
      setUnitError(err?.response?.data?.message || 'Failed to update unit.')
    }
  }

  if (isEditing) {
    return (
      <div className="border border-green-200 dark:border-green-900/60 bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden animate-fade-in shadow-sm my-3">
        {/* Editor header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-[#052e16]/40 border-b border-green-200 dark:border-green-900/60">
          <Layers size={14} className="text-green-500 shrink-0" />
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Unit title"
            className="flex-1 bg-white dark:bg-[#111] border border-green-200 dark:border-green-900/60 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <button
            onClick={() => {
              setIsEditing(false)
              setEditTitle(unit.title)
              setNewTopics([])
              setUnitError('')
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-2 py-1 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUnitSave}
            disabled={isUpdating}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={12} />
            {isUpdating ? 'Saving…' : 'Save'}
          </button>
        </div>

        {unitError && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-xs flex items-center gap-1 border-b border-red-100">
             <AlertCircle size={12} /> {unitError}
          </div>
        )}

        <div className="px-4 py-3 space-y-2">
          {/* Old Topics (Editable inline with topic controller) */}
          {oldTopics.map((t, idx) => (
            <div key={t.id} className="flex items-center gap-2">
              <BookOpen size={12} className="text-gray-400 shrink-0 ml-4" />
              <input
                type="text"
                value={t.title}
                onChange={(e) => {
                   const arr = [...oldTopics]
                   arr[idx].title = e.target.value
                   setOldTopics(arr)
                }}
                placeholder="Topic title"
                className="flex-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] focus:border-green-200 dark:focus:border-green-800 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              />
              <button
                 onClick={() => setOldTopics(oldTopics.filter((_, i) => i !== idx))}
                 className="text-gray-400 hover:text-red-500 transition-colors"
              >
                 <X size={14} />
              </button>
            </div>
          ))}

          {/* New Topics (Editable) */}
          {newTopics.map((nt, idx) => (
             <div key={idx} className="flex items-center gap-2 animate-fade-in">
               <BookOpen size={12} className="text-green-500 shrink-0 ml-4" />
               <input
                 type="text"
                 value={nt.title}
                 onChange={(e) => {
                   const arr = [...newTopics]
                   arr[idx].title = e.target.value
                   setNewTopics(arr)
                 }}
                 placeholder="New topic title"
                 className="flex-1 bg-white dark:bg-[#111] border border-green-200 dark:border-green-900/60 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
               />
               <button
                 onClick={() => setNewTopics(newTopics.filter((_, i) => i !== idx))}
                 className="text-gray-400 hover:text-red-500 transition-colors"
               >
                 <X size={14} />
               </button>
             </div>
          ))}

          <button
            onClick={() => setNewTopics([...newTopics, { title: '' }])}
            className="ml-10 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors flex items-center gap-1 py-1 mt-1"
          >
            <Plus size={11} />
            Add new topic
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden group">
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-3 text-left outline-none"
        >
          <Layers size={15} className="text-green-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{unit.title}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditClick}
            className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
            title="Edit Unit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleUnitDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Unit"
          >
            <Trash2 size={14} />
          </button>
          <button onClick={() => setOpen(o => !o)} className="ml-1 p-1 outline-none text-gray-400">
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a] bg-gray-50 dark:bg-[#111] animate-fade-in">
          {unit.topics.length === 0 && (
             <div className="px-10 py-3 text-xs text-gray-400 italic">No topics in this unit.</div>
          )}
          {unit.topics.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-10 py-2.5 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
              <BookOpen size={12} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Draft unit editor ────────────────────────────────────────────────────────
function DraftUnitEditor({ unit, onChange, onRemove }) {
  const updateTitle = (val) => onChange({ ...unit, title: val })
  const updateTopic = (ti, val) => {
    const topics = unit.topics.map((t, idx) => idx === ti ? { title: val } : t)
    onChange({ ...unit, topics })
  }
  const addTopic = () => {
    onChange({ ...unit, topics: [...unit.topics, { title: '' }] })
  }
  const removeTopic = (ti) => onChange({ ...unit, topics: unit.topics.filter((_, idx) => idx !== ti) })

  return (
    <div className="border border-green-200 dark:border-green-900/60 bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden">
      {/* Unit header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-[#052e16]/40 border-b border-green-200 dark:border-green-900/60">
        <Layers size={14} className="text-green-500 shrink-0" />
        <input
          type="text"
          value={unit.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Unit title"
          className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-lg"
          title="Remove unit"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Topics */}
      <div className="px-4 py-2 space-y-1.5">
        {unit.topics.map((topic, ti) => (
          <div key={ti} className="flex items-center gap-2">
            <BookOpen size={12} className="text-gray-400 shrink-0 ml-4" />
            <input
              type="text"
              value={topic.title}
              onChange={(e) => updateTopic(ti, e.target.value)}
              placeholder="Topic title"
              className="flex-1 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
            />
            {unit.topics.length > 1 && (
              <button
                onClick={() => removeTopic(ti)}
                className="text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-500 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTopic}
          className="ml-10 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors flex items-center gap-1 py-1"
        >
          <Plus size={11} />
          Add topic
        </button>
      </div>
    </div>
  )
}

// ─── How many units modal ─────────────────────────────────────────────────────
function HowManyModal({ isOpen, onClose, onConfirm, existingCount }) {
  const [count, setCount] = useState(1)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add units">
      <div className="space-y-4 pt-1">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          How many units do you want to add? We'll pre-fill the titles for you — you can edit them before saving.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCount(c => Math.max(1, c - 1))}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors text-lg font-bold"
          >
            −
          </button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">{count}</span>
          <button
            onClick={() => setCount(c => Math.min(10, c + 1))}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors text-lg font-bold"
          >
            +
          </button>
          <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">
            unit{count !== 1 ? 's' : ''} starting from Unit {existingCount + 1}
          </span>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(count); onClose() }}
            className="flex-1 px-4 py-2.5 text-sm text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UnitsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: subject, isLoading, isError } = useTeacherSubjectDetail(Number(id))
  const { mutateAsync: saveBulk, isPending: isSaving } = useBulkAddUnits(Number(id))

  const [drafts, setDrafts] = useState([])
  const [showHowMany, setShowHowMany] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const existingCount = subject?.units?.length ?? 0

  const openAddModal = () => {
    setError('')
    setSuccess('')
    setShowHowMany(true)
  }

  const handleHowManyConfirm = (count) => {
    const existingCount = subject?.units?.length ?? 0
    const newUnits = buildDefaultUnits(count, existingCount + drafts.length)
    setDrafts(prev => [...prev, ...newUnits])
  }

  const updateDraft = (i, updated) => setDrafts(prev => prev.map((d, idx) => idx === i ? updated : d))
  const removeDraft = (i) => setDrafts(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    // Strip fully-untouched placeholder drafts
    const isUntouched = (u) => {
      const titleIsDefault = u.title.trim() === `Unit ${u._unitNum} -` || u.title.trim() === `Unit ${u._unitNum} - ` || u.title.trim() === ''
      const topicsAreDefault = u.topics.every((t) => t.title.trim() === '')
      return titleIsDefault && topicsAreDefault
    }
    const active = drafts.filter(u => !isUntouched(u))
    if (active.length === 0) { setError('Please fill in at least one unit before saving.'); return }

    // Validate
    const existingTitlesLower = new Set((subject?.units ?? []).map(u => u.title.trim().toLowerCase()))
    for (const u of active) {
      const t = u.title.trim()
      if (!t) { setError('All units must have a title.'); return }
      if (existingTitlesLower.has(t.toLowerCase())) {
        setError(`A unit named "${t}" already exists in this subject.`); return
      }
    }
    // Check duplicates within the new batch itself
    const newTitles = active.map(u => u.title.trim().toLowerCase())
    const hasDupUnit = newTitles.some((t, i) => newTitles.indexOf(t) !== i)
    if (hasDupUnit) { setError('Two of the new units share the same name — rename one.'); return }

    // Topic validation
    for (const u of active) {
      const topicTitles = u.topics.map(t => t.title.trim())
      for (const tt of topicTitles) {
        if (!tt) { setError(`Unit "${u.title.trim()}" has an empty topic — fill it in or remove it.`); return }
      }
      const topicLower = topicTitles.map(t => t.toLowerCase())
      const hasDupTopic = topicLower.some((t, i) => topicLower.indexOf(t) !== i)
      if (hasDupTopic) { setError(`Unit "${u.title.trim()}" has two topics with the same name — rename one.`); return }
    }

    setError('')
    try {
      await saveBulk(active.map(u => ({
        title: u.title.trim(),
        topics: u.topics.map(t => ({ title: t.title.trim() })),
      })))
      setDrafts([])
      setSuccess(`${active.length} unit${active.length !== 1 ? 's' : ''} added successfully.`)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save units. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(`/subjects/${id}`)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center gap-1 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          {subject?.name ?? 'Subject'}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manage Units</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Add units and topics to organise your curriculum.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Add units
          </button>
        </div>

        {/* Banners */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-4 animate-slide-up">
            <AlertCircle size={15} className="shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100"><X size={13} /></button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 bg-green-50 dark:bg-[#052e16]/60 border border-green-200 dark:border-green-900/50 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400 mb-4 animate-slide-up">
            <CheckCircle2 size={15} className="shrink-0" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto opacity-50 hover:opacity-100"><X size={13} /></button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-14 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl" />
            ))}
          </div>
        )}

        {/* Error loading */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={15} />
            Failed to load subject. Go back and try again.
          </div>
        )}

        {/* Existing units */}
        {subject && (
          <div className="space-y-3 mb-6">
            {subject.units?.length === 0 && drafts.length === 0 && (
              <div className="border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl px-6 py-10 text-center bg-white dark:bg-[#1a1a1a]">
                <Layers size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No units yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Click "Add units" above to get started.</p>
              </div>
            )}
            {subject.units?.map(unit => (
              <ExistingUnitRow key={unit.id} unit={unit} subjectId={subject.id} />
            ))}
          </div>
        )}

        {/* Draft units */}
        {drafts.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500">
              New — not saved yet
            </p>
            {drafts.map((draft, i) => (
              <DraftUnitEditor
                key={i}
                unit={draft}
                onChange={(updated) => updateDraft(i, updated)}
                onRemove={() => removeDraft(i)}
              />
            ))}

            {/* Save / discard */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setDrafts([]); setError('') }}
                className="flex-1 border border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : `Save ${drafts.length} unit${drafts.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* How many units modal */}
        <HowManyModal
          isOpen={showHowMany}
          onClose={() => setShowHowMany(false)}
          onConfirm={handleHowManyConfirm}
          existingCount={existingCount + drafts.length}
        />
      </div>
    </div>
  )
}
