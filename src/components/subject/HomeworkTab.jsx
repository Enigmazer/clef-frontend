import { useState, useMemo } from 'react'
import { Plus, Clock, FileText, ChevronLeft, ChevronRight, AlertCircle, Layers, Pencil, Trash2 } from 'lucide-react'
import { useHomeworkPage, useCreateHomework, useUpdateHomework, useDeleteHomework } from '../../hooks/useSubjects'
import Modal from '../Modal'
import ConfirmModal from '../ConfirmModal'
import { formatDate, getErrorMsg } from './helpers'

// Captured once at module load — safe to use during render (not impure)
const MODULE_NOW = Date.now()

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Given a flat list of HomeworkTopicResponse objects ({ id, title }) and the
 * full units array from the subject, return groups:
 *   [{ unit: { id, title }, topics: [{ id, title }, ...] }, ...]
 * Topics that cannot be matched to any unit fall into an "Other" group.
 */
function groupTopicsByUnit(hwTopics, units) {
  if (!hwTopics?.length) return []

  // Build a lookup: topicId → unit
  const topicUnitMap = new Map()
  for (const unit of units ?? []) {
    for (const topic of unit.topics ?? []) {
      topicUnitMap.set(topic.id, unit)
    }
  }

  const groups = new Map() // unitId → { unit, topics[] }
  const orphans = []

  for (const topic of hwTopics) {
    const unit = topicUnitMap.get(topic.id)
    if (unit) {
      if (!groups.has(unit.id)) groups.set(unit.id, { unit, topics: [] })
      groups.get(unit.id).topics.push(topic)
    } else {
      orphans.push(topic)
    }
  }

  const result = Array.from(groups.values())
  if (orphans.length > 0) {
    result.push({ unit: { id: -1, title: 'Other' }, topics: orphans })
  }
  return result
}

// ─── HomeworkCard ─────────────────────────────────────────────────────────────

