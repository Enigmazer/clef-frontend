import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Save, X, BookOpen, Layers } from 'lucide-react'
import { useReorderUnits } from '../../hooks/useUnits'

// Sortable Item Component for Topics
function SortableTopicItem({ topic, unitId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `topic-${unitId}-${topic.id}`,
    data: { type: 'Topic', topic, unitId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-lg mb-2 shadow-sm relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 -ml-2"
      >
        <GripVertical size={16} />
      </div>
      <BookOpen size={14} className="text-gray-400 shrink-0" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
        {topic.title}
      </span>
    </div>
  )
}

// Sortable Item Component for Units
function SortableUnitItem({ unit, topics }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `unit-${unit.id}`,
    data: { type: 'Unit', unit },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  }

  const topicIds = useMemo(() => topics.map(t => `topic-${unit.id}-${t.id}`), [topics, unit.id])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden bg-gray-50 dark:bg-[#111] mb-4"
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a]">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 -ml-2"
        >
          <GripVertical size={18} />
        </div>
        <Layers size={16} className="text-green-500 shrink-0" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">
          {unit.title}
        </span>
      </div>

      <div className="p-4 pl-12">
        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {topics.map(topic => (
              <SortableTopicItem key={`topic-${unit.id}-${topic.id}`} topic={topic} unitId={unit.id} />
            ))}
            {topics.length === 0 && (
              <p className="text-xs text-gray-400 italic">No topics to reorder.</p>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export default function ReorderUnitsView({ subject, onCancel, onSuccess }) {
  const [units, setUnits] = useState(() => {
    // Clone units and topics deeply
    return subject.units.map(u => ({
      ...u,
      topics: u.topics.map(t => ({ ...t })),
    }))
  })
  
  const [activeId, setActiveId] = useState(null)
  const [activeData, setActiveData] = useState(null)
  const { mutateAsync: reorder, isPending } = useReorderUnits(subject.id)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    setActiveData(active.data.current)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    setActiveData(null)

    if (!over) return

    if (active.id !== over.id) {
      const activeType = active.data.current?.type
      const overType = over.data.current?.type

      // Only allow Unit-to-Unit and Topic-to-Topic reordering
      if (activeType === 'Unit' && overType === 'Unit') {
        setUnits((items) => {
          const oldIndex = items.findIndex(item => `unit-${item.id}` === active.id)
          const newIndex = items.findIndex(item => `unit-${item.id}` === over.id)
          return arrayMove(items, oldIndex, newIndex)
        })
      } else if (activeType === 'Topic' && overType === 'Topic') {
        const activeUnitId = active.data.current?.unitId
        const overUnitId = over.data.current?.unitId

        // Only allow topic reordering within the same unit
        if (activeUnitId === overUnitId) {
          setUnits((items) => {
            const unitIndex = items.findIndex(u => u.id === activeUnitId)
            const unit = items[unitIndex]
            
            const oldIndex = unit.topics.findIndex(t => `topic-${unit.id}-${t.id}` === active.id)
            const newIndex = unit.topics.findIndex(t => `topic-${unit.id}-${t.id}` === over.id)
            
            const newTopics = arrayMove(unit.topics, oldIndex, newIndex)
            
            const newUnits = [...items]
            newUnits[unitIndex] = { ...unit, topics: newTopics }
            return newUnits
          })
        }
      }
    }
  }

  const handleSave = async () => {
    setError('')
    
    // Compute diff
    const changedUnits = []
    
    units.forEach((newUnit, uIndex) => {
      const origUnitIndex = subject.units.findIndex(u => u.id === newUnit.id)
      const origUnit = subject.units[origUnitIndex]
      
      let unitChanged = false
      const changedTopics = []
      
      if (origUnitIndex !== uIndex) {
        unitChanged = true
      }
      
      newUnit.topics.forEach((newTopic, tIndex) => {
        const origTopicIndex = origUnit.topics.findIndex(t => t.id === newTopic.id)
        if (origTopicIndex !== tIndex) {
          changedTopics.push({
            id: newTopic.id,
            orderIndex: tIndex
          })
        }
      })
      
      if (unitChanged || changedTopics.length > 0) {
        changedUnits.push({
          id: newUnit.id,
          orderIndex: uIndex,
          topics: changedTopics
        })
      }
    })
    
    if (changedUnits.length === 0) {
      onCancel() // No changes, just exit
      return
    }

    try {
      await reorder(changedUnits)
      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save new order.')
    }
  }

  const unitIds = useMemo(() => units.map(u => `unit-${u.id}`), [units])

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  return (
    <div className="animate-fade-in mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div>
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <GripVertical size={16} /> Reorder Mode
          </h2>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Drag and drop units or topics to change their order.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {isPending ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {units.map((unit) => (
              <SortableUnitItem key={`unit-${unit.id}`} unit={unit} topics={unit.topics} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            activeData?.type === 'Unit' ? (
              <div className="border border-blue-400 dark:border-blue-500 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#111] shadow-xl rotate-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#2a2a2a]">
                  <div className="text-gray-400 p-1 -ml-2"><GripVertical size={18} /></div>
                  <Layers size={16} className="text-green-500 shrink-0" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">
                    {activeData.unit.title}
                  </span>
                </div>
              </div>
            ) : activeData?.type === 'Topic' ? (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-blue-400 dark:border-blue-500 rounded-lg shadow-xl rotate-2">
                <div className="text-gray-400 p-1 -ml-2"><GripVertical size={16} /></div>
                <BookOpen size={14} className="text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {activeData.topic.title}
                </span>
              </div>
            ) : null
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
