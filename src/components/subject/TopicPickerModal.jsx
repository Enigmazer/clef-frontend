import { CheckCircle2, Check, Circle } from 'lucide-react'
import Modal from '../../components/Modal'

export default function TopicPickerModal({ isOpen, onClose, units, mode, onPick, currentId, nextId }) {
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
