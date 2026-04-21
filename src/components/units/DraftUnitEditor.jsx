import { Layers, Trash2, BookOpen, X, Plus } from 'lucide-react'

export default function DraftUnitEditor({ unit, onChange, onRemove }) {
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
