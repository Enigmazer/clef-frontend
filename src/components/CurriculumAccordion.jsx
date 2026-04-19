import { useState } from 'react'
import { ChevronDown, ChevronRight, Layers } from 'lucide-react'
import TopicMaterialPill from './TopicMaterialPill'

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDate(instant) {
  if (!instant) return '—'
  return new Date(instant).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── TopicRow ─────────────────────────────────────────────────────────────────
// Props:
//   topic           – topic object
//   isCurrent       – bool
//   isNext          – bool
//   isDone          – bool
//   subjectId       – number
//   unitId          – number
//   isArchived      – bool (teacher only, optional)
//   onToggleComplete– (unitId, topicId) => void (teacher only, optional)
function TopicRow({ topic, isCurrent, isNext, isDone, subjectId, unitId, isArchived, onToggleComplete }) {
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const isTeacher = typeof onToggleComplete === 'function'

  return (
    <div className={`flex flex-col ${
      isCurrent ? 'bg-green-50 dark:bg-[#052e16]/50'
      : isNext   ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
    }`}>
      <div
        className="flex items-start gap-4 px-10 py-3 cursor-pointer group/row hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
        onClick={() => setMaterialsOpen(o => !o)}
      >
        <div className="flex flex-col flex-1 min-w-0 pr-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-sm ${
                isDone    ? 'text-gray-400 dark:text-gray-500 line-through'
                : isCurrent ? 'text-green-700 dark:text-green-400 font-medium'
                : 'text-gray-700 dark:text-gray-300'
              }`}>{topic.title}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Teacher-only: mark complete/incomplete button */}
              {isTeacher && !isArchived && (
                <div className="opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center pr-3 border-r border-gray-200 dark:border-[#333]">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(unitId, topic.id) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isDone
                        ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                    }`}
                  >
                    {isDone ? 'Mark incomplete' : 'Mark complete'}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {isCurrent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md">
                    Current
                  </span>
                )}
                {isNext && !isCurrent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md">
                    Next
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(topic.completedAt)}</span>
                )}
              </div>

              <div className="text-gray-400 shrink-0 ml-1">
                {topic.topicMaterials?.length > 0 && (
                  materialsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />
                )}
              </div>
            </div>
          </div>

          {materialsOpen && topic.topicMaterials?.length > 0 && (
            <div className="flex flex-col gap-2 mt-4 mb-2" onClick={(e) => e.stopPropagation()}>
              {topic.topicMaterials.map(mat => (
                <TopicMaterialPill
                  key={mat.id}
                  subjectId={subjectId}
                  unitId={unitId}
                  topicId={topic.id}
                  material={mat}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── UnitAccordion ────────────────────────────────────────────────────────────
// Props:
//   unit            – unit object (with .topics array)
//   currentTopicId  – number | null
//   nextTopicId     – number | null
//   subjectId       – number
//   isArchived      – bool (teacher only, optional)
//   onToggleComplete– (unitId, topicId) => void (teacher only, optional)
export function UnitAccordion({ unit, currentTopicId, nextTopicId, subjectId, isArchived, onToggleComplete }) {
  const [open, setOpen] = useState(true)
  const completedCount = unit.topics.filter(t => t.completedAt).length

  return (
    <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden mb-3 last:mb-0">
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-3 flex-1 text-left outline-none"
        >
          <Layers size={15} className="text-green-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{unit.title}</span>
        </button>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-[#333] outline-none"
          >
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {completedCount}/{unit.topics.length} done
            </span>
            {open
              ? <ChevronDown size={15} className="text-gray-400" />
              : <ChevronRight size={15} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="divide-y divide-gray-100 dark:divide-[#2a2a2a] bg-gray-50 dark:bg-[#111] animate-fade-in">
          {unit.topics.length === 0 && (
            <p className="px-10 py-3 text-xs text-gray-400 italic">No topics in this unit.</p>
          )}
          {unit.topics.map(topic => (
            <TopicRow
              key={topic.id}
              topic={topic}
              isCurrent={topic.id === currentTopicId}
              isNext={topic.id === nextTopicId}
              isDone={!!topic.completedAt}
              subjectId={subjectId}
              unitId={unit.id}
              isArchived={isArchived}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