function HomeworkCard({ hw, units, isTeacher, onEdit, onDelete }) {
  const topicGroups = useMemo(
    () => groupTopicsByUnit(hw.topics, units),
    [hw.topics, units]
  )

  const now = MODULE_NOW
  const dueMs = new Date(hw.dueDate).getTime()
  const nowDate = new Date(now)
  const dueDateObj = new Date(hw.dueDate)
  
  const isDueToday = dueDateObj.toDateString() === nowDate.toDateString()
  const isOverdue = dueMs < now && !isDueToday

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header strip */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{hw.title}</h3>
          {hw.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 whitespace-pre-wrap leading-relaxed">
              {hw.description}
            </p>
          )}
          {hw.createdAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2.5 font-medium">
              Assigned on {formatDate(hw.createdAt)}
            </p>
          )}
        </div>

        {/* Due date badge & Actions */}
        <div className="shrink-0 flex flex-col items-end">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
            isOverdue
              ? 'bg-gray-50 dark:bg-[#222] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#333]'
              : isDueToday
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-900/40'
              : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40'
          }`}>
            <Clock size={12} />
            {isOverdue ? 'Overdue · ' : isDueToday ? 'Due today · ' : 'Due '}
            {formatDate(hw.dueDate)}
          </div>
          {isTeacher && (
            <div className="flex items-center gap-1.5 mt-2">
              {!isOverdue && (
                <button
                  onClick={() => onEdit(hw)}
                  className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                  title="Edit Homework"
                >
                  <Pencil size={13} />
                </button>
              )}
              <button
                onClick={() => onDelete(hw.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Delete Homework"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topics grouped by unit */}
      {topicGroups.length > 0 && (
        <div className="border-t border-gray-100 dark:border-[#222] px-5 py-4 bg-gray-50/60 dark:bg-[#111]/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Related Topics
          </p>
          <div className="space-y-3">
            {topicGroups.map(({ unit, topics }) => (
              <div key={unit.id}>
                {/* Unit label */}
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers size={11} className="text-green-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {unit.title}
                  </span>
                </div>
                {/* Topics as pills */}
                <div className="flex flex-wrap gap-1.5 pl-4">
                  {topics.map(t => (
                    <span
                      key={t.id}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2a2a2a] rounded-lg shadow-sm"
                    >
                      {t.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HomeworkTab ──────────────────────────────────────────────────────────────

export default function HomeworkTab({ subjectId, isTeacher, units = [] }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('upcoming')
  const { data: homeworkPage, isLoading } = useHomeworkPage(subjectId, page, filter)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)

  const [deleteId, setDeleteId] = useState(null)
  const deleteMutation = useDeleteHomework(subjectId)

  const handleEdit = (hw) => {
    setEditData(hw)
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditData(null)
    setShowModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      setDeleteId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="py-2 animate-fade-in">
      <div className="flex sm:items-center justify-between mb-4 flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">Homework</h2>
          
          {/* Segmented Control for Filters */}
          <div className="flex items-center bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-xl">
            <button
              onClick={() => { setFilter('upcoming'); setPage(0); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === 'upcoming' 
                  ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => { setFilter('past'); setPage(0); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === 'past' 
                  ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={handleCreate}
            className="flex items-center shrink-0 justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> New Homework
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-24 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl" />
          <div className="h-24 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl" />
        </div>
      ) : homeworkPage?.content?.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl px-6 py-10 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No homework yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isTeacher
              ? 'Create the first homework assignment for your students.'
              : "Your teacher hasn't assigned any homework yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkPage?.content?.map(hw => (
            <HomeworkCard key={hw.id} hw={hw} units={units} isTeacher={isTeacher} onEdit={handleEdit} onDelete={setDeleteId} />
          ))}

          {/* Pagination */}
          {homeworkPage && homeworkPage.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={homeworkPage.page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Page {homeworkPage.page + 1} of {homeworkPage.totalPages}
              </span>
              <button
                disabled={homeworkPage.last}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] rounded-lg disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {isTeacher && (
        <HomeworkModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditData(null); }}
          subjectId={subjectId}
          units={units}
          editData={editData}
        />
      )}

      {isTeacher && (
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Delete Homework"
          message="Are you sure you want to delete this homework? This action cannot be undone."
          confirmText="Delete"
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

// ─── HomeworkModal ──────────────────────────────────────────────────────

function HomeworkModal({ isOpen, onClose, subjectId, units, editData }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selectedTopics, setSelectedTopics] = useState(new Set())
  const [error, setError] = useState('')
  const [topicsTouched, setTopicsTouched] = useState(false)

  const createMutation = useCreateHomework(subjectId)
  const updateMutation = useUpdateHomework(subjectId)

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevEditData, setPrevEditData] = useState(editData)

  if (isOpen !== prevIsOpen || editData !== prevEditData) {
    setPrevIsOpen(isOpen)
    setPrevEditData(editData)
    if (isOpen) {
      if (editData) {
        setTitle(editData.title)
        setDescription(editData.description || '')
        const dDate = editData.dueDate ? editData.dueDate.split('T')[0] : ''
        setDueDate(dDate)
        setSelectedTopics(new Set(editData.topics?.map(t => t.id) || []))
      } else {
        setTitle('')
        setDescription('')
        setDueDate('')
        setSelectedTopics(new Set())
      }
      setError('')
      setTopicsTouched(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('Title is required.')
    if (!dueDate) return setError('Due date is required.')

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: new Date(`${dueDate}T23:59:59.999`).toISOString(),
        topicIds: topicsTouched ? Array.from(selectedTopics) : null,
      }

      if (editData) {
        await updateMutation.mutateAsync({ homeWorkId: editData.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError(getErrorMsg(err))
    }
  }

  const toggleTopic = (topicId, checked) => {
    setTopicsTouched(true)
    setSelectedTopics(prev => {
      const next = new Set(prev)
      if (checked) next.add(topicId)
      else next.delete(topicId)
      return next
    })
  }

  const toggleUnit = (unit, checked) => {
    setTopicsTouched(true)
    setSelectedTopics(prev => {
      const next = new Set(prev)
      for (const topic of unit.topics ?? []) {
        if (checked) next.add(topic.id)
        else next.delete(topic.id)
      }
      return next
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Homework" : "Create Homework"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-3 rounded-xl text-sm">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Read Chapter 4 and Answer Questions"
            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Description <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Instructions or additional details…"
            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow text-gray-900 dark:text-white placeholder-gray-400 resize-none"
          />
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-shadow text-gray-900 dark:text-white"
          />
        </div>

        {/* Related topics — grouped by unit, with per-unit select-all */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Related Topics <span className="text-gray-400 text-xs font-normal">(optional)</span>
          </label>
          <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl bg-gray-50 dark:bg-[#111] overflow-hidden">
            {(!units || units.length === 0) ? (
              <p className="text-xs text-gray-400 italic p-4">No topics available in this subject.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-[#222]">
                {units.map(unit => {
                  const allSelected = unit.topics?.every(t => selectedTopics.has(t.id)) ?? false
                  const someSelected = unit.topics?.some(t => selectedTopics.has(t.id)) ?? false
                  return (
                    <div key={unit.id}>
                      {/* Unit header with select-all checkbox */}
                      <label className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-[#1a1a1a] cursor-pointer group hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                          onChange={e => toggleUnit(unit, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Layers size={12} className="text-green-500 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          {unit.title}
                        </span>
                      </label>
                      {/* Topic checkboxes */}
                      {unit.topics?.map(topic => (
                        <label
                          key={topic.id}
                          className="flex items-start gap-2.5 px-4 py-2 pl-10 cursor-pointer hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTopics.has(topic.id)}
                            onChange={e => toggleTopic(topic.id, e.target.checked)}
                            className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{topic.title}</span>
                        </label>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {selectedTopics.size > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">
              {selectedTopics.size} topic{selectedTopics.size > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-1 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] border border-gray-200 dark:border-[#333] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving…' : editData ? 'Save Changes' : 'Create Homework'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
