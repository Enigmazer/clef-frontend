import { useState } from 'react'
import {
  Layers, ChevronDown, ChevronRight, Edit2, Trash2, Plus, AlertCircle, Save, BookOpen, X
} from 'lucide-react'
import { useUpdateUnit, useDeleteUnit } from '../../hooks/useUnits'
import { useUpdateTopics, useDeleteTopics, useDeleteTopicMaterials, useUploadTopicMaterial } from '../../hooks/useTopics'
import TopicMaterialPill from '../TopicMaterialPill'
import ConfirmModal from '../ConfirmModal'
import UploadContentModal from './UploadContentModal'

export default function ExistingUnitRow({ subjectId, unit }) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const { mutateAsync: updateUnit, isPending: isUpdating } = useUpdateUnit(subjectId)
  const { mutateAsync: deleteUnit, isPending: isDeleting } = useDeleteUnit(subjectId)
  const { mutateAsync: updateTopics } = useUpdateTopics(subjectId)
  const { mutateAsync: deleteTopics } = useDeleteTopics(subjectId)
  const deleteMaterialMutation = useDeleteTopicMaterials(subjectId)
  const uploadMaterialMutation = useUploadTopicMaterial(subjectId)

  // Material selection state
  const [selectedMaterials, setSelectedMaterials] = useState({})

  // Unit edit state
  const [editTitle, setEditTitle] = useState(unit.title)
  const [oldTopics, setOldTopics] = useState([])
  const [newTopics, setNewTopics] = useState([])
  const [unitError, setUnitError] = useState('')

  // Confirm states
  const [confirmUnitDeleteOpen, setConfirmUnitDeleteOpen] = useState(false)
  const [topicToDeleteIndex, setTopicToDeleteIndex] = useState(null)
  const [isConfirmingSaveDeletions, setIsConfirmingSaveDeletions] = useState(false)

  const materialsToDeleteCount = Object.values(selectedMaterials).flat().length

  const handleEditClick = () => {
    setEditTitle(unit.title)
    setOldTopics(unit.topics.map(t => ({ ...t })))
    setNewTopics([])
    setUnitError('')
    setIsEditing(true)
  }

  const handleUnitDelete = async (e) => {
    e.stopPropagation()
    setConfirmUnitDeleteOpen(true)
  }

  const confirmUnitDeletion = async () => {
    try {
      await deleteUnit(unit.id)
      setConfirmUnitDeleteOpen(false)
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

    if (materialsToDeleteCount > 0 && !isConfirmingSaveDeletions) {
      setIsConfirmingSaveDeletions(true)
      return
    }

    try {
      setUnitError('')
      const promises = []

      if (changedOldTopics.length > 0) {
        promises.push(updateTopics({ unitId: unit.id, topics: changedOldTopics }))
      }

      if (deletedTopicIds.length > 0) {
        promises.push(deleteTopics({ unitId: unit.id, topicIds: deletedTopicIds }))
      }

      // Add material deletions (skipping topics that are already entirely deleted)
      Object.entries(selectedMaterials).forEach(([topicId, matIds]) => {
        if (matIds.length > 0 && !deletedTopicIds.includes(topicId)) {
          promises.push(deleteMaterialMutation.mutateAsync({ unitId: unit.id, topicId, materialIds: matIds }))
        }
      })

      promises.push(updateUnit({
        unitId: unit.id,
        data: {
          title: editTitle.trim(),
          topics: cleanNewTopics.map(t => ({ title: t.title.trim() }))
        }
      }))

      await Promise.all(promises)

      setIsConfirmingSaveDeletions(false)
      setSelectedMaterials({})
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 sm:px-4 py-3 bg-green-50 dark:bg-[#052e16]/40 border-b border-green-200 dark:border-green-900/60">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Layers size={14} className="text-green-500 shrink-0" />
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Unit title"
              className="flex-1 bg-white dark:bg-[#111] border border-green-200 dark:border-green-900/60 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 min-w-0"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
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
        </div>

        {unitError && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-xs flex items-center gap-1 border-b border-red-100">
            <AlertCircle size={12} /> {unitError}
          </div>
        )}

        <div className="px-4 py-3 space-y-2">
          {/* Old Topics (Editable inline with topic controller) */}
          {oldTopics.map((t, idx) => (
            <div key={t.id} className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
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
                  onClick={() => {
                    const original = unit.topics.find(ut => ut.id === t.id);
                    if (original && original.topicMaterials && original.topicMaterials.length > 0) {
                      setTopicToDeleteIndex(idx);
                    } else {
                      setOldTopics(oldTopics.filter((_, i) => i !== idx));
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {t.topicMaterials && t.topicMaterials.length > 0 && (
                <div className="pl-9 pr-8">
                  <div className="flex items-center justify-between mb-1.5 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Materials <span className="normal-case font-medium ml-1 text-gray-300 dark:text-gray-600">(Select to delete)</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {t.topicMaterials.map(mat => (
                      <TopicMaterialPill
                        key={mat.id}
                        subjectId={subjectId}
                        unitId={unit.id}
                        topicId={t.id}
                        material={mat}
                        onSelect={(matId) => {
                          setSelectedMaterials(prev => {
                            const arr = prev[t.id] || [];
                            return { ...prev, [t.id]: arr.includes(matId) ? arr.filter(id => id !== matId) : [...arr, matId] }
                          })
                        }}
                        isSelected={selectedMaterials[t.id]?.includes(mat.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
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

        <ConfirmModal
          isOpen={isConfirmingSaveDeletions}
          onClose={() => setIsConfirmingSaveDeletions(false)}
          onConfirm={handleUnitSave}
          title="Save with Deletions"
          message={`You have selected ${materialsToDeleteCount} material(s) for deletion. Saving now will permanently remove them. Are you sure?`}
          confirmText="Save & Delete"
          loading={isUpdating || deleteMaterialMutation.isPending}
        />

        <ConfirmModal
          isOpen={topicToDeleteIndex !== null}
          onClose={() => setTopicToDeleteIndex(null)}
          onConfirm={() => {
            setOldTopics(oldTopics.filter((_, i) => i !== topicToDeleteIndex))
            setTopicToDeleteIndex(null)
          }}
          title="Remove Topic"
          message="This topic contains materials. Removing it will permanently delete all of its materials when you save. This action cannot be undone."
          confirmText="Remove"
        />
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden group">
      <div className="w-full flex items-stretch justify-between bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-3 px-3 sm:px-4 py-3.5 text-left outline-none min-w-0"
        >
          <Layers size={15} className="text-green-500 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0 flex-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{unit.title}</span>
            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''}
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1 sm:gap-2 pr-3 sm:pr-4 py-3.5 pl-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setUploadModalOpen(true); }}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            title="Add Content"
          >
            <Plus size={13} className="shrink-0" />
            <span className="hidden sm:inline">Add Content</span>
          </button>
          <button
            onClick={handleEditClick}
            className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 sm:ml-1"
            title="Edit Unit"
          >
            <Edit2 size={14} className="shrink-0" />
          </button>
          <button
            onClick={handleUnitDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
            title="Delete Unit"
          >
            <Trash2 size={14} className="shrink-0" />
          </button>
          <button onClick={() => setOpen(o => !o)} className="sm:ml-1 p-1 outline-none text-gray-400">
            {open ? <ChevronDown size={15} className="shrink-0" /> : <ChevronRight size={15} className="shrink-0" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a] bg-gray-50 dark:bg-[#111] animate-fade-in">
          {unit.topics.length === 0 && (
            <div className="px-10 py-3 text-xs text-gray-400 italic">No topics in this unit.</div>
          )}
          {unit.topics.map(t => (
            <div key={t.id} className="flex flex-col px-10 py-3 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors border-b border-gray-100 dark:border-[#2a2a2a] last:border-0 border-opacity-50">
              <div className="flex items-center gap-3">
                <BookOpen size={12} className="text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.title}</span>
              </div>

              {t.topicMaterials && t.topicMaterials.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2 pl-6">
                  {t.topicMaterials.map(mat => (
                    <TopicMaterialPill
                      key={mat.id}
                      subjectId={subjectId}
                      unitId={unit.id}
                      topicId={t.id}
                      material={mat}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <UploadContentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        unit={unit}
        uploadMaterialMutation={uploadMaterialMutation}
      />
      <ConfirmModal
        isOpen={confirmUnitDeleteOpen}
        onClose={() => setConfirmUnitDeleteOpen(false)}
        onConfirm={confirmUnitDeletion}
        title="Delete Unit"
        message="Are you sure you want to delete this unit? All topics and their associated materials will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  )
}
